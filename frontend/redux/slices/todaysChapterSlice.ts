import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TodaysChapter {
  id: string;
  date: string;
  bookName: string; // Japanese name like "創世記"
  chapterNumber: number;
  title?: string;
  description?: string;
  bookId: number; // For Kougo database
  formattedDate: string; // "7月17日" format
  isFallback: boolean;
}

interface TodaysChapterState {
  chapter: TodaysChapter | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: TodaysChapterState = {
  chapter: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Helper function to get device local date string
const getDeviceDateString = () => {
  const today = new Date();
  return (
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0")
  );
};

const todaysChapterSlice = createSlice({
  name: "todaysChapter",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setChapter: (state, action: PayloadAction<TodaysChapter>) => {
      state.chapter = action.payload;
      state.lastUpdated = getDeviceDateString(); // Use device local date
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearChapter: (state) => {
      state.chapter = null;
      state.lastUpdated = null;
    },
  },
});

export const { setLoading, setChapter, setError, clearError, clearChapter } =
  todaysChapterSlice.actions;

export default todaysChapterSlice.reducer;
