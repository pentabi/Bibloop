import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
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
  const [error, setError] = useState<string | null>(null);

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

      // Create a set of completed chapter dates for quick lookup
      const completedDates = new Set(
        completedChapters.map((completed) => {
          // Extract date from completedAt datetime
          return completed.completedAt.split("T")[0];
        })
      );

      // Build chapters object
      const chaptersData: Record<string, CalendarChapter> = {};

      dailyChapters.forEach((dailyChapter) => {
        const date = dailyChapter.date;
        chaptersData[date] = {
          id: dailyChapter.id,
          date: date,
          bookName: dailyChapter.bookName,
          chapterNumber: dailyChapter.chapterNumber,
          title: dailyChapter.title || undefined,
          description: dailyChapter.description || undefined,
          completed: completedDates.has(date),
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
      const chapterData = chapters[date];
      if (!chapterData) return;

      // Get current user's Cognito ID directly
      const { userId } = await getCurrentUser();

      if (chapterData.completed) {
        // If already completed, remove the completion
        // Find the completed chapter record to delete
        const { data: completedChapters } =
          await client.models.CompletedChapter.list({
            filter: {
              creatorId: { eq: userId },
              bookName: { eq: chapterData.bookName },
              chapter: { eq: chapterData.chapterNumber.toString() },
            },
          });

        // Delete all matching completed chapter records (in case of duplicates)
        for (const completedChapter of completedChapters) {
          const completedDate = completedChapter.completedAt.split("T")[0];
          if (completedDate === date) {
            await client.models.CompletedChapter.delete({
              id: completedChapter.id,
            });
          }
        }

        // Update local state to mark as not completed
        setChapters((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            completed: false,
          },
        }));
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
      }
    } catch (err) {
      console.error("Error toggling chapter completion:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to toggle chapter completion"
      );
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
    error,
    markAsCompleted,
    refetch,
  };
};
