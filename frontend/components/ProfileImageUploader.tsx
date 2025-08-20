import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { useImageHandler } from "../hooks/useImageHandler";
import { Camera, User } from "lucide-react-native";

interface ProfileImageUploaderProps {
  size?: number;
  showUploadButton?: boolean;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  size = 120,
  showUploadButton = true,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const { selectAndUploadProfileImage, getImageUrl, isUploading } =
    useImageHandler();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Load profile image when component mounts or profileImagePath changes
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user.profileImagePath) {
        setIsLoadingImage(true);
        try {
          const url = await getImageUrl(user.profileImagePath);
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
  }, [user.profileImagePath, getImageUrl]);

  const handleImageUpload = async () => {
    const uploadedPath = await selectAndUploadProfileImage();
    if (uploadedPath) {
      // Image URL will be updated automatically through Redux state change
      console.log("Profile image uploaded successfully:", uploadedPath);
    }
  };

  const renderImageContent = () => {
    if (isUploading || isLoadingImage) {
      return (
        <View
          className="items-center justify-center"
          style={{ width: size, height: size }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-xs text-muted-foreground mt-2">
            {isUploading ? "アップロード中..." : "読み込み中..."}
          </Text>
        </View>
      );
    }

    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          className="rounded-full"
          resizeMode="cover"
        />
      );
    }

    // Default avatar
    return (
      <View
        className="bg-muted rounded-full items-center justify-center"
        style={{ width: size, height: size }}
      >
        <User size={size * 0.5} color="#999" />
      </View>
    );
  };

  return (
    <View className="items-center">
      {/* Profile Image */}
      <View className="relative">
        {renderImageContent()}

        {/* Upload Button Overlay */}
        {showUploadButton && (
          <TouchableOpacity
            onPress={handleImageUpload}
            disabled={isUploading}
            className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-background"
            style={{ opacity: isUploading ? 0.6 : 1 }}
          >
            <Camera size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Upload Button (Alternative) */}
      {showUploadButton && (
        <TouchableOpacity
          onPress={handleImageUpload}
          disabled={isUploading}
          className="mt-3 bg-primary/10 px-4 py-2 rounded-lg"
        >
          <Text className="text-primary text-sm font-medium">
            {isUploading ? "アップロード中..." : "プロフィール画像を変更"}
          </Text>
        </TouchableOpacity>
      )}

      {/* User Info */}
      <View className="mt-2 items-center">
        <Text className="text-foreground font-semibold">
          {user.name || "名前未設定"}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {user.userIdentifier}
        </Text>
      </View>
    </View>
  );
};

export default ProfileImageUploader;
