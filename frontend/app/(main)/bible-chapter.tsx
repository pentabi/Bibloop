import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Book,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Check,
} from "lucide-react-native";
import { useKougoChapterData } from "~/hooks/useKougoChapterData";
import { SheetWithComments } from "~/components/bible/SheetWithComments";
import { useChapterCompletion } from "~/hooks/useChapterCompletion";

const BibleChapter = () => {
  const router = useRouter();
  const { bookId, bookName, chapter } = useLocalSearchParams<{
    bookId: string;
    bookName: string;
    chapter: string;
  }>();

  const currentChapter = parseInt(chapter || "1");
  const currentBookId = parseInt(bookId || "1");

  // Use the custom hook
  const { verses, error, totalChapters, loadKougoChapter } =
    useKougoChapterData(currentBookId, currentChapter);

  // Use chapter completion hook for any chapter
  const { isCompleted, markingLoading, toggleCompletion } =
    useChapterCompletion(bookName as string, currentChapter);

  const navigateToChapter = (newChapter: number) => {
    router.setParams({
      bookId: bookId!,
      bookName: bookName!,
      chapter: newChapter.toString(),
    });
  };

  const canGoPrevious = currentChapter > 1;
  const canGoNext = currentChapter < totalChapters;

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <View
          className="bg-red-50 border border-red-200 p-6 rounded-xl"
          style={{
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="items-center mb-4">
            <View className="bg-red-100 rounded-full p-3 mb-3">
              <Book size={24} color="#EF4444" />
            </View>
            <Text className="text-red-600 text-center font-bold text-lg mb-2">
              読み込みエラー
            </Text>
            <Text className="text-red-500 text-center text-sm leading-5">
              {error}
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadKougoChapter}
            className="bg-red-500 px-6 py-3 rounded-lg active:scale-95"
            style={{
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white text-center font-semibold">再試行</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SheetWithComments bookName={bookName || ""} chapter={currentChapter}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 bg-primary">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-3"
          >
            <ArrowLeft size={18} color="black" />
            <Text className="text-black ml-2 text-sm font-medium">戻る</Text>
          </TouchableOpacity>

          {/* Chapter Title */}
          <View className="mb-3">
            <Text className="text-white text-sm font-medium mb-1">聖書</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white font-bold text-2xl mr-2">
                {bookName}
              </Text>
              <Text className="text-white font-bold text-xl">
                第{chapter}章
              </Text>
            </View>
          </View>

          {/* Compact Chapter Navigation */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() =>
                canGoPrevious && navigateToChapter(currentChapter - 1)
              }
              disabled={!canGoPrevious}
              className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                canGoPrevious ? "bg-black/10" : "bg-black/5"
              }`}
            >
              <ChevronLeft
                size={14}
                color={canGoPrevious ? "black" : "rgba(0,0,0,0.3)"}
              />
              <Text
                className={`ml-1 text-xs font-medium ${
                  canGoPrevious ? "text-black" : "text-black/30"
                }`}
              >
                前の章
              </Text>
            </TouchableOpacity>

            <Text className="text-black/60 text-xs font-medium">
              {currentChapter} / {totalChapters}
            </Text>

            <TouchableOpacity
              onPress={() => canGoNext && navigateToChapter(currentChapter + 1)}
              disabled={!canGoNext}
              className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                canGoNext ? "bg-black/10" : "bg-black/5"
              }`}
            >
              <Text
                className={`mr-1 text-xs font-medium ${
                  canGoNext ? "text-black" : "text-black/30"
                }`}
              >
                次の章
              </Text>
              <ChevronRight
                size={14}
                color={canGoNext ? "black" : "rgba(0,0,0,0.3)"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verses */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        >
          {verses.length > 0 ? (
            <View>
              <View className="space-y-3">
                {verses.map((verse, index) => (
                  <Text
                    key={verse.verse}
                    className="text-xl text-gray-800 mb-3 leading-8"
                  >
                    <Text className="text-base text-gray-500 font-medium mr-2">
                      {verse.verse}.{" "}
                    </Text>
                    {verse.text}
                  </Text>
                ))}
              </View>

              {/* Completion Toggle */}
              <View className="mt-8 mb-4">
                <TouchableOpacity
                  onPress={toggleCompletion}
                  disabled={markingLoading}
                  className={`flex-row items-center justify-center px-6 py-4 rounded-xl ${
                    isCompleted
                      ? "bg-green-50 border border-green-200"
                      : "bg-card border border-border"
                  }`}
                  style={{
                    shadowColor: isCompleted ? "#10B981" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isCompleted ? 0.1 : 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {isCompleted ? (
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                      <Check size={16} color="white" strokeWidth={3} />
                    </View>
                  ) : (
                    <CheckCircle
                      size={24}
                      color="#9CA3AF"
                      fill="none"
                      strokeWidth={2}
                    />
                  )}
                  <Text
                    className={`ml-3 font-semibold ${
                      isCompleted ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {markingLoading
                      ? "更新中..."
                      : isCompleted
                      ? "読了済み"
                      : "読了としてマーク"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-20">
              <Book size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
              <Text className="text-muted-foreground text-center font-medium">
                この章には節が見つかりませんでした
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SheetWithComments>
  );
};

export default BibleChapter;
