// src/redux/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import toastReducer from "./slices/toastSlice";
import todaysChapterReducer from "./slices/todaysChapterSlice";

const rootReducer = combineReducers({
  user: userReducer,
  toast: toastReducer,
  todaysChapter: todaysChapterReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
