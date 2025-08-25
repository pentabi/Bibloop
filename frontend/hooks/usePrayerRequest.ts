import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { client } from "../lib/amplify-client";
import { useErrorHandler } from "./useErrorHandler";
import { RootState } from "../redux/rootReducer";
import type { Schema } from "../../backend/amplify/data/resource";

type PrayerRequest = Schema["PrayerRequest"]["type"];
type UserProfile = Schema["UserProfile"]["type"];

interface PrayerRequestWithCreator {
  id: string;
  creatorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  viewableUntil: string;
  creator?: UserProfile;
}

export const usePrayerRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prayerRequests, setPrayerRequests] = useState<
    PrayerRequestWithCreator[]
  >([]);
  const [subscriptionsActive, setSubscriptionsActive] = useState(false);
  const { handleError } = useErrorHandler();
  const currentUser = useSelector((state: RootState) => state.user);
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  // Helper function to fetch user profile
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | undefined> => {
      try {
        const result = await client.models.UserProfile.get({ id: userId });
        return result.data || undefined;
      } catch (error) {
        console.warn(`Failed to fetch user profile for ${userId}:`, error);
        return undefined;
      }
    },
    []
  );

  // Helper function to enrich prayer request with creator info
  const enrichPrayerRequest = useCallback(
    async (request: any): Promise<PrayerRequestWithCreator> => {
      let creator: UserProfile | undefined;

      if (request.creatorId === currentUser.id) {
        // Use current user data for own requests
        creator = {
          id: currentUser.id,
          name: currentUser.name,
          userIdentifier: currentUser.userIdentifier,
        } as UserProfile;
      } else {
        // Fetch creator profile for friends' requests
        creator = await fetchUserProfile(request.creatorId);
      }

      return {
        id: request.id,
        creatorId: request.creatorId,
        content: request.content,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        viewableUntil: request.viewableUntil,
        creator,
      };
    },
    [
      currentUser.id,
      currentUser.name,
      currentUser.userIdentifier,
      fetchUserProfile,
    ]
  );

  // Helper function to add/update prayer request in state
  const addOrUpdatePrayerRequest = useCallback(
    (newRequest: PrayerRequestWithCreator) => {
      setPrayerRequests((prev) => {
        const existing = prev.find((p) => p.id === newRequest.id);
        let updated: PrayerRequestWithCreator[];

        if (existing) {
          // Update existing request
          updated = prev.map((p) => (p.id === newRequest.id ? newRequest : p));
        } else {
          // Add new request
          updated = [newRequest, ...prev];
        }

        // Sort by creation date (newest first)
        return updated.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    },
    []
  );

  // Helper function to remove prayer request from state
  const removePrayerRequest = useCallback((requestId: string) => {
    setPrayerRequests((prev) => prev.filter((p) => p.id !== requestId));
  }, []);

  // Setup subscriptions for real-time updates
  const setupSubscriptions = useCallback(
    async (friendIds: string[]) => {
      // Clean up existing subscriptions
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];

      if (friendIds.length === 0) {
        console.log(
          "No friends found, setting up subscriptions for own requests only"
        );
      }

      try {
        // All user IDs to subscribe to (friends + self)
        const allUserIds = [...friendIds, currentUser.id].filter(
          (id): id is string => id !== null && id !== undefined
        );

        console.log(
          "Setting up prayer request subscriptions for users:",
          allUserIds
        );

        // Subscribe to prayer request creation
        const createSub = client.models.PrayerRequest.onCreate({
          filter: {
            creatorId: {
              in: allUserIds,
            },
          },
        }).subscribe({
          next: async (data) => {
            console.log("New prayer request created:", data);

            // Check if still viewable
            const now = new Date().toISOString();
            if (data.viewableUntil > now) {
              const enrichedRequest = await enrichPrayerRequest(data);
              addOrUpdatePrayerRequest(enrichedRequest);
            }
          },
          error: (error) => {
            console.error("Prayer request create subscription error:", error);
          },
        });

        // Subscribe to prayer request updates
        const updateSub = client.models.PrayerRequest.onUpdate({
          filter: {
            creatorId: {
              in: allUserIds,
            },
          },
        }).subscribe({
          next: async (data) => {
            console.log("Prayer request updated:", data);

            // Check if still viewable
            const now = new Date().toISOString();
            if (data.viewableUntil > now) {
              const enrichedRequest = await enrichPrayerRequest(data);
              addOrUpdatePrayerRequest(enrichedRequest);
            } else {
              // Remove if no longer viewable
              removePrayerRequest(data.id);
            }
          },
          error: (error) => {
            console.error("Prayer request update subscription error:", error);
          },
        });

        // Subscribe to prayer request deletion
        const deleteSub = client.models.PrayerRequest.onDelete({
          filter: {
            creatorId: {
              in: allUserIds,
            },
          },
        }).subscribe({
          next: (data) => {
            console.log("Prayer request deleted:", data);
            removePrayerRequest(data.id);
          },
          error: (error) => {
            console.error("Prayer request delete subscription error:", error);
          },
        });

        // Store subscription references for cleanup
        subscriptionsRef.current = [createSub, updateSub, deleteSub];
        setSubscriptionsActive(true);

        console.log("Prayer request subscriptions established successfully");
      } catch (error) {
        console.error("Error setting up prayer request subscriptions:", error);
        setSubscriptionsActive(false);
      }
    },
    [
      currentUser.id,
      enrichPrayerRequest,
      addOrUpdatePrayerRequest,
      removePrayerRequest,
    ]
  );

  // Load initial prayer requests
  const loadPrayerRequests = useCallback(
    async (friendIds: string[]) => {
      setIsLoading(true);
      try {
        // Load both friends' and own requests in parallel
        const now = new Date().toISOString();
        const allUserIds = [...friendIds, currentUser.id].filter(
          (id): id is string => id !== null && id !== undefined
        );

        // Get all prayer requests that are still viewable
        const allRequests: PrayerRequestWithCreator[] = [];

        await Promise.all(
          allUserIds.map(async (userId) => {
            try {
              const result = await client.models.PrayerRequest.list({
                filter: {
                  and: [
                    { creatorId: { eq: userId } },
                    { viewableUntil: { gt: now } },
                  ],
                },
              });

              if (result.data && result.data.length > 0) {
                const enrichedRequests = await Promise.all(
                  result.data.map((request) => enrichPrayerRequest(request))
                );
                allRequests.push(...enrichedRequests);
              }
            } catch (error) {
              console.warn(
                `Failed to fetch prayer requests for user ${userId}:`,
                error
              );
            }
          })
        );

        // Sort by creation date (newest first)
        const sortedRequests = allRequests.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPrayerRequests(sortedRequests);
        console.log(`Loaded ${sortedRequests.length} prayer requests`);
      } catch (error) {
        console.error("Error loading prayer requests:", error);
        setPrayerRequests([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser.id, enrichPrayerRequest]
  );

  // Initialize prayer requests with subscriptions
  const initializePrayerRequests = useCallback(
    async (friendIds: string[]) => {
      console.log("Initializing prayer requests with friend IDs:", friendIds);

      // Load initial data
      await loadPrayerRequests(friendIds);

      // Setup real-time subscriptions
      await setupSubscriptions(friendIds);
    },
    [loadPrayerRequests, setupSubscriptions]
  );

  // Cleanup subscriptions
  const cleanupSubscriptions = useCallback(() => {
    console.log("Cleaning up prayer request subscriptions");
    subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
    subscriptionsRef.current = [];
    setSubscriptionsActive(false);
  }, []);

  // Refresh prayer requests manually
  const refreshPrayerRequests = useCallback(
    async (friendIds: string[]) => {
      await loadPrayerRequests(friendIds);
    },
    [loadPrayerRequests]
  );

  // Create a new prayer request
  const createPrayerRequest = useCallback(
    async (content: string, viewableUntil: string) => {
      if (!currentUser.id) {
        throw new Error("Current user not found");
      }

      setIsLoading(true);
      try {
        const result = await client.models.PrayerRequest.create({
          creatorId: currentUser.id,
          content,
          viewableUntil,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        if (result.data) {
          console.log("Prayer request created successfully");
          return result.data;
        }

        throw new Error("お祈りリクエストの作成に失敗しました");
      } catch (error) {
        console.error("Error creating prayer request:", error);
        handleError(error, "お祈りリクエストの作成に失敗しました");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser.id, handleError]
  );

  // Get prayer requests from friends that are still viewable
  const getFriendsPrayerRequests = useCallback(
    async (friendIds: string[]) => {
      if (friendIds.length === 0) return [];

      setIsLoading(true);
      try {
        const now = new Date().toISOString();

        // Get all prayer requests from friends that are still viewable
        const allRequests: PrayerRequestWithCreator[] = [];

        await Promise.all(
          friendIds.map(async (friendId) => {
            try {
              const result = await client.models.PrayerRequest.list({
                filter: {
                  and: [
                    { creatorId: { eq: friendId } },
                    { viewableUntil: { gt: now } },
                  ],
                },
              });

              if (result.data && result.data.length > 0) {
                // Fetch creator profile for each prayer request
                const requestsWithCreator = await Promise.all(
                  result.data.map(async (request) => {
                    try {
                      const creatorResult = await client.models.UserProfile.get(
                        {
                          id: request.creatorId,
                        }
                      );

                      return {
                        id: request.id,
                        creatorId: request.creatorId,
                        content: request.content,
                        createdAt: request.createdAt,
                        updatedAt: request.updatedAt,
                        viewableUntil: request.viewableUntil,
                        creator: creatorResult.data || undefined,
                      } as PrayerRequestWithCreator;
                    } catch (error) {
                      console.warn(
                        `Failed to fetch creator for request ${request.id}:`,
                        error
                      );
                      return {
                        id: request.id,
                        creatorId: request.creatorId,
                        content: request.content,
                        createdAt: request.createdAt,
                        updatedAt: request.updatedAt,
                        viewableUntil: request.viewableUntil,
                      } as PrayerRequestWithCreator;
                    }
                  })
                );

                allRequests.push(...requestsWithCreator);
              }
            } catch (error) {
              console.warn(
                `Failed to fetch prayer requests for friend ${friendId}:`,
                error
              );
            }
          })
        );

        // Sort by creation date (newest first)
        allRequests.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return allRequests;
      } catch (error) {
        console.error("Error fetching friends' prayer requests:", error);
        handleError(error, "お祈りリクエストの取得に失敗しました");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Get user's own prayer requests
  const getMyPrayerRequests = useCallback(async () => {
    if (!currentUser.id) return [];

    setIsLoading(true);
    try {
      const now = new Date().toISOString();

      const result = await client.models.PrayerRequest.list({
        filter: {
          and: [
            { creatorId: { eq: currentUser.id } },
            { viewableUntil: { gt: now } },
          ],
        },
      });

      if (!result.data) return [];

      // Sort by creation date (newest first)
      const sortedRequests = result.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return sortedRequests.map((request) => ({
        id: request.id,
        creatorId: request.creatorId,
        content: request.content,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        viewableUntil: request.viewableUntil,
        creator: {
          id: currentUser.id,
          name: currentUser.name,
          userIdentifier: currentUser.userIdentifier,
        } as UserProfile,
      })) as PrayerRequestWithCreator[];
    } catch (error) {
      console.error("Error fetching my prayer requests:", error);
      handleError(error, "お祈りリクエストの取得に失敗しました");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    currentUser.id,
    currentUser.name,
    currentUser.userIdentifier,
    handleError,
  ]);

  return {
    // New subscription-based API
    prayerRequests,
    subscriptionsActive,
    initializePrayerRequests,
    cleanupSubscriptions,
    refreshPrayerRequests,

    // Original functions (kept for backward compatibility)
    createPrayerRequest,
    getFriendsPrayerRequests,
    getMyPrayerRequests,
    isLoading,
  };
};
