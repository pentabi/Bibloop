import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useStreaks } from "./useStreaks";
import type { Schema } from "../../backend/amplify/data/resource";

const client = generateClient<Schema>();

export interface UseChapterCompletionReturn {
  isCompleted: boolean;
  loading: boolean;
  markingLoading: boolean;
  error: string | null;
  toggleCompletion: () => Promise<void>;
}

export const useChapterCompletion = (
  bookName: string,
  chapterNumber: number
): UseChapterCompletionReturn => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add useStreaks hook to update streaks when chapters are completed
  const { updateStreak } = useStreaks();

  const checkCompletion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's Cognito ID
      const { userId } = await getCurrentUser();

      // Check if this specific chapter is completed
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: {
            creatorId: { eq: userId },
            bookName: { eq: bookName },
            chapter: { eq: chapterNumber.toString() },
          },
        });

      setIsCompleted(completedChapters.length > 0);
    } catch (error) {
      console.error("Error checking chapter completion:", error);
      setError(
        error instanceof Error ? error.message : "Failed to check completion"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async () => {
    try {
      setMarkingLoading(true);

      // Get current user's Cognito ID
      const { userId } = await getCurrentUser();

      if (isCompleted) {
        console.log(`Removing completion for ${bookName} ${chapterNumber}`);

        // If already completed, remove the completion
        const { data: completedChapters } =
          await client.models.CompletedChapter.list({
            filter: {
              creatorId: { eq: userId },
              bookName: { eq: bookName },
              chapter: { eq: chapterNumber.toString() },
            },
          });

        console.log(
          `Found ${completedChapters.length} completed chapters to delete:`,
          completedChapters
        );

        // Delete ALL matching completed chapter records
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

        setIsCompleted(false);

        // Update streaks after removing completion
        await updateStreak();
      } else {
        console.log(`Marking ${bookName} ${chapterNumber} as completed`);

        // If not completed, create a completed chapter record
        await client.models.CompletedChapter.create({
          creatorId: userId,
          bookName: bookName,
          chapter: chapterNumber.toString(),
          completedAt: new Date().toISOString(),
        });

        setIsCompleted(true);

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

  useEffect(() => {
    if (bookName && chapterNumber) {
      checkCompletion();
    }
  }, [bookName, chapterNumber]);

  return {
    isCompleted,
    loading,
    markingLoading,
    error,
    toggleCompletion,
  };
};
