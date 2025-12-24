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
  }, [user.profileImagePath]);

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
        <View className="rounded-full border-2 border-gray-200">
          {renderImageContent()}
        </View>

        {/* Upload Button Overlay */}
        {showUploadButton && (
          <TouchableOpacity
            onPress={handleImageUpload}
            disabled={isUploading}
            className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1.5 border-2 border-white shadow-sm"
            style={{ opacity: isUploading ? 0.6 : 1 }}
          >
            <Camera size={12} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfileImageUploader;
