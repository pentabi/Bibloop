import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useDailyReading } from "~/hooks/useDailyReading";
import { SheetWithComments } from "~/components/bible/SheetWithComments";
import { RefreshCw, Book, Calendar } from "lucide-react-native";

const Chapter = () => {
  // Use the daily reading hook to get today's actual reading
  const {
    dailyReading,
    verses,
    loading,
    error,
    hasFallback,
    refetch,
    formatDateForDisplay,
  } = useDailyReading();

  return (
    <SheetWithComments
      bookName={dailyReading?.bookName || ""}
      chapter={dailyReading?.chapterNumber || 1}
    >
      <ScrollView className="flex-1 bg-background">
        <View
          className="h-[350px] p-8 justify-end "
          style={{ backgroundColor: "#ddf6ff" }}
        >
          {/* Date and Chapter */}
          <View className="mb-6">
            <Text className="text-3xl mb-2 text-accent/90">
              {dailyReading ? formatDateForDisplay(dailyReading.date) : ""}
            </Text>
            <View className="flex-row items-end">
              <Text className="font-bold text-3xl mr-2">
                {dailyReading?.bookName || ""}
              </Text>
              <Text className="font-bol text-3xl">
                {dailyReading?.chapterNumber || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Bible Chapter Section */}
        <View className="mb-6 p-4 rounded-lg">
          {loading ? (
            <View className="items-center py-8">
              <RefreshCw size={24} className="text-blue-500 mb-2" />
              <Text className="text-gray-600">読み込み中...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-8">
              <View className="bg-red-50 p-6 rounded-xl w-full">
                <View className="items-center mb-4">
                  <Book size={32} className="text-red-500 mb-2" />
                  <Text className="text-red-600 text-center font-semibold mb-2">
                    読み込みエラー
                  </Text>
                  <Text className="text-red-500 text-center text-sm">
                    {error}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={refetch}
                  className="bg-red-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    再試行
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !dailyReading ? (
            <View className="items-center py-8">
              <View className="bg-gray-50 p-6 rounded-xl w-full">
                <View className="items-center mb-4">
                  <Calendar size={32} className="text-gray-400 mb-2" />
                  <Text className="text-gray-600 text-center font-semibold mb-2">
                    今日の聖書箇所が設定されていません
                  </Text>
                  <Text className="text-gray-500 text-center text-sm">
                    管理者によって今日の読書箇所がまだ設定されていません。
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={refetch}
                  className="bg-blue-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    更新を確認
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              {/* Fallback notification */}
              {hasFallback && (
                <View className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                  <Text className="text-amber-800 text-sm font-medium mb-1">
                    📖 代替の聖書箇所
                  </Text>
                  <Text className="text-amber-700 text-sm">
                    {dailyReading.description ||
                      "今日の聖書箇所が設定されていないため、代替の箇所を表示しています。"}
                  </Text>
                </View>
              )}

              {/* Title and description */}
              {dailyReading.title && (
                <View className="mb-4">
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    {dailyReading.title}
                  </Text>
                  {dailyReading.description && !hasFallback && (
                    <Text className="text-gray-600 text-sm">
                      {dailyReading.description}
                    </Text>
                  )}
                </View>
              )}

              {/* Verses */}
              <View className="space-y-3">
                {verses.map((verse, index) => (
                  <Text
                    key={verse.verse}
                    className="text-lg text-gray-800 mb-3 leading-7"
                  >
                    <Text className="text-sm text-blue-600 font-bold mr-2">
                      {verse.verse}.{" "}
                    </Text>
                    {verse.text}
                  </Text>
                ))}
              </View>

              {/* Refresh button */}
              <TouchableOpacity
                onPress={refetch}
                className="mt-6 bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
              >
                <RefreshCw size={16} className="text-gray-600 mr-2" />
                <Text className="text-gray-600 text-sm">更新を確認</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SheetWithComments>
  );
};

export default Chapter;
