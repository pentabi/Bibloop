import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { clearUser } from "../redux/slices/userSlice";
import { Hub } from "aws-amplify/utils";
import { signOutAutomatic } from "~/utils/signOut";
import { useErrorHandler } from "./useErrorHandler";
import useUserProfile from "./useUserProfile";
import {
  generateUserIdentifier,
  getAuthProvider,
} from "~/utils/generateUserIdentifier";

//Checks the user's login status
//changes their email and login parameters on redux
//handles user profile creation and onboarding flow
export default function useAuthListener() {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const { checkAndCreateUserProfile } = useUserProfile();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    console.log("auth listner run");
    //function to attempt to getUser
    const getUser = async () => {
      try {
        // First check if user is actually authenticated
        const user = await getCurrentUser();

        // Only proceed if we successfully got a user
        if (!user || !user.userId) {
          dispatch(clearUser());
          setIsAuthLoaded(true);
          return;
        }

        const attrs = await fetchUserAttributes();
        console.log({ user, attrs });

        // Generate userIdentifier using utility function that supports multiple OAuth providers
        const userIdentifier = generateUserIdentifier(attrs);
        const authProvider = getAuthProvider(attrs);

        console.log(
          `Generated userIdentifier: ${userIdentifier} for provider: ${authProvider}`
        );

        // Check and create user profile in database
        const profileResult = await checkAndCreateUserProfile(
          userIdentifier,
          user.userId
        );

        console.log("Profile check result:", profileResult);

        // The checkAndCreateUserProfile function already updates Redux state
        // with setUser action that includes onboarding status
      } catch (error) {
        console.log("Error fetching user attributes:", error);

        // Only handle as error if it's not an authentication error
        if (
          error instanceof Error &&
          error.name !== "UserUnAuthenticatedException"
        ) {
          handleError(error, "認証エラーが発生しました");
          signOutAutomatic();
        } else {
          console.log("User not authenticated, clearing user state");
        }

        dispatch(clearUser());
      } finally {
        setIsAuthLoaded(true);
      }
    };

    //Initial auth check
    getUser();

    const listener = (data: any) => {
      switch (data.payload.event) {
        case "signedIn":
          getUser();
          console.log("user have been signedIn successfully.");
          break;
        case "signedOut":
          dispatch(clearUser());
          setIsAuthLoaded(true);
          console.log("user have been signedOut successfully.");
          break;
        case "tokenRefresh":
          getUser();
          console.log("auth tokens have been refreshed.");
          break;
        case "tokenRefresh_failure":
          console.log("failure while refreshing auth tokens.");
          handleError("認証トークンの更新に失敗しました", "認証エラー");
          break;
        case "signInWithRedirect":
          getUser(); // Fetch user attributes after successful Apple Sign In

          console.log("signInWithRedirect API has successfully been resolved.");
          break;
        case "signInWithRedirect_failure":
          console.log(
            "failure while trying to resolve signInWithRedirect API.",
            data.payload
          );
          handleError("サインインに失敗しました", "認証エラー");
          // Still try to get user in case they're actually signed in
          getUser();
          break;
        case "customOAuthState":
          console.log("custom Oauth state");
          const state = data.data;
          console.log(state);
          break;
        case "signOut_failure":
          dispatch(clearUser());
          setIsAuthLoaded(true);
          console.log("signOut unsuccessful");
          break;
      }
    };
    const unsubscribe = Hub.listen("auth", listener);
    return () => unsubscribe(); // cleanup on unmount
  }, [dispatch]);

  return isAuthLoaded;
}
