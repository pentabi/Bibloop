import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUserAttributes } from "aws-amplify/auth";
import { clearUser, setUser, userLogIn } from "../redux/slices/userSlice";
import { Hub } from "aws-amplify/utils";
import { signOutAutomatic } from "~/utils/signOut";

//Checks the user's login status
//changes their email and login parameters on redux
export default function useAuthListener() {
  const dispatch = useDispatch();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    //function to attempt to getUser
    const getUser = async () => {
      try {
        const attrs = await fetchUserAttributes();
        console.log("user attributes:", attrs);

        // For Apple Sign In, use any available identifier
        let userIdentifier = attrs.email;
        if (!userIdentifier) {
          // Try other attributes that Apple might provide
          userIdentifier =
            attrs.sub ||
            attrs.preferred_username ||
            attrs.name ||
            "apple_user_" + Date.now();
        }

        dispatch(userLogIn(userIdentifier));
      } catch (error) {
        console.log("Error fetching user attributes:", error);
        signOutAutomatic();
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
          // Still try to get user in case they're actually signed in
          getUser();
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
