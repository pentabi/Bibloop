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

      // Get current user ID
      const user = await getCurrentUser();
      const userId = user.userId;

      // Fetch DailyChapter data
      const { data: dailyChapters } = await client.models.DailyChapter.list();

      // Fetch user's completed chapters
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: {
            userId: {
              eq: userId,
            },
          },
        });

      // Create a map of completed chapters for quick lookup
      // Key format: "bookName-chapterNumber"
      const completedChapterMap = new Set(
        completedChapters.map((cc) => `${cc.bookName}-${cc.chapter}`)
      );

      // Transform data into calendar format
      const chaptersMap: Record<string, CalendarChapter> = {};

      dailyChapters.forEach((chapter) => {
        if (chapter.date) {
          const chapterKey = `${chapter.bookName}-${chapter.chapterNumber}`;
          const isCompleted = completedChapterMap.has(chapterKey);

          chaptersMap[chapter.date] = {
            id: chapter.id,
            date: chapter.date,
            bookName: chapter.bookName,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title || "",
            description: chapter.description || "",
            completed: isCompleted,
          };
        }
      });

      setChapters(chaptersMap);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch calendar data"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (date: string) => {
    try {
      const chapterData = chapters[date];
      if (!chapterData) return;

      // Get current user ID
      const user = await getCurrentUser();
      const userId = user.userId;

      // Create a completed chapter record
      await client.models.CompletedChapter.create({
        userId: userId,
        bookName: chapterData.bookName,
        chapter: chapterData.chapterNumber.toString(),
        completedAt: new Date().toISOString(),
      });

      // Update local state
      setChapters((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          completed: true,
        },
      }));
    } catch (err) {
      console.error("Error marking chapter as completed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark chapter as completed"
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
