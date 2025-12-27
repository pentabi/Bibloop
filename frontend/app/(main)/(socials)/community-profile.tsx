import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/data-schema";
import { useImageHandler } from "~/hooks/useImageHandler";
import { useFriendship } from "~/hooks/useFriendship";

const client = generateClient<Schema>();

const CommunityProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [communityUser, setCommunityUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const userId = params.id as string; // Cognito user ID
  const { getImageUrl } = useImageHandler();
  const { sendFriendRequest, isLoading: friendshipLoading } = useFriendship();

  // Load profile image when communityUser changes
  useEffect(() => {
    const loadProfileImage = async () => {
      if (communityUser?.profileImagePath) {
        setIsLoadingImage(true);
        try {
          const url = await getImageUrl(communityUser.profileImagePath);
          setImageUrl(url);
        } catch (error) {
          console.error("Failed to load profile image:", error);
          setImageUrl(null);
        } finally {
          setIsLoadingImage(false);
        }
      } else {
        setImageUrl(null);
      }
    };

    loadProfileImage();
  }, [communityUser?.profileImagePath]);

  const handleFollowRequest = async () => {
    if (!communityUser?.userId) {
      Alert.alert("エラー", "ユーザー情報が見つかりません");
      return;
    }

    try {
      await sendFriendRequest(communityUser.userId);
      Alert.alert(
        "成功",
        `${communityUser.name || "ユーザー"}にフレンドリクエストを送信しました`,
        [{ text: "OK" }]
      );
      setIsFollowing(true);
    } catch (error) {
      console.error("Failed to send friend request:", error);
      // Error is already handled by the useFriendship hook
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        console.error("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch user profile by Cognito ID
        const { data: userProfile, errors } =
          await client.models.UserProfile.get({
            id: userId,
          });

        if (errors) {
          console.error("Error fetching user profile:", errors);
          return;
        }

        if (userProfile) {
          setCommunityUser(userProfile);
        } else {
          console.error("User profile not found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!communityUser) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">ユーザーが見つかりません</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-blue-600">戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">
              {communityUser.name}
            </Text>
          </View>
          {/* <TouchableOpacity className="p-2">
            <MoreHorizontal size={24} color="#000" />
          </TouchableOpacity> */}
        </View>

        {/* Profile Section */}
        <View className="px-4 py-6">
          {/* Profile Image and Stats Row */}
          <View className="flex-row items-center mb-6">
            {/* Profile Image */}
            <View className="mr-8">
              <View
                className="rounded-full border-2 border-gray-200 items-center justify-center"
                style={{ width: 84, height: 84 }}
              >
                {isLoadingImage ? (
                  <ActivityIndicator size="large" color="#3b82f6" />
                ) : imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 80, height: 80 }}
                    className="rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="bg-blue-500 rounded-full items-center justify-center"
                    style={{ width: 80, height: 80 }}
                  >
                    <Text className="text-white text-2xl font-bold">
                      {communityUser.name?.charAt(0) || "?"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stats */}
            <View className="flex-1 flex-row justify-around">
              <TouchableOpacity className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {communityUser.streaks}
                </Text>
                <Text className="text-sm text-gray-600">連続日数</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {communityUser.maximumStreaks}
                </Text>
                <Text className="text-sm text-gray-600">最高記録</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Info */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-900 mb-1">
              {communityUser.name}
            </Text>
            <Text className="text-sm text-gray-600">
              @{communityUser.userId}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={handleFollowRequest}
              disabled={friendshipLoading || isFollowing}
              className={`flex-1 rounded-lg py-3 items-center ${
                isFollowing ? "border border-gray-300" : "bg-blue-600"
              } ${friendshipLoading ? "opacity-50" : ""}`}
            >
              <Text
                className={`font-medium ${
                  isFollowing ? "text-gray-900" : "text-white"
                }`}
              >
                {friendshipLoading
                  ? "送信中..."
                  : isFollowing
                  ? "リクエスト送信済み"
                  : "フォローする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/mutual-friends" as any,
                  params: {
                    userId: communityUser.id,
                    userName: communityUser.name,
                  },
                })
              }
              className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-900 font-medium">共通の友達</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimony Section */}
        <View className="border-t border-gray-200 pt-4">
          <View className="px-4 mb-4">
            <Text className="text-base font-semibold text-gray-900">証</Text>
          </View>

          <View className="px-4 pb-8">
            <View className="min-h-[120px] bg-gray-50 rounded-lg p-4 justify-center">
              {communityUser.testimony ? (
                <Text className="text-base text-gray-900 leading-6">
                  {communityUser.testimony}
                </Text>
              ) : (
                <Text className="text-gray-500 text-center italic">
                  証はまだ書かれていません
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityProfile;
