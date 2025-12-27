// src/redux/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import toastReducer from "./slices/toastSlice";
import todaysChapterReducer from "./slices/todaysChapterSlice";
import commentsReducer from "./slices/commentsSlice";

const rootReducer = combineReducers({
  user: userReducer,
  toast: toastReducer,
  todaysChapter: todaysChapterReducer,
  comments: commentsReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
