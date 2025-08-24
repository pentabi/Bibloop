import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../backend/amplify/data/resource";
import { openKougoDB } from "~/utils/KougoDb";
import { kougoBibleMap } from "~/lib/kougoBibleMap";
import { RootState } from "../redux/rootReducer";
import {
  setLoading,
  setChapter,
  setError,
  clearError,
} from "../redux/slices/todaysChapterSlice";
import type { TodaysChapter } from "../redux/slices/todaysChapterSlice";

const client = generateClient<Schema>();

export interface DailyReadingVerse {
  verse: number;
  text: string;
}

export const useDailyReading = () => {
  const dispatch = useDispatch();

  // Get today's chapter from Redux
  const {
    chapter: dailyReading,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((state: RootState) => state.todaysChapter);

  const [verses, setVerses] = useState<DailyReadingVerse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  };

  // Helper function to format date for display (e.g., "8月23日")
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  // Helper function to get book ID from English book name
  const getBookIdFromEnglishName = async (
    englishName: string
  ): Promise<number | null> => {
    try {
      const db = await openKougoDB();
      const result = db.getAllSync(
        "SELECT id FROM JapKougo_books WHERE name = ? LIMIT 1",
        [englishName]
      ) as Array<{ id: number }>;

      return result.length > 0 ? result[0].id : null;
    } catch (error) {
      console.error("Error getting book ID:", error);
      return null;
    }
  };

  // Helper function to convert Japanese book name to English for database lookup
  const getEnglishBookName = (japBookName: string): string | null => {
    for (const [englishName, bookInfo] of Object.entries(kougoBibleMap)) {
      if (bookInfo.name === japBookName) {
        return englishName;
      }
    }
    return null;
  };

  // Fallback reading when no daily reading is set - use Psalm 23
  const getFallbackReading = (): TodaysChapter => {
    const today = getTodayDateString();
    return {
      id: "fallback-psalm23",
      date: today,
      bookName: "詩篇",
      chapterNumber: 23,
      title: "今日の慰めの詩篇",
      bookId: 19, // Psalms book ID
      formattedDate: formatDateForDisplay(today),
      isFallback: true,
    };
  };

  // Fetch today's chapter data and store in Redux
  const fetchDailyReading = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const today = getTodayDateString();
      console.log("Fetching daily reading for date:", today);

      // Fetch ALL daily chapters
      const { data: allDailyChapters } =
        await client.models.DailyChapter.list();
      console.log("All daily chapters:", allDailyChapters);

      // Filter for today's date
      const todaysChapters = allDailyChapters.filter(
        (chapter) => chapter.date === today
      );
      console.log("Today's chapters filtered:", todaysChapters);

      let dailyChapter;

      if (todaysChapters.length === 0) {
        // No reading for today, use Psalm 23 fallback
        console.log("No reading for today, using Psalm 23 fallback");
        const fallbackChapter = getFallbackReading();
        dispatch(setChapter(fallbackChapter));
        return;
      } else {
        dailyChapter = todaysChapters[0];
        console.log("Using daily chapter:", dailyChapter);
      }

      // Get the English book name for database lookup
      const englishBookName = getEnglishBookName(dailyChapter.bookName);
      console.log(
        "Japanese book name:",
        dailyChapter.bookName,
        "-> English:",
        englishBookName
      );

      if (!englishBookName) {
        throw new Error(`書名 "${dailyChapter.bookName}" が見つかりません`);
      }

      // Get the book ID for Kougo database
      const bookId = await getBookIdFromEnglishName(englishBookName);
      console.log("Book ID for", englishBookName, ":", bookId);

      if (!bookId) {
        throw new Error(
          `データベースで書名 "${englishBookName}" が見つかりません`
        );
      }

      // Create chapter object and store in Redux
      const chapter: TodaysChapter = {
        id: dailyChapter.id,
        date: dailyChapter.date,
        bookName: dailyChapter.bookName,
        chapterNumber: dailyChapter.chapterNumber,
        title: dailyChapter.title || undefined,
        bookId: bookId,
        formattedDate: formatDateForDisplay(dailyChapter.date),
        isFallback: false,
      };

      dispatch(setChapter(chapter));
    } catch (err) {
      console.error("Error fetching daily reading:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "今日の読書の読み込みに失敗しました";
      dispatch(setError(errorMessage));

      // Set fallback on error
      const fallbackChapter = getFallbackReading();
      dispatch(setChapter(fallbackChapter));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch verses based on current chapter in Redux
  const fetchVerses = useCallback(async () => {
    if (!dailyReading?.bookId) return;

    try {
      setVersesLoading(true);
      console.log(
        "Fetching verses for:",
        dailyReading.bookName,
        "chapter",
        dailyReading.chapterNumber
      );

      const db = await openKougoDB();
      const versesData = db.getAllSync(
        "SELECT verse, text FROM JapKougo_verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC",
        [dailyReading.bookId, dailyReading.chapterNumber]
      ) as Array<{ verse: number; text: string }>;

      console.log("Verses found:", versesData.length);
      setVerses(versesData);
    } catch (error) {
      console.error("Error fetching verses:", error);
    } finally {
      setVersesLoading(false);
    }
  }, [dailyReading?.bookId, dailyReading?.chapterNumber]);

  // Load chapter data if not already loaded
  useEffect(() => {
    const today = getTodayDateString();

    // Only fetch if we don't have today's data
    if (!dailyReading || dailyReading.date !== today) {
      fetchDailyReading();
    }
  }, [dailyReading, fetchDailyReading]);

  // Load verses when chapter changes
  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  return {
    dailyReading,
    verses,
    loading: reduxLoading || versesLoading,
    error: reduxError,
    hasFallback: dailyReading?.isFallback || false,
    refetch: fetchDailyReading,
    formatDateForDisplay,
  };
};
