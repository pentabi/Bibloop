import { useEffect, useState } from "react";
import { useImageHandler } from "./useImageHandler";

export const useImagePreloader = () => {
  const { getImageUrl } = useImageHandler();
  const [preloadedImages, setPreloadedImages] = useState<Map<string, string>>(
    new Map()
  );
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadImages = async (imagePaths: string[]) => {
    if (imagePaths.length === 0) return;

    setIsPreloading(true);
    const newPreloadedImages = new Map(preloadedImages);

    // Load all images in parallel
    const loadPromises = imagePaths.map(async (path) => {
      if (!newPreloadedImages.has(path)) {
        try {
          const url = await getImageUrl(path);
          if (url) {
            newPreloadedImages.set(path, url);
          }
        } catch (error) {
          console.error(`Failed to preload image: ${path}`, error);
          // Don't add to map if failed to load
        }
      }
    });

    await Promise.all(loadPromises);
    setPreloadedImages(newPreloadedImages);
    setIsPreloading(false);
  };

  const getPreloadedImage = (path: string): string | null => {
    return preloadedImages.get(path) || null;
  };

  return {
    preloadImages,
    getPreloadedImage,
    isPreloading,
  };
};
