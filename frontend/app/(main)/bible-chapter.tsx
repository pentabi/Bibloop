import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Book,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { openKougoDB } from "~/utils/Kougodb";
import { Skeleton } from "~/components/ui/skeleton";

interface Verse {
  verse: number;
  text: string;
}

const BibleChapter = () => {
  const router = useRouter();
  const { bookId, bookName, chapter } = useLocalSearchParams<{
    bookId: string;
    bookName: string;
    chapter: string;
  }>();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);

  const currentChapter = parseInt(chapter || "1");
  const currentBookId = parseInt(bookId || "1");

  useEffect(() => {
    if (bookId && chapter) {
      loadChapter();
      getTotalChapters();
    }
  }, [bookId, chapter]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      const db = await openKougoDB();

      // Start loading data and minimum delay simultaneously
      const [dataResult] = await Promise.all([
        (async () => {
          const db = await openKougoDB();
          return db.getAllSync(
            "SELECT verse, text FROM JapKougo_verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC",
            [currentBookId, currentChapter]
          ) as Array<{ verse: number; text: string }>;
        })(),
        new Promise((resolve) => setTimeout(resolve, 300)), // Minimum 300ms loading
      ]);
      setVerses(dataResult);
      setError(null);
    } catch (error) {
      console.error("Error loading chapter:", error);
      setError("章の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getTotalChapters = async () => {
    try {
      const db = await openKougoDB();
      const result = db.getAllSync(
        "SELECT COUNT(DISTINCT chapter) as total FROM JapKougo_verses WHERE book_id = ?",
        [currentBookId]
      ) as Array<{ total: number }>;

      setTotalChapters(result[0]?.total || 0);
    } catch (error) {
      console.error("Error getting total chapters:", error);
    }
  };

  const navigateToChapter = (newChapter: number) => {
    router.setParams({
      bookId: bookId!,
      bookName: bookName!,
      chapter: newChapter.toString(),
    });
  };

  const canGoPrevious = currentChapter > 1;
  const canGoNext = currentChapter < totalChapters;

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-blue-500 pt-12 pb-4 px-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <ArrowLeft size={24} color="white" />
              <Text className="text-white ml-2">戻る</Text>
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <View className="flex-row items-center">
                <Book size={20} color="white" />
                <Text className="text-white text-lg font-bold ml-2">
                  {bookName}
                </Text>
              </View>
              <Text className="text-white/80 text-sm">第{chapter}章</Text>
            </View>

            <View className="w-16" />
          </View>
        </View>
        {/* Chapter Navigation */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() =>
                canGoPrevious && navigateToChapter(currentChapter - 1)
              }
              disabled={!canGoPrevious}
              className={`flex-row items-center px-4 py-2 rounded-lg ${
                canGoPrevious ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <ChevronLeft
                size={16}
                className={canGoPrevious ? "text-blue-600" : "text-gray-400"}
              />
              <Text
                className={`ml-1 text-sm ${
                  canGoPrevious ? "text-blue-600" : "text-gray-400"
                }`}
              >
                前の章
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-600 text-sm">
              {currentChapter} / {totalChapters}
            </Text>

            <TouchableOpacity
              onPress={() => canGoNext && navigateToChapter(currentChapter + 1)}
              disabled={!canGoNext}
              className={`flex-row items-center px-4 py-2 rounded-lg ${
                canGoNext ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`mr-1 text-sm ${
                  canGoNext ? "text-blue-600" : "text-gray-400"
                }`}
              >
                次の章
              </Text>
              <ChevronRight
                size={16}
                className={canGoNext ? "text-blue-600" : "text-gray-400"}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 justify-center items-center bg-background p-4">
          <View className="gap-4 w-full">
            <Skeleton className="p-6 mr-20" />

            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
            <Skeleton className="p-4" />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={loadChapter}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white">再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowLeft size={24} color="white" />
            <Text className="text-white ml-2">戻る</Text>
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <View className="flex-row items-center">
              <Book size={20} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                {bookName}
              </Text>
            </View>
            <Text className="text-white/80 text-sm">第{chapter}章</Text>
          </View>

          <View className="w-16" />
        </View>
      </View>

      {/* Chapter Navigation */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() =>
              canGoPrevious && navigateToChapter(currentChapter - 1)
            }
            disabled={!canGoPrevious}
            className={`flex-row items-center px-4 py-2 rounded-lg ${
              canGoPrevious ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ChevronLeft
              size={16}
              className={canGoPrevious ? "text-blue-600" : "text-gray-400"}
            />
            <Text
              className={`ml-1 text-sm ${
                canGoPrevious ? "text-blue-600" : "text-gray-400"
              }`}
            >
              前の章
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-sm">
            {currentChapter} / {totalChapters}
          </Text>

          <TouchableOpacity
            onPress={() => canGoNext && navigateToChapter(currentChapter + 1)}
            disabled={!canGoNext}
            className={`flex-row items-center px-4 py-2 rounded-lg ${
              canGoNext ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`mr-1 text-sm ${
                canGoNext ? "text-blue-600" : "text-gray-400"
              }`}
            >
              次の章
            </Text>
            <ChevronRight
              size={16}
              className={canGoNext ? "text-blue-600" : "text-gray-400"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verses */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {verses.length > 0 ? (
          <View className="bg-card rounded-xl p-4 border border-border">
            {verses.map((verse, index) => (
              <View key={verse.verse} className="mb-4">
                <Text className="text-base text-foreground leading-7">
                  <Text className="font-bold text-blue-600 mr-2">
                    {verse.verse}.
                  </Text>
                  {verse.text}
                </Text>
                {index < verses.length - 1 && (
                  <View className="h-px bg-border/50 mt-4" />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Book size={48} className="text-muted-foreground mb-4" />
            <Text className="text-muted-foreground text-center">
              この章には節が見つかりませんでした
            </Text>
          </View>
        )}

        {/* Bottom Navigation Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default BibleChapter;
