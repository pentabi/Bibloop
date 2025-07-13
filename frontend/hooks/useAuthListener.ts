import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUserAttributes } from "aws-amplify/auth";
import { clearUser, setUser, userLogIn } from "../redux/slices/userSlice";
import { Hub } from "aws-amplify/utils";

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
        dispatch(userLogIn(attrs.email || ""));
      } catch {
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
          console.log("signInWithRedirect API has successfully been resolved.");
          break;
        case "signInWithRedirect_failure":
          console.log(
            "failure while trying to resolve signInWithRedirect API."
          );
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
