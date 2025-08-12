import { useState, useEffect, useMemo, useCallback } from "react";
import { openKougoDB } from "~/utils/KougoDb";
import { kougoBibleMap } from "~/lib/kougoBibleMap";

export interface KougoBibleBook {
  id: number;
  name: string;
  japName: string;
  totalChapters: number;
  testament: "old" | "new";
  category: string;
}

export const useKougoBibleData = () => {
  const [books, setBooks] = useState<KougoBibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKougoBibleBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await openKougoDB();

      // Get all books with their chapter counts
      const result = db.getAllSync(`
        SELECT 
          b.id,
          b.name,
          COUNT(DISTINCT v.chapter) as totalChapters
        FROM JapKougo_books b
        LEFT JOIN JapKougo_verses v ON b.id = v.book_id
        GROUP BY b.id, b.name
        ORDER BY b.id ASC
      `);

      const bibleBooks = result.map((row: any) => {
        const bookMapping = kougoBibleMap[row.name];
        return {
          id: row.id,
          name: row.name,
          japName: bookMapping?.name || row.name,
          totalChapters: row.totalChapters || 0,
          testament: row.id <= 39 ? ("old" as const) : ("new" as const),
          category: bookMapping?.category || "その他",
        };
      });

      setBooks(bibleBooks);
    } catch (error) {
      console.error("Error loading bible books:", error);
      setError("聖書の書を読み込めませんでした");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterBooks = useCallback(
    (searchQuery: string, testament: "old" | "new"): KougoBibleBook[] => {
      let filtered = books.filter((book) => book.testament === testament);

      if (searchQuery) {
        filtered = filtered.filter(
          (book) =>
            book.japName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filtered;
    },
    [books]
  );

  const getBookById = useCallback(
    (bookId: number): KougoBibleBook | undefined => {
      return books.find((book) => book.id === bookId);
    },
    [books]
  );

  const getBooksByTestament = useCallback(
    (testament: "old" | "new"): KougoBibleBook[] => {
      return books.filter((book) => book.testament === testament);
    },
    [books]
  );

  const getBooksCount = useMemo(
    () => ({
      total: books.length,
      oldTestament: books.filter((book) => book.testament === "old").length,
      newTestament: books.filter((book) => book.testament === "new").length,
    }),
    [books]
  );

  useEffect(() => {
    loadKougoBibleBooks();
  }, [loadKougoBibleBooks]);

  return {
    // Data
    books,
    loading,
    error,

    // Actions
    loadKougoBibleBooks,
    filterBooks,
    getBookById,
    getBooksByTestament,

    // Computed values
    getBooksCount,
  };
};
