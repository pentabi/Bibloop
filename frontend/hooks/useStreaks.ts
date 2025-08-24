import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../backend/amplify/data/resource";

const client = generateClient<Schema>();

export interface UseStreaksReturn {
  currentStreak: number;
  maxStreak: number;
  loading: boolean;
  error: string | null;
  updateStreak: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useStreaks = (): UseStreaksReturn => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStreaks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's Cognito ID
      const { userId } = await getCurrentUser();

      // Fetch user's completed chapters, sorted by completion date
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: { creatorId: { eq: userId } },
          // Note: Add sorting in the query if the API supports it
        });

      if (!completedChapters || completedChapters.length === 0) {
        setCurrentStreak(0);
        setMaxStreak(0);
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

      // Calculate current streak
      let current = 0;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Check if streak is active (completed today or yesterday)
      if (
        uniqueDates.includes(todayStr) ||
        uniqueDates.includes(yesterdayStr)
      ) {
        let checkDate = uniqueDates.includes(todayStr)
          ? today
          : new Date(today.getTime() - 24 * 60 * 60 * 1000);

        for (const dateStr of uniqueDates) {
          const completionDate = new Date(dateStr);
          const expectedDateStr = checkDate.toISOString().split("T")[0];

          if (dateStr === expectedDateStr) {
            current++;
            checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000); // Go back one day
          } else {
            break; // Streak broken
          }
        }
      }

      // Calculate maximum streak
      let max = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      for (const dateStr of uniqueDates.reverse()) {
        // Process chronologically
        const currentDate = new Date(dateStr);

        if (lastDate === null) {
          tempStreak = 1;
        } else {
          const daysDiff = Math.floor(
            (currentDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
          );

          if (daysDiff === 1) {
            tempStreak++;
          } else {
            max = Math.max(max, tempStreak);
            tempStreak = 1;
          }
        }

        lastDate = currentDate;
      }

      max = Math.max(max, tempStreak);

      setCurrentStreak(current);
      setMaxStreak(max);

      // Update UserProfile with the calculated streaks
      await updateUserProfileStreaks(userId, current, max);
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
      // Since we're using Cognito user ID directly, the UserProfile ID should match
      const { data: userProfile } = await client.models.UserProfile.get({
        id: userId,
      });

      if (userProfile) {
        await client.models.UserProfile.update({
          id: userId,
          streaks,
          maximumStreaks: maxStreaks,
        });
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
    calculateStreaks();
  }, []);

  return {
    currentStreak,
    maxStreak,
    loading,
    error,
    updateStreak,
    refetch,
  };
};
