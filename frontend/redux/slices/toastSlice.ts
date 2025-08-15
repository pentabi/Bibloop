import { createSlice } from "@reduxjs/toolkit";
import { ToastType } from "../types/ToastType";

interface ToastState {
  title: string | null;
  context: string | null;
  type: ToastType | null;
}

const initialState: ToastState = {
  title: null,
  context: "",
  type: null,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast(state, action) {
      state.title = action.payload.title ?? null;
      state.context = action.payload.context ?? null;
      state.type = action.payload.type || ToastType.Error;
      //add a default title when title is not in the payload
      if (!state.title) {
        state.title = state.type;
      }
      console.log("Toast activated");
    },

    clearToast(state) {
      state.title = null;
      state.context = null;
      state.type = null;
    },
  },
});

export const { showToast, clearToast } = toastSlice.actions;
export default toastSlice.reducer;
