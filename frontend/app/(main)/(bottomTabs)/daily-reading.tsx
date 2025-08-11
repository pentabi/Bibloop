import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useKougoChapterData } from "~/hooks/useKougoChapterData";
import { SheetWithComments } from "~/components/bible/SheetWithComments";

const Chapter = () => {
  // Today's reading: Genesis 1 (you can make this dynamic later)
  const todaysReading = {
    bookId: 1, // Genesis
    chapter: 1, // Chapter 1
    bookName: "創世記",
    date: "7月17日",
  };

  // Use Kougo database hook for today's reading
  const { verses, loading, error } = useKougoChapterData(
    todaysReading.bookId,
    todaysReading.chapter
  );

  return (
    <SheetWithComments
      bookName={todaysReading.bookName}
      chapter={todaysReading.chapter}
    >
      <ScrollView className="flex-1 bg-background">
        <View
          className="h-[350px] p-8 justify-end "
          style={{ backgroundColor: "#ddf6ff" }}
        >
          {/* Date and Chapter */}
          <View className="mb-6">
            <Text className="text-3xl mb-2 text-accent/90">
              {todaysReading.date}
            </Text>
            <View className="flex-row items-end">
              <Text className="font-bold text-3xl mr-2">
                {todaysReading.bookName}
              </Text>
              <Text className="font-bold text-green-700 text-3xl">
                {todaysReading.chapter}
              </Text>
            </View>
          </View>
        </View>

        {/* Genesis Chapter 1 Section */}
        <View className="mb-6 p-4 rounded-lg">
          {loading ? (
            <Text className="text-gray-600">読み込み中...</Text>
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : (
            <View>
              {verses.map((verse, index) => (
                <Text key={verse.verse} className="text-lg text-gray-800 mb-3">
                  <Text className="text-sm text-gray-500 font-medium">
                    {verse.verse}.{" "}
                  </Text>
                  {verse.text}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SheetWithComments>
  );
};

export default Chapter;
