import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Calendar,
  Settings,
  Edit3,
  Check,
  X,
} from "lucide-react-native";
import { signOut, signOutAutomatic } from "~/utils/signOut";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { setUser } from "~/redux/slices/userSlice";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileImageUploader } from "~/components/ProfileImageUploader";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/data-schema";

const client = generateClient<Schema>();

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [isEditingTestimony, setIsEditingTestimony] = useState(false);
  const [testimonyText, setTestimonyText] = useState(user?.testimony || "");
  const [isSavingTestimony, setIsSavingTestimony] = useState(false);

  // Update testimony text when user data changes
  useEffect(() => {
    setTestimonyText(user?.testimony || "");
  }, [user?.testimony]);

  const handleSaveTestimony = async () => {
    if (!user?.id) {
      Alert.alert("エラー", "ユーザー情報が見つかりません");
      return;
    }

    try {
      setIsSavingTestimony(true);

      // Update the user profile in the database
      const { data: updatedProfile, errors } =
        await client.models.UserProfile.update({
          id: user.id,
          testimony: testimonyText.trim() || null,
        });

      if (errors) {
        console.error("Error updating testimony:", errors);
        Alert.alert("エラー", "証の更新に失敗しました");
        return;
      }

      // Update Redux state
      dispatch(setUser({ testimony: testimonyText.trim() || null }));
      setIsEditingTestimony(false);
    } catch (error) {
      console.error("Error updating testimony:", error);
      Alert.alert("エラー", "証の更新に失敗しました");
    } finally {
      setIsSavingTestimony(false);
    }
  };

  const handleCancelEdit = () => {
    setTestimonyText(user?.testimony || "");
    setIsEditingTestimony(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <Text className="text-xl font-semibold text-gray-900">
            {user?.name || "名前未設定"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="p-2"
          >
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View className="px-4 py-6">
          {/* Profile Image and Stats Row */}
          <View className="flex-row items-center mb-6">
            {/* Profile Image */}
            <View className="mr-8">
              <ProfileImageUploader size={80} showUploadButton={true} />
            </View>

            {/* Stats */}
            <View className="flex-1 flex-row justify-around">
              <TouchableOpacity className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {user?.streaks || 0}
                </Text>
                <Text className="text-sm text-gray-600">連続日数</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {user?.maximumStreaks || 0}
                </Text>
                <Text className="text-sm text-gray-600">最高記録</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Info */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-900 mb-1">
              {user?.name || "名前未設定"}
            </Text>
            <Text className="text-sm text-gray-600">
              @{user?.userId || "userid"}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => router.push("/add-friend")}
              className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-medium">友達を追加</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/friends-list")}
              className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-900 font-medium">友達リスト</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimony Section */}
        <View className="border-t border-gray-200 pt-4">
          <View className="px-4 mb-4">
            <Text className="text-base font-semibold text-gray-900">証</Text>
          </View>

          <View className="px-4 pb-8">
            {isEditingTestimony ? (
              <View>
                <TextInput
                  value={testimonyText}
                  onChangeText={setTestimonyText}
                  placeholder="あなたの証を書いてください..."
                  multiline
                  numberOfLines={6}
                  className="text-base text-gray-900 border border-gray-200 rounded-lg p-4 mb-4"
                  style={{ minHeight: 120, textAlignVertical: "top" }}
                  autoFocus
                />
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    disabled={isSavingTestimony}
                    className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
                  >
                    <Text className="text-gray-700 font-medium">
                      キャンセル
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveTestimony}
                    disabled={isSavingTestimony}
                    className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                  >
                    <Text className="text-white font-medium">
                      {isSavingTestimony ? "保存中..." : "保存"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingTestimony(true)}
                className="min-h-[120px] bg-gray-50 rounded-lg p-4 justify-center"
              >
                {user?.testimony ? (
                  <Text className="text-base text-gray-900 leading-6">
                    {user.testimony}
                  </Text>
                ) : (
                  <View className="items-center">
                    <Edit3 size={32} color="#9CA3AF" />
                    <Text className="text-gray-500 text-center mt-2">
                      証を追加するにはタップしてください
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
