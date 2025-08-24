import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useStreaks } from "./useStreaks";
import type { Schema } from "../../backend/amplify/data/resource";

const client = generateClient<Schema>();

export interface CalendarChapter {
  id: string;
  date: string;
  bookName: string;
  chapterNumber: number;
  title?: string;
  description?: string;
  completed: boolean;
}

export interface UseCalendarReturn {
  chapters: Record<string, CalendarChapter>;
  loading: boolean;
  markingLoading: boolean;
  error: string | null;
  markAsCompleted: (date: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useCalendar = (
  year?: number,
  month?: number
): UseCalendarReturn => {
  const [chapters, setChapters] = useState<Record<string, CalendarChapter>>({});
  const [loading, setLoading] = useState(true);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add useStreaks hook to update streaks when chapters are completed
  const { updateStreak } = useStreaks();
  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's Cognito ID
      const { userId } = await getCurrentUser();

      // Fetch daily chapters
      const { data: dailyChapters } = await client.models.DailyChapter.list({
        limit: 366,
      });

      // Fetch user's completed chapters
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: { creatorId: { eq: userId } },
        });

      // Create a set of completed chapter combinations for quick lookup
      // Format: "bookName:chapter" (e.g., "創世記:1")
      const completedChapterKeys = new Set(
        completedChapters.map(
          (completed) => `${completed.bookName}:${completed.chapter}`
        )
      );

      // Build chapters object
      const chaptersData: Record<string, CalendarChapter> = {};

      dailyChapters.forEach((dailyChapter) => {
        const date = dailyChapter.date;
        const chapterKey = `${dailyChapter.bookName}:${dailyChapter.chapterNumber}`;

        chaptersData[date] = {
          id: dailyChapter.id,
          date: date,
          bookName: dailyChapter.bookName,
          chapterNumber: dailyChapter.chapterNumber,
          title: dailyChapter.title || undefined,
          description: dailyChapter.description || undefined,
          completed: completedChapterKeys.has(chapterKey),
        };
      });

      setChapters(chaptersData);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch chapters"
      );
    } finally {
      setLoading(false);
    }
  };
  const markAsCompleted = async (date: string) => {
    try {
      setMarkingLoading(true);
      const chapterData = chapters[date];
      if (!chapterData) return;

      // Get current user's Cognito ID directly
      const { userId } = await getCurrentUser();

      if (chapterData.completed) {
        console.log(
          `Removing completion for ${chapterData.bookName} ${chapterData.chapterNumber}`
        );

        // If already completed, remove the completion
        // Find ALL completed chapter records for this book/chapter combination
        const { data: completedChapters } =
          await client.models.CompletedChapter.list({
            filter: {
              creatorId: { eq: userId },
              bookName: { eq: chapterData.bookName },
              chapter: { eq: chapterData.chapterNumber.toString() },
            },
          });

        console.log(
          `Found ${completedChapters.length} completed chapters to delete:`,
          completedChapters
        );

        // Delete ALL matching completed chapter records
        // (We don't need to check the completion date - just delete all for this book/chapter)
        for (const completedChapter of completedChapters) {
          console.log(
            `Deleting completed chapter with id: ${completedChapter.id}`
          );
          await client.models.CompletedChapter.delete({
            id: completedChapter.id,
          });
        }

        console.log(
          `Successfully deleted ${completedChapters.length} completed chapter records`
        );

        // Update local state to mark as not completed
        setChapters((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            completed: false,
          },
        }));

        // Update streaks after removing completion
        await updateStreak();
      } else {
        // If not completed, create a completed chapter record
        await client.models.CompletedChapter.create({
          creatorId: userId, // Use Cognito user ID directly
          bookName: chapterData.bookName,
          chapter: chapterData.chapterNumber.toString(),
          completedAt: new Date().toISOString(),
        });

        // Update local state to mark as completed
        setChapters((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            completed: true,
          },
        }));

        // Update streaks after marking as completed
        await updateStreak();
      }
    } catch (err) {
      console.error("Error toggling chapter completion:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to toggle chapter completion"
      );
    } finally {
      setMarkingLoading(false);
    }
  };

  const refetch = async () => {
    await fetchChapters();
  };

  useEffect(() => {
    fetchChapters();
  }, [year, month]);

  return {
    chapters,
    loading,
    markingLoading,
    error,
    markAsCompleted,
    refetch,
  };
};
