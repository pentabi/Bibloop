import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  isLoggedIn: boolean;
  email: string | null;
  name: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  email: null,
  name: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      (state.email = action.payload.email), (state.name = action.payload.name);
      state.isLoggedIn = true;
      console.log("redux: full user profile set:", action.payload);
    },
    userLogIn(state, action: PayloadAction<string>) {
      state.email = action.payload;
      state.isLoggedIn = true;
      console.log("redux: user logged in: ", state.email);
    },
    clearUser(state) {
      state.email = null;
      state.name = null;
      state.isLoggedIn = false;
      console.log("redux: user cleared");
    },
  },
});

export const { setUser, userLogIn, clearUser } = userSlice.actions;
export default userSlice.reducer;
