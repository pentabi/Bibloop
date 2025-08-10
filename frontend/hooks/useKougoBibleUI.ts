import { useState, useMemo, useCallback } from 'react';
import { KougoBibleBook } from './useKougoBibleData';

export const useKougoBibleUI = (books: KougoBibleBook[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestament, setSelectedTestament] = useState<"old" | "new">("old");
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  const filteredBooks = useMemo(() => {
    let filtered = books.filter((book) => book.testament === selectedTestament);

    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.japName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [books, searchQuery, selectedTestament]);

  const toggleBook = useCallback((bookId: number) => {
    setExpandedBook(current => current === bookId ? null : bookId);
  }, []);

  const toggleTestament = useCallback(() => {
    setSelectedTestament(current => current === "old" ? "new" : "old");
  }, []);

  const selectTestament = useCallback((testament: "old" | "new") => {
    setSelectedTestament(testament);
    setExpandedBook(null); // Close any expanded book when switching testament
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const isBookExpanded = useCallback((bookId: number): boolean => {
    return expandedBook === bookId;
  }, [expandedBook]);

  return {
    // State
    searchQuery,
    selectedTestament,
    expandedBook,
    
    // Derived state
    filteredBooks,
    
    // Actions
    setSearchQuery,
    selectTestament,
    toggleTestament,
    toggleBook,
    clearSearch,
    
    // Utilities
    isBookExpanded,
  };
};
