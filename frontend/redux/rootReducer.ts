// src/redux/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import toastReducer from "./slices/toastSlice";

const rootReducer = combineReducers({ user: userReducer, toast: toastReducer });

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
