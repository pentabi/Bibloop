import React, { useState, useEffect } from "react";
import { View, Image, Text } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { useImageHandler } from "../hooks/useImageHandler";
import { Skeleton } from "./ui/skeleton";

interface ProfileAvatarProps {
  size?: number;
  userId?: string; // Optional: to show other users' avatars
  profileImagePath?: string; // Optional: to show specific profile image
  userName?: string; // For fallback display
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 40,
  userId,
  profileImagePath,
  userName,
}) => {
  const currentUser = useSelector((state: RootState) => state.user);
  const { getImageUrl } = useImageHandler();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Determine which profile image path to use
  const imagePath =
    profileImagePath ||
    (userId === currentUser.id ? currentUser.profileImagePath : null);
  const displayName = userName || currentUser.name;

  // Load profile image when component mounts or imagePath changes
  useEffect(() => {
    const loadProfileImage = async () => {
      if (imagePath) {
        setIsLoadingImage(true);
        try {
          const url = await getImageUrl(imagePath);
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
  }, [imagePath]);

  const renderAvatarContent = () => {
    if (isLoadingImage) {
      return (
        <View style={{ width: size, height: size }}>
          <Skeleton className="w-full h-full rounded-full" />
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

    // Default avatar with first letter of name
    const firstLetter = (displayName || "U").charAt(0).toUpperCase();
    const fontSize = size * 0.4;

    return (
      <View
        className="bg-blue-500 rounded-full items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Text className="text-white font-semibold" style={{ fontSize }}>
          {firstLetter}
        </Text>
      </View>
    );
  };

  return renderAvatarContent();
};

export default ProfileAvatar;
