import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Book, Calendar, ChevronRight, User } from "lucide-react-native";

const chapter = () => {
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
          // Store the array of verses for proper formatting
          setGenesisChapter(JSON.stringify(data));
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
    <ScrollView className="flex-1 bg-white">
      <View className="h-[350px] p-8 justify-between bg-primary/20 ">
        {/* Top Buttons */}
        <View className="flex-row mt-10 justify-between items-center">
          <View className="p-4 rounded-full bg-blue-500 items-center justify-center">
            <User />
          </View>
          <Calendar />
        </View>
        {/* Date and Chapter */}
        <View className="mb-6">
          <Text className="text-3xl mb-2 text-accent/90 ">7月17日</Text>
          <View className="flex-row items-end ">
            <Text className="font-bold text-3xl mr-2">創世記</Text>
            <Text className="font-bold text-green-700 text-3xl">1</Text>
          </View>
        </View>
      </View>

      {/* Genesis Chapter 1 Section */}
      <View className="mb-6 p-4 rounded-lg">
        {isLoading ? (
          <Text className="text-gray-600">読み込み中...</Text>
        ) : (
          <Text className="text-2xl text-gray-800">
            {(() => {
              try {
                const verses = JSON.parse(genesisChapter);
                if (Array.isArray(verses)) {
                  return verses.map((verse: any, index: number) => (
                    <Text key={index}>
                      <Text
                        className="text-sm text-gray-500"
                        style={{ lineHeight: 30 }}
                      >
                        {index + 1}.{" "}
                      </Text>
                      {verse.text || verse}
                    </Text>
                  ));
                }
              } catch (e) {
                // If it's not JSON, treat as regular text
              }
              return genesisChapter;
            })()}
          </Text>
        )}
      </View>

      <Image
        source={require("../../assets/images/michi.jpg")}
        style={{ width: 300, height: 350, borderRadius: 10 }}
        className="mb-64"
      />
    </ScrollView>
  );
};

export default chapter;
