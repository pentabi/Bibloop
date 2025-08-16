import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { client } from "~/lib/amplify-client";
import { setUser, userLogIn } from "~/redux/slices/userSlice";
import { useErrorHandler } from "./useErrorHandler";
import type { Schema } from "@/data-schema";

type UserProfile = Schema["UserProfile"]["type"];

export default function useUserProfile() {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const checkAndCreateUserProfile = useCallback(
    async (userIdentifier: string, userId: string) => {
      setIsLoading(true);
      try {
        // First, check if user profile exists by userIdentifier
        const existingUserQuery = await client.models.UserProfile.list({
          filter: {
            userIdentifier: {
              eq: userIdentifier,
            },
          },
        });
        console.log("existingUserQuery", existingUserQuery);

        let userProfile: UserProfile | null = null;

        if (existingUserQuery.data && existingUserQuery.data.length > 0) {
          // User profile exists
          userProfile = existingUserQuery.data[0] as UserProfile;
          console.log("Existing user profile found:", userProfile);
        } else {
          //User profile doesn't exist
          // Create new user profile
          console.log("Creating new user profile");
          const createResult = await client.models.UserProfile.create({
            userIdentifier: userIdentifier,
            userId: userId,
            streaks: 0,
            isTestimonyPrivate: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log("createResult", createResult);

          if (createResult.data) {
            userProfile = createResult.data as UserProfile;
            console.log("New user profile created:", userProfile);
          }
        }

        // Update Redux state
        if (userProfile) {
          dispatch(
            setUser({
              userIdentifier: userProfile.userIdentifier,
              name: userProfile.name || null,
              finishedOnboarding: !!userProfile.name, // User has finished onboarding if they have a name
            })
          );

          //when the redux state is updated, return the value fetched from db
          return {
            hasCompletedOnboarding: !!userProfile.name,
            userProfile,
          };
        }

        throw new Error("Failed to create or retrieve user profile");
      } catch (error) {
        console.error("Error in checkAndCreateUserProfile:", error);
        handleError(
          error,
          "ユーザープロフィールの処理中にエラーが発生しました"
        );

        return {
          hasCompletedOnboarding: false,
          userProfile: null,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, handleError]
  );

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setIsLoading(true);
      try {
        if (!updates.id) {
          throw new Error("User profile ID is required for updates");
        }

        const updateResult = await client.models.UserProfile.update({
          id: updates.id,
          ...updates,
        });

        if (updateResult.data) {
          const updatedProfile = updateResult.data as UserProfile;

          // Update Redux state
          dispatch(
            setUser({
              userIdentifier: updatedProfile.userIdentifier,
              name: updatedProfile.name || null,
              finishedOnboarding: !!updatedProfile.name,
            })
          );

          return updatedProfile;
        }

        throw new Error("Failed to update user profile");
      } catch (error) {
        console.error("Error updating user profile:", error);
        handleError(
          error,
          "ユーザープロフィールの更新中にエラーが発生しました"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, handleError]
  );

  const getUserProfile = useCallback(
    async (userIdentifier: string) => {
      setIsLoading(true);
      try {
        const userQuery = await client.models.UserProfile.list({
          filter: {
            userIdentifier: {
              eq: userIdentifier,
            },
          },
        });

        if (userQuery.data && userQuery.data.length > 0) {
          return userQuery.data[0] as UserProfile;
        }

        return null;
      } catch (error) {
        console.error("Error getting user profile:", error);
        handleError(
          error,
          "ユーザープロフィールの取得中にエラーが発生しました"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  return {
    checkAndCreateUserProfile,
    updateUserProfile,
    getUserProfile,
    isLoading,
  };
}
