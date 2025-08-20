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
  const [isImageReady, setIsImageReady] = useState(false); // New state for image ready

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
        setIsImageReady(false); // Reset image ready state
        try {
          const url = await getImageUrl(imagePath);
          setImageUrl(url);
          setIsLoadingImage(false); // Set loading to false when URL is ready
        } catch (error) {
          console.error("Failed to load profile image:", error);
          setImageUrl(null);
          setIsLoadingImage(false);
          setIsImageReady(false);
        }
      } else {
        setImageUrl(null);
        setIsLoadingImage(false);
        setIsImageReady(false);
      }
    };

    loadProfileImage();
  }, [imagePath]);

  const handleImageLoad = () => {
    setIsImageReady(true);
  };

  const handleImageError = () => {
    console.error("Image failed to load");
    setImageUrl(null);
    setIsImageReady(false);
  };

  const renderAvatarContent = () => {
    // Show skeleton while loading URL
    if (isLoadingImage) {
      return (
        <View style={{ width: size, height: size }}>
          <Skeleton className="w-full h-full rounded-full" />
        </View>
      );
    }

    // Show image with skeleton overlay until it's fully loaded
    if (imageUrl) {
      return (
        <View style={{ width: size, height: size }}>
          {/* Skeleton background while image loads */}
          {!isImageReady && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <Skeleton className="w-full h-full rounded-full" />
            </View>
          )}
          
          <Image
            source={{ uri: imageUrl }}
            style={{ 
              width: size, 
              height: size,
              opacity: isImageReady ? 1 : 0 // Hide until ready, then fade in
            }}
            className="rounded-full"
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            fadeDuration={150} // Smooth fade-in when image appears
          />
        </View>
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
