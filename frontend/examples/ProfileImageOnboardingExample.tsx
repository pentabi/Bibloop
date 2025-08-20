// Example usage in your onboarding flow (step-3-profile-image.tsx)

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ProfileImageUploader from "../components/ProfileImageUploader";

const Step3ProfileImage = () => {
  const router = useRouter();

  const handleContinue = () => {
    // Profile image is optional, user can continue without it
    router.replace("/(main)/(bottomTabs)/home");
  };

  const handleSkip = () => {
    // Skip profile image setup
    router.replace("/(main)/(bottomTabs)/home");
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      {/* Header */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-foreground mb-2">
          プロフィール画像を設定
        </Text>
        <Text className="text-muted-foreground text-center">
          プロフィール画像を設定して、他のユーザーに自分を知ってもらいましょう
        </Text>
      </View>

      {/* Profile Image Uploader */}
      <View className="items-center mb-8">
        <ProfileImageUploader size={150} showUploadButton={true} />
      </View>

      {/* Action Buttons */}
      <View className="flex-1 justify-end pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary p-4 rounded-xl mb-3"
        >
          <Text className="text-white text-center font-semibold text-lg">
            完了
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          className="bg-muted p-4 rounded-xl"
        >
          <Text className="text-muted-foreground text-center font-medium">
            スキップ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step3ProfileImage;
