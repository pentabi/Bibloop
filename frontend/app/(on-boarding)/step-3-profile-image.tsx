import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Camera, Image as ImageIcon } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import useUserProfile from "~/hooks/useUserProfile";
import { useImageHandler } from "~/hooks/useImageHandler";
import { setOnboardingComplete } from "~/redux/slices/userSlice";
import * as ImagePicker from "expo-image-picker";

const Step3ProfileImage = () => {
  const router = useRouter();
  const { name, userId } = useLocalSearchParams<{
    name: string;
    userId: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { updateUserProfile, getUserProfile } = useUserProfile();
  const { uploadProfileImage } = useImageHandler();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos"
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your camera"
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert("プロフィール画像を選択", "どちらから選びますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "ギャラリー", onPress: pickImageFromGallery },
      { text: "カメラ", onPress: takePhoto },
    ]);
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadSelectedImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setIsUploadingImage(true);
    try {
      const storagePath = await uploadProfileImage(selectedImage);
      return storagePath;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      Alert.alert("エラー", "プロフィール画像のアップロードに失敗しました");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      // Upload the profile image first if one is selected
      let profileImagePath = null;
      if (selectedImage) {
        profileImagePath = await uploadSelectedImage();
      }

      // Get the current user profile
      if (user.userIdentifier) {
        const currentProfile = await getUserProfile(user.userIdentifier);

        if (currentProfile) {
          // Update the user profile with the name and profile image path
          const updateData: any = {
            id: currentProfile.id,
            name: name || "",
            userId: userId,
          };

          if (profileImagePath) {
            updateData.profileImagePath = profileImagePath;
          }

          await updateUserProfile(updateData);

          // Mark onboarding as complete in Redux
          dispatch(setOnboardingComplete());

          // Navigate to main app
          router.replace("/(main)/(bottomTabs)/home");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "エラー",
        "セットアップ中にエラーが発生しました。もう一度お試しください。"
      );
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

          {/* Profile Image Selection */}
          <View className="items-center mt-8">
            <Pressable
              onPress={showImagePickerOptions}
              className="relative w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-2 border-dashed border-gray-400"
              disabled={isUploadingImage}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-full rounded-full"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <View className="items-center">
                  <Camera size={32} className="text-gray-500 mb-2" />
                  <Text className="text-sm text-gray-500 text-center">
                    タップして{"\n"}画像を選択
                  </Text>
                </View>
              )}

              {/* Loading overlay */}
              {isUploadingImage && (
                <View className="absolute inset-0 rounded-full bg-black/50 items-center justify-center">
                  <Text className="text-white text-xs">アップロード中...</Text>
                </View>
              )}
            </Pressable>

            {selectedImage && (
              <Pressable
                onPress={() => setSelectedImage(null)}
                className="mt-2 p-2"
              >
                <Text className="text-red-500 text-sm">画像を削除</Text>
              </Pressable>
            )}
          </View>
        </View>
        <View>
          <Button
            onPress={handleCompleteOnboarding}
            className="rounded-full my-4 py-4"
            disabled={isLoading || isUploadingImage}
          >
            <Text className="font-semibold">
              {isLoading
                ? "設定中..."
                : isUploadingImage
                ? "画像をアップロード中..."
                : "バイブループを始める！"}
            </Text>
          </Button>

          {!selectedImage && (
            <Text className="text-center text-sm opacity-50 mb-4">
              プロフィール画像は後からでも設定できます
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step3ProfileImage;
