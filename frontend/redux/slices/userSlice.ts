import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Schema } from "@/data-schema";

type UserProfile = Schema["UserProfile"]["type"];
export type UserState = {
  // Core authentication fields
  isLoggedIn: boolean;
  finishedOnboarding: boolean;
} & {
  // UserProfile fields (all nullable when not logged in)
  [K in keyof Omit<
    UserProfile,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "prayerRequests"
    | "comments"
    | "completedChapters"
  >]: UserProfile[K] | null;
};

const initialState: UserState = {
  isLoggedIn: false,
  finishedOnboarding: false,
  userIdentifier: null,
  userId: null,
  name: null,
  profileImagePath: null,
  friendsId: null,
  streaks: null,
  completed: null,
  isTestimonyPrivate: null,
  testimony: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      // Set all UserProfile fields from payload
      Object.keys(action.payload).forEach((key) => {
        // @ts-ignore
        state[key] = action.payload[key];
      });
      state.isLoggedIn = true;
      console.log("redux: full user profile set:", action.payload);
    },
    userLogIn(state, action: PayloadAction<string>) {
      state.userIdentifier = action.payload;
      // Set logged in status if we have any identifier (email, sub, or fallback)
      state.isLoggedIn = !!action.payload && action.payload.trim() !== "";
      console.log("redux: user logged in: ", state.userIdentifier);
    },
    setOnboardingComplete(state) {
      state.finishedOnboarding = true;
      console.log("redux: onboarding completed");
    },
    clearUser(state) {
      state.userIdentifier = null;
      state.userId = null;
      state.name = null;
      state.profileImagePath = null;
      state.friendsId = null;
      state.streaks = null;
      state.completed = null;
      state.isTestimonyPrivate = null;
      state.testimony = null;
      state.isLoggedIn = false;
      state.finishedOnboarding = false;
      console.log("redux: user cleared");
    },
  },
});

export const { setUser, userLogIn, setOnboardingComplete, clearUser } =
  userSlice.actions;
export default userSlice.reducer;
