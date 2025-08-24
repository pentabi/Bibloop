import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadData, getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import { useDispatch, useSelector } from "react-redux";
import { useErrorHandler } from "./useErrorHandler";
import { client } from "../lib/amplify-client";
import { RootState } from "../redux/rootReducer";
import { useState } from "react";
import useUserProfile from "./useUserProfile";

/**
 * Hook to handle image selection, camera access, upload, and retrieval from S3.
 * Specifically optimized for profile image uploads with UserProfile integration.
 */
export const useImageHandler = () => {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const { updateUserProfile } = useUserProfile();
  const currentUser = useSelector((state: RootState) => state.user);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Requests camera and media library permissions from the user.
   * @returns `true` if both permissions are granted, otherwise `false`.
   */
  const requestPermission = async (): Promise<boolean> => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== "granted" || mediaStatus.status !== "granted") {
      Alert.alert(
        "権限が必要です",
        "カメラとメディアライブラリへのアクセスを許可してください"
      );
      return false;
    }
    return true;
  };

  /**
   * Opens the device's media library and allows the user to pick an image.
   * @returns The selected image URI, or `null` if canceled or permission denied.
   */
  const pickFromLibrary = async (): Promise<string | null> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Higher quality for profile images
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    return !result.canceled ? result.assets[0].uri : null;
  };

  /**
   * Launches the device's camera and allows the user to take a photo.
   * @returns The captured image URI, or `null` if canceled or permission denied.
   */
  const takePhoto = async (): Promise<string | null> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Higher quality for profile images
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    return !result.canceled ? result.assets[0].uri : null;
  };

  /**
   * Generates a unique profile image path for S3 storage.
   * @param userId - The user's ID for organizing the storage path
   * @returns A unique S3 path for the profile image
   */
  const generateProfileImagePath = (userId: string): string => {
    return `public/profile-pictures/${userId}/cover.jpg`;
  };

  /**
   * Uploads a profile image to S3 and updates the UserProfile.
   * @param imageUri - The local URI of the image to upload.
   * @returns The S3 path of the uploaded image, or `null` if failed.
   */
  const uploadProfileImage = async (
    imageUri: string
  ): Promise<string | null> => {
    if (!imageUri || !currentUser.id) {
      Alert.alert("エラー", "画像またはユーザー情報が見つかりません");
      return null;
    }

    setIsUploading(true);
    try {
      // Generate unique S3 path
      const s3Path = generateProfileImagePath(currentUser.id);

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to S3
      const { path } = await uploadData({
        path: s3Path,
        data: blob,
        options: {
          contentType: "image/jpeg",
        },
      }).result;

      console.log("Image uploaded to S3:", path);

      // Update UserProfile with new image path
      const updatedProfile = await updateUserProfile({
        id: currentUser.id,
        profileImagePath: path,
      });

      if (updatedProfile) {
        Alert.alert("成功", "プロフィール画像が更新されました");
        return path;
      } else {
        throw new Error("Failed to update user profile");
      }
    } catch (error) {
      console.error("Profile image upload failed:", error);
      handleError(error, "プロフィール画像のアップロードに失敗しました");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Uploads an image to S3 using a specified full path (generic upload).
   * @param imageUri - The local URI of the image to upload.
   * @param fullPath - The full S3 path where the image will be stored.
   * @returns The path of the uploaded image, or `null` if failed.
   */
  const uploadImage = async (
    imageUri: string,
    fullPath: string
  ): Promise<string | null> => {
    try {
      if (!imageUri) {
        return "";
      }
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { path } = await uploadData({
        path: fullPath,
        data: blob,
        options: { contentType: "image/jpeg" },
      }).result;

      return path;
    } catch (e) {
      console.error("Upload failed:", e);
      handleError(e, "アップロードに失敗しました");
      return null;
    }
  };

  /**
   * Retrieves a signed URL for accessing an image from S3.
   * @param fullPath - The full S3 path of the image.
   * @returns A public URL if the image exists, or null if not found.
   */
  const getImageUrl = async (fullPath: string): Promise<string | null> => {
    try {
      if (!fullPath) return null;

      const { url } = await getUrl({
        path: fullPath,
        options: {
          expiresIn: 3600, // URL expires in 1 hour
        },
      });
      return url.href;
    } catch (e) {
      console.error("Get URL failed:", e);
      handleError(e, "画像の取得に失敗しました");
      return null;
    }
  };

  /**
   * Complete profile image selection and upload workflow.
   * Shows action sheet to choose between camera or gallery, then uploads.
   * @returns The S3 path of the uploaded image, or null if failed/canceled.
   */
  const selectAndUploadProfileImage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.alert("プロフィール画像を選択", "画像の選択方法を選んでください", [
        {
          text: "キャンセル",
          style: "cancel",
          onPress: () => resolve(null),
        },
        {
          text: "ギャラリー",
          onPress: async () => {
            const imageUri = await pickFromLibrary();
            if (imageUri) {
              const s3Path = await uploadProfileImage(imageUri);
              resolve(s3Path);
            } else {
              resolve(null);
            }
          },
        },
        {
          text: "カメラ",
          onPress: async () => {
            const imageUri = await takePhoto();
            if (imageUri) {
              const s3Path = await uploadProfileImage(imageUri);
              resolve(s3Path);
            } else {
              resolve(null);
            }
          },
        },
      ]);
    });
  };

  return {
    // Basic image selection
    pickFromLibrary,
    takePhoto,

    // Profile image specific
    uploadProfileImage,
    selectAndUploadProfileImage,

    // Generic image operations
    uploadImage,
    getImageUrl,

    // State
    isUploading,
  };
};
