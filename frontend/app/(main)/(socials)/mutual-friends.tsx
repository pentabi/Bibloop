import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Users } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/data-schema";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

const client = generateClient<Schema>();

const MutualFriends = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUser = useSelector((state: RootState) => state.user);
  const [mutualFriends, setMutualFriends] = useState<any[]>([]);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const targetUserId = params.userId as string; // Cognito user ID of the other user

  useEffect(() => {
    const fetchMutualFriends = async () => {
      if (!targetUserId || !currentUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First, get the target user's info
        const { data: targetUserProfile } = await client.models.UserProfile.get(
          {
            id: targetUserId,
          }
        );

        if (targetUserProfile) {
          setTargetUser(targetUserProfile);
        }

        // Get current user's friends
        const { data: currentUserFriends } =
          await client.models.Friendship.list({
            filter: {
              or: [
                {
                  requesterId: { eq: currentUser.id },
                  status: { eq: "accepted" },
                },
                {
                  addresseeId: { eq: currentUser.id },
                  status: { eq: "accepted" },
                },
              ],
            },
          });

        // Get target user's friends
        const { data: targetUserFriends } = await client.models.Friendship.list(
          {
            filter: {
              or: [
                {
                  requesterId: { eq: targetUserId },
                  status: { eq: "accepted" },
                },
                {
                  addresseeId: { eq: targetUserId },
                  status: { eq: "accepted" },
                },
              ],
            },
          }
        );

        // Find mutual friends
        const currentFriendIds = new Set();
        currentUserFriends?.forEach((friendship) => {
          const friendId =
            friendship.requesterId === currentUser.id
              ? friendship.addresseeId
              : friendship.requesterId;
          currentFriendIds.add(friendId);
        });

        const mutualFriendIds = new Set();
        targetUserFriends?.forEach((friendship) => {
          const friendId =
            friendship.requesterId === targetUserId
              ? friendship.addresseeId
              : friendship.requesterId;
          if (currentFriendIds.has(friendId)) {
            mutualFriendIds.add(friendId);
          }
        });

        // Fetch profiles of mutual friends
        const mutualFriendProfiles = [];
        for (const friendId of mutualFriendIds) {
          const { data: profile } = await client.models.UserProfile.get({
            id: friendId as string,
          });
          if (profile) {
            mutualFriendProfiles.push(profile);
          }
        }

        setMutualFriends(mutualFriendProfiles);
      } catch (error) {
        console.error("Error fetching mutual friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMutualFriends();
  }, [targetUserId, currentUser?.id]);

  const handleFriendPress = (friend: any) => {
    router.push({
      pathname: "/(main)/(socials)/community-profile",
      params: {
        id: friend.id,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">共通の友達</Text>
      </View>

      {/* Subtitle */}
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-sm text-gray-600">
          あなたと{targetUser?.name || "このユーザー"}さんの共通の友達
        </Text>
      </View>

      <ScrollView className="flex-1">
        {mutualFriends.length > 0 ? (
          <View className="p-4">
            {mutualFriends.map((friend: any) => (
              <TouchableOpacity
                key={friend.id}
                onPress={() => handleFriendPress(friend)}
                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                {/* Profile Image */}
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">
                    {friend.name.charAt(0)}
                  </Text>
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    {friend.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    @{friend.userId}
                  </Text>
                </View>

                {/* Friend Indicator */}
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-green-700 font-medium">
                    友達
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Users size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              共通の友達はいません
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {targetUser?.name || "このユーザー"}さんとの共通の友達がいません
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MutualFriends;
