import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, X } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import useUserProfile from "~/hooks/useUserProfile";
import { setOnboardingComplete } from "~/redux/slices/userSlice";

const Step3ProfileImage = () => {
  const router = useRouter();
  const { name, username } = useLocalSearchParams<{
    name: string;
    username: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { updateUserProfile, getUserProfile } = useUserProfile();

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      // Get the current user profile
      if (user.userIdentifier) {
        const currentProfile = await getUserProfile(user.userIdentifier);

        if (currentProfile) {
          // Update the user profile with the name (and username if you want to store it)
          await updateUserProfile({
            id: currentProfile.id,
            name: name || "",
            userId: username,
          });

          // Mark onboarding as complete in Redux
          dispatch(setOnboardingComplete());

          // Navigate to main app
          router.replace("/(main)/(bottomTabs)/home");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      {/* exit */}
      <Pressable
        onPress={() => {
          router.back();
        }}
        className="mb-2"
      >
        <ArrowLeft size={20} />
      </Pressable>
      {/* progress */}
      <View className="h-2 gap-2 flex-row">
        <View className="flex-1 rounded-full bg-primary" />
        <View className="flex-1 rounded-full bg-primary" />
        <View className="flex-1 rounded-full bg-primary" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-between"
      >
        <View>
          <View className="py-4 gap-2 mt-6">
            <Text className="text-3xl font-bold">プロフィール画像をつける</Text>
            <Text className="text-xl font-medium opacity-50">
              見られちゃダメな情報はアップロードしないようにね！
            </Text>
            {name && (
              <Text className="text-lg font-medium opacity-70 mt-4">
                こんにちは、{name}さん！
              </Text>
            )}
          </View>
        </View>
        <View>
          <Button
            onPress={handleCompleteOnboarding}
            className="rounded-full my-4 py-4"
            disabled={isLoading}
          >
            <Text className="font-semibold">
              {isLoading ? "設定中..." : "バイブループを始める！"}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step3ProfileImage;
