import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Book, ChevronRight } from "lucide-react-native";

const chapter = () => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genesisChapter, setGenesisChapter] = useState("");

  const BASE_URL = "http://192.168.1.7:3000"; // Replace with your IP

  useEffect(() => {
    // Fetch Genesis chapter 1
    const fetchGenesisChapter = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/gen/from/1/1/to/1/31`);
        const data = await response.json();

        // Assuming the API returns an array of verses or a text field
        if (data.text) {
          setGenesisChapter(data.text);
        } else if (Array.isArray(data)) {
          // If it returns an array of verses, join them
          const fullChapter = data
            .map(
              (verse: any, index: number) =>
                `${index + 1}. ${verse.text || verse}`
            )
            .join("");
          setGenesisChapter(fullChapter);
        } else if (data.verses) {
          // If it has a verses property
          setGenesisChapter(data.verses);
        } else {
          setGenesisChapter(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error("API error:", error);
        setGenesisChapter(
          "創世記第1章を読み込めませんでした。ネットワーク接続を確認してください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenesisChapter();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View
        className="h-[175]"
        style={{ backgroundColor: "#8DE1FF", opacity: 0.2 }}
      >
        <View>
          <Text>７月１７日</Text>
          <View className="flex-row">
            <Text className="font-bold">創世記</Text>
            <Text className="font-bold text-green-700">1</Text>
          </View>
        </View>
      </View>
      <View className="mt-20 p-4">
        <View className="flex-row items-center mb-6">
          <Book size={28} color="#007AFF" />
          <Text className="text-2xl font-bold ml-3">今日の一章</Text>
        </View>

        {isLoading ? (
          <Text className="text-gray-600 text-center">読み込み中...</Text>
        ) : (
          <ScrollView>
            {/* Genesis Chapter 1 Section */}
            <View className="mb-6 p-4 bg-blue-50 rounded-lg">
              <Text className="text-4xl font-bold mb-3 text-blue-800">
                創世記 第1章
              </Text>
              {isLoading ? (
                <Text className="text-gray-600">読み込み中...</Text>
              ) : (
                <Text className="text-2xl leading-10 text-gray-800">
                  {genesisChapter}
                </Text>
              )}
            </View>

            <Image
              source={require("../../assets/images/michi.jpg")}
              style={{ width: 300, height: 350, borderRadius: 10 }}
              className="mb-64"
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default chapter;
