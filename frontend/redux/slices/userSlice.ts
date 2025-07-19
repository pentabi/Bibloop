import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  isLoggedIn: boolean;
  userIdentifier: string | null; // Changed from 'email' to be more generic
  name: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  userIdentifier: null, // Changed from 'email'
  name: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      (state.userIdentifier = action.payload.userIdentifier),
        (state.name = action.payload.name);
      state.isLoggedIn = true;
      console.log("redux: full user profile set:", action.payload);
    },
    userLogIn(state, action: PayloadAction<string>) {
      state.userIdentifier = action.payload;
      // Set logged in status if we have any identifier (email, sub, or fallback)
      state.isLoggedIn = !!action.payload && action.payload.trim() !== "";
      console.log("redux: user logged in: ", state.userIdentifier);
    },
    clearUser(state) {
      state.userIdentifier = null;
      state.name = null;
      state.isLoggedIn = false;
      console.log("redux: user cleared");
    },
  },
});

export const { setUser, userLogIn, clearUser } = userSlice.actions;
export default userSlice.reducer;
