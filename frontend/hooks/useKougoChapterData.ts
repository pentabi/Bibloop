import { useState, useEffect, useCallback } from "react";
import { openKougoDB } from "~/utils/KougoDb";

export interface KougoVerse {
  verse: number;
  text: string;
}

export const useKougoChapterData = (bookId: number, chapter: number) => {
  const [verses, setVerses] = useState<KougoVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);

  const loadKougoChapter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await openKougoDB();
      const data = db.getAllSync(
        "SELECT verse, text FROM JapKougo_verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC",
        [bookId, chapter]
      ) as Array<{ verse: number; text: string }>;

      setVerses(data);
    } catch (error) {
      console.error("Error loading chapter:", error);
      setError("章の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [bookId, chapter]);

  const loadKougoTotalChapters = useCallback(async () => {
    try {
      const db = await openKougoDB();
      const result = db.getAllSync(
        "SELECT COUNT(DISTINCT chapter) as total FROM JapKougo_verses WHERE book_id = ?",
        [bookId]
      ) as Array<{ total: number }>;

      setTotalChapters(result[0]?.total || 0);
    } catch (error) {
      console.error("Error getting total chapters:", error);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId && chapter) {
      loadKougoChapter();
      loadKougoTotalChapters();
    }
  }, [bookId, chapter, loadKougoChapter, loadKougoTotalChapters]);

  return {
    // Data
    verses,
    loading,
    error,
    totalChapters,

    // Actions
    loadKougoChapter,
    loadKougoTotalChapters,
  };
};
