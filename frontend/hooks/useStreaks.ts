import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { setUser } from "../redux/slices/userSlice";
import { RootState } from "../redux/rootReducer";
import type { Schema } from "../../backend/amplify/data/resource";

const client = generateClient<Schema>();

export interface UseStreaksReturn {
  currentStreak: number;
  maxStreak: number;
  loading: boolean;
  error: string | null;
  updateStreak: () => Promise<void>;
  refetch: () => Promise<void>;
  isAuthenticated: boolean;
}

export const useStreaks = (): UseStreaksReturn => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  // Get auth status from Redux
  const user = useSelector((state: RootState) => state.user);

  const calculateStreaks = async () => {
    // Don't calculate if user is not authenticated yet
    if (!user.isLoggedIn) {
      console.log("User not authenticated, skipping streak calculation");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user's Cognito ID
      const { userId } = await getCurrentUser();
      console.log("Current user ID:", userId);

      // Fetch current user profile to get existing max streak
      const { data: userProfile } = await client.models.UserProfile.get({
        id: userId,
      });

      console.log("Found user profile for streak calculation:", userProfile);

      const existingMaxStreak = userProfile?.maximumStreaks || 0;
      console.log("Existing max streak:", existingMaxStreak);

      // Fetch user's completed chapters, sorted by completion date
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: { creatorId: { eq: userId } },
          // Note: Add sorting in the query if the API supports it
        });

      if (!completedChapters || completedChapters.length === 0) {
        setCurrentStreak(0);
        setMaxStreak(existingMaxStreak);
        return;
      }

      // Sort by completion date (most recent first)
      const sortedCompletions = completedChapters
        .map((chapter) => ({
          date: chapter.completedAt.split("T")[0], // Extract date from datetime
          completedAt: new Date(chapter.completedAt),
        }))
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      // Remove duplicates (same date completions)
      const uniqueDates = Array.from(
        new Set(sortedCompletions.map((c) => c.date))
      ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      console.log("Unique completion dates:", uniqueDates);

      // Calculate current streak
      let current = 0;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      console.log("Today:", todayStr);
      console.log("Yesterday:", yesterdayStr);

      // Start checking from today if completed today, otherwise from yesterday
      let checkDate = new Date();
      let startFromToday = false;

      if (uniqueDates.includes(todayStr)) {
        // User completed today - start counting from today
        startFromToday = true;
        console.log("Starting streak count from today");
      } else if (uniqueDates.includes(yesterdayStr)) {
        // User completed yesterday but not today - start from yesterday
        checkDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        console.log("Starting streak count from yesterday");
      } else {
        // No recent completions - streak is broken
        console.log("No recent completions - streak is 0");
        setCurrentStreak(0);
        setMaxStreak(existingMaxStreak);
        return;
      }

      // Count consecutive days
      for (const dateStr of uniqueDates) {
        const expectedDateStr = checkDate.toISOString().split("T")[0];

        console.log(
          `Checking: completion date ${dateStr} vs expected ${expectedDateStr}`
        );

        if (dateStr === expectedDateStr) {
          current++;
          console.log(`✅ Match! Current streak: ${current}`);
          // Move to previous day
          checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
        } else {
          // No completion for this date - streak ends
          console.log(`❌ No completion for ${expectedDateStr} - streak ends`);
          break;
        }
      }

      console.log("Final current streak:", current);

      // Calculate maximum streak - simply compare current with existing max
      const newMaxStreak = Math.max(current, existingMaxStreak);

      setCurrentStreak(current);
      setMaxStreak(newMaxStreak);

      // Update UserProfile with the calculated streaks
      await updateUserProfileStreaks(userId, current, newMaxStreak);
    } catch (err) {
      console.error("Error calculating streaks:", err);
      setError(
        err instanceof Error ? err.message : "Failed to calculate streaks"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileStreaks = async (
    userId: string,
    streaks: number,
    maxStreaks: number
  ) => {
    try {
      console.log(
        `Attempting to update streaks: current=${streaks}, max=${maxStreaks} for userId=${userId}`
      );

      // Use Cognito user ID directly as the UserProfile id
      const { data: userProfile } = await client.models.UserProfile.get({
        id: userId,
      });

      console.log("Found user profile:", userProfile);

      if (userProfile) {
        console.log("Updating profile with id:", userProfile.id);

        // Update database using the Cognito user ID as the profile id
        const { data: updatedProfile } = await client.models.UserProfile.update(
          {
            id: userId,
            streaks,
            maximumStreaks: maxStreaks,
          }
        );

        console.log("Update result:", updatedProfile);

        // Update Redux state with new streak values
        if (updatedProfile) {
          dispatch(
            setUser({
              streaks,
              maximumStreaks: maxStreaks,
            })
          );
          console.log("Redux state updated with new streaks");
        }
      } else {
        console.error("No user profile found for userId:", userId);
      }
    } catch (err) {
      console.error("Error updating user profile streaks:", err);
    }
  };

  const updateStreak = async () => {
    await calculateStreaks();
  };

  const refetch = async () => {
    await calculateStreaks();
  };

  useEffect(() => {
    // Only calculate streaks when user is authenticated
    if (user.isLoggedIn) {
      console.log("User authenticated, calculating streaks");
      calculateStreaks();
    } else {
      console.log(
        "User not authenticated, skipping initial streak calculation"
      );
      setLoading(false);
    }
  }, [user.isLoggedIn]);

  return {
    currentStreak,
    maxStreak,
    loading,
    error,
    updateStreak,
    refetch,
    isAuthenticated: user.isLoggedIn, // Expose auth status
  };
};
