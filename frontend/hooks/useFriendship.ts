import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { client } from "../lib/amplify-client";
import { useErrorHandler } from "./useErrorHandler";
import { RootState } from "../redux/rootReducer";
import type { Schema } from "../../backend/amplify/data/resource";

type Friendship = Schema["Friendship"]["type"];
type UserProfile = Schema["UserProfile"]["type"];

interface FriendshipWithUsers {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string | null;
  friendshipDate?: string | null;
  sharedStreaks?: number | null;
  createdAt: string;
  updatedAt: string;
  requester?: UserProfile;
  addressee?: UserProfile;
}

export const useFriendship = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const currentUser = useSelector((state: RootState) => state.user);

  // Send friend request
  const sendFriendRequest = useCallback(
    async (targetUserId: string) => {
      if (!currentUser.id) {
        throw new Error("Current user not found");
      }

      setIsLoading(true);
      try {
        // First find the target user by userId
        const targetUserQuery = await client.models.UserProfile.list({
          filter: {
            userId: {
              eq: targetUserId,
            },
          },
        });

        if (!targetUserQuery.data || targetUserQuery.data.length === 0) {
          throw new Error("ユーザーが見つかりませんでした");
        }

        const targetUser = targetUserQuery.data[0];

        // Check if friendship already exists
        const existingFriendshipQuery = await client.models.Friendship.list({
          filter: {
            or: [
              {
                and: [
                  { requesterId: { eq: currentUser.id } },
                  { addresseeId: { eq: targetUser.id } },
                ],
              },
              {
                and: [
                  { requesterId: { eq: targetUser.id } },
                  { addresseeId: { eq: currentUser.id } },
                ],
              },
            ],
          },
        });

        if (
          existingFriendshipQuery.data &&
          existingFriendshipQuery.data.length > 0
        ) {
          const existing = existingFriendshipQuery.data[0];
          if (existing.status === "pending") {
            throw new Error("既にフレンドリクエストが送信されています");
          } else if (existing.status === "accepted") {
            throw new Error("既にフレンドです");
          } else if (existing.status === "blocked") {
            throw new Error("このユーザーにリクエストを送信できません");
          }
        }

        // Create friend request
        const result = await client.models.Friendship.create({
          requesterId: currentUser.id,
          addresseeId: targetUser.id,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        if (result.data) {
          console.log("Friend request sent successfully");
          return result.data;
        }

        throw new Error("フレンドリクエストの送信に失敗しました");
      } catch (error) {
        console.error("Error sending friend request:", error);
        handleError(error, "フレンドリクエストの送信に失敗しました");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser.id, handleError]
  );

  // Get pending friend requests (received)
  const getPendingRequests = useCallback(async () => {
    if (!currentUser.id) return [];

    setIsLoading(true);
    try {
      const result = await client.models.Friendship.list({
        filter: {
          and: [
            { addresseeId: { eq: currentUser.id } },
            { status: { eq: "pending" } },
          ],
        },
      });

      if (!result.data) return [];

      // Fetch requester profiles
      const requestsWithUsers: FriendshipWithUsers[] = await Promise.all(
        result.data.map(async (friendship) => {
          try {
            const requesterResult = await client.models.UserProfile.get({
              id: friendship.requesterId,
            });
            return {
              id: friendship.id,
              requesterId: friendship.requesterId,
              addresseeId: friendship.addresseeId,
              status: friendship.status,
              friendshipDate: friendship.friendshipDate,
              sharedStreaks: friendship.sharedStreaks,
              createdAt: friendship.createdAt,
              updatedAt: friendship.updatedAt,
              requester: requesterResult.data || undefined,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch requester ${friendship.requesterId}:`,
              error
            );
            return {
              id: friendship.id,
              requesterId: friendship.requesterId,
              addresseeId: friendship.addresseeId,
              status: friendship.status,
              friendshipDate: friendship.friendshipDate,
              sharedStreaks: friendship.sharedStreaks,
              createdAt: friendship.createdAt,
              updatedAt: friendship.updatedAt,
            };
          }
        })
      );

      return requestsWithUsers;
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      handleError(error, "フレンドリクエストの取得に失敗しました");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, handleError]);

  // Accept friend request
  const acceptFriendRequest = useCallback(
    async (friendshipId: string) => {
      setIsLoading(true);
      try {
        const result = await client.models.Friendship.update({
          id: friendshipId,
          status: "accepted",
          friendshipDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        if (result.data) {
          console.log("Friend request accepted");
          return result.data;
        }

        throw new Error("フレンドリクエストの承認に失敗しました");
      } catch (error) {
        console.error("Error accepting friend request:", error);
        handleError(error, "フレンドリクエストの承認に失敗しました");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Decline friend request
  const declineFriendRequest = useCallback(
    async (friendshipId: string) => {
      setIsLoading(true);
      try {
        const result = await client.models.Friendship.update({
          id: friendshipId,
          status: "declined",
          updatedAt: new Date().toISOString(),
        } as any);

        if (result.data) {
          console.log("Friend request declined");
          return result.data;
        }

        throw new Error("フレンドリクエストの拒否に失敗しました");
      } catch (error) {
        console.error("Error declining friend request:", error);
        handleError(error, "フレンドリクエストの拒否に失敗しました");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Get friends list (with their profile info)
  const getFriendsList = useCallback(async () => {
    if (!currentUser.id) return [];

    setIsLoading(true);
    try {
      const result = await client.models.Friendship.list({
        filter: {
          and: [
            {
              or: [
                { requesterId: { eq: currentUser.id } },
                { addresseeId: { eq: currentUser.id } },
              ],
            },
            { status: { eq: "accepted" } },
          ],
        },
      });

      if (!result.data) return [];

      // Fetch friend profiles
      const friendsWithUsers: FriendshipWithUsers[] = await Promise.all(
        result.data.map(async (friendship) => {
          try {
            const friendId =
              friendship.requesterId === currentUser.id
                ? friendship.addresseeId
                : friendship.requesterId;

            const friendResult = await client.models.UserProfile.get({
              id: friendId,
            });

            const friendshipData: FriendshipWithUsers = {
              id: friendship.id,
              requesterId: friendship.requesterId,
              addresseeId: friendship.addresseeId,
              status: friendship.status,
              friendshipDate: friendship.friendshipDate,
              sharedStreaks: friendship.sharedStreaks,
              createdAt: friendship.createdAt,
              updatedAt: friendship.updatedAt,
            };

            if (friendship.requesterId === currentUser.id) {
              friendshipData.addressee = friendResult.data || undefined;
            } else {
              friendshipData.requester = friendResult.data || undefined;
            }

            return friendshipData;
          } catch (error) {
            console.warn(`Failed to fetch friend profile:`, error);
            return {
              id: friendship.id,
              requesterId: friendship.requesterId,
              addresseeId: friendship.addresseeId,
              status: friendship.status,
              friendshipDate: friendship.friendshipDate,
              sharedStreaks: friendship.sharedStreaks,
              createdAt: friendship.createdAt,
              updatedAt: friendship.updatedAt,
            };
          }
        })
      );

      return friendsWithUsers;
    } catch (error) {
      console.error("Error fetching friends list:", error);
      handleError(error, "フレンド一覧の取得に失敗しました");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, handleError]);

  // Get friend IDs only (lightweight version)
  const getFriendIds = useCallback(async (): Promise<string[]> => {
    if (!currentUser.id) return [];

    try {
      const result = await client.models.Friendship.list({
        filter: {
          and: [
            {
              or: [
                { requesterId: { eq: currentUser.id } },
                { addresseeId: { eq: currentUser.id } },
              ],
            },
            { status: { eq: "accepted" } },
          ],
        },
      });

      if (!result.data) return [];

      // Extract friend IDs without fetching profiles
      const friendIds = result.data.map((friendship) =>
        friendship.requesterId === currentUser.id
          ? friendship.addresseeId
          : friendship.requesterId
      );

      return friendIds;
    } catch (error) {
      console.error("Error fetching friend IDs:", error);
      return [];
    }
  }, [currentUser.id]);

  return {
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    getFriendsList,
    getFriendIds,
    isLoading,
  };
};
