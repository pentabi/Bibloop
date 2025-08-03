import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDownWideNarrow,
  Book,
  Calendar,
  ChevronRight,
  User,
} from "lucide-react-native";
import { Button } from "~/components/ui/button";
import BottomSheet, { BottomSheetRefProps } from "~/components/BottomSheet";
import { mockComments } from "~/lib/CommentData";

const Comment = () => {
  const [sort, setSort] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <View className="flex-1 bg-white">
      {/* Overlay to detect touches outside dropdown */}
      {showSortMenu && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => setShowSortMenu(false)}
          activeOpacity={1}
        />
      )}

      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 relative z-50">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="p-2 flex-row items-center"
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowDownWideNarrow size={20} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            創世記１のコメント
          </Text>
          <Text className="text-sm text-gray-500">{mockComments.length}件</Text>
        </View>

        {/* Sort Menu */}
        {showSortMenu && (
          <View className="absolute top-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            <TouchableOpacity
              className="px-4 py-3 border-b border-gray-100"
              onPress={() => {
                setSort("recent");
                setShowSortMenu(false);
              }}
            >
              <Text className="text-sm text-gray-700">最新順</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => {
                setSort("likes");
                setShowSortMenu(false);
              }}
            >
              <Text className="text-sm text-gray-700">いいね順</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Comments List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {mockComments
          .sort((a, b) => {
            if (sort === "likes") {
              return b.likes - a.likes; // Sort by likes descending
            }
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ); // Sort by date descending
          })
          .map((comment, index) => (
            <View key={comment.id}>
              {/* Main Comment */}
              <View className="py-4 border-b border-gray-100">
                {/* User Info */}
                <View className="flex-row items-center mb-3">
                  <TouchableOpacity
                    onPress={() => {}}
                    className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3"
                  >
                    <Text className="text-white text-sm font-semibold">
                      {comment.author.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-1 flex-row gap-2 items-center">
                    <Text className="text-sm font-medium text-gray-800">
                      {comment.author}
                    </Text>
                    <Text className="text-xs text-gray-500">2時間前</Text>
                  </View>
                </View>

                {/* Comment Content */}
                <Text className="text-gray-700 leading-5 ml-11">
                  {comment.content}
                </Text>

                {/* Actions */}
                <View className="flex-row items-center mt-3 ml-11">
                  <TouchableOpacity className="flex-row items-center mr-6">
                    <Text className="text-xs text-gray-500">
                      いいね {comment.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-xs text-gray-500">返信</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reply Comments */}
              {comment.replies && comment.replies.length > 0 && (
                <View className="ml-8  border-gray-100">
                  {comment.replies.map((reply, replyIndex) => (
                    <View
                      key={`${comment.id}-reply-${replyIndex}`}
                      className="py-3 pl-4"
                    >
                      {/* Reply User Info */}
                      <View className="flex-row items-center mb-2">
                        <TouchableOpacity className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2">
                          <Text className="text-white text-xs font-semibold">
                            {reply.author.charAt(0).toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                        <View className="flex-1 flex-row gap-2 items-center">
                          <Text className="text-xs font-medium text-gray-800">
                            {reply.author}
                          </Text>
                          <Text className="text-xs text-gray-500">1時間前</Text>
                        </View>
                      </View>

                      {/* Reply Content */}
                      <Text className="text-sm text-gray-700 leading-4 ml-8">
                        {reply.content}
                      </Text>

                      {/* Reply Actions */}
                      <View className="flex-row items-center mt-2 ml-8">
                        <TouchableOpacity className="flex-row items-center mr-4">
                          <Text className="text-xs text-gray-500">
                            いいね {reply.likes}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center">
                          <Text className="text-xs text-gray-500">返信</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Show more replies if there are many */}
                  {comment.replies.length > 2 && (
                    <TouchableOpacity className="py-2 pl-4">
                      <Text className="text-xs text-blue-500">
                        他の{comment.replies.length - 2}件の返信を表示
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}

        {/* Add some bottom padding */}
        <View className="h-4" />
      </ScrollView>

      {/* Add Comment Input */}
      <View className="p-4 border-t border-gray-200 bg-gray-50">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gray-400 rounded-full items-center justify-center mr-3">
            <User size={16} color="white" />
          </View>
          <TouchableOpacity className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-3">
            <Text className="text-gray-500">コメントを追加...</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Chapter = () => {
  const ref = useRef<BottomSheetRefProps>(null);

  const handleOpenBottomSheet = () => {
    const isActive = ref.current?.isActive();
    if (isActive) {
      ref.current?.scrollTo(0);
    } else {
      ref.current?.scrollTo(-120);
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [genesisChapter, setGenesisChapter] = useState("");

  const BASE_URL = "http://192.168.1.30:3000"; // Replace with your IP

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
    <>
      <ScrollView className="flex-1 bg-background">
        <View
          className="h-[350px] p-8 justify-between "
          style={{ backgroundColor: "#ddf6ff" }}
        >
          {/* Top Buttons */}
          <View className="flex-row mt-10 justify-end items-center">
            <Button
              onPress={() => {
                handleOpenBottomSheet();
              }}
            >
              <Calendar />
            </Button>
            <Button
              onPress={() => {
                console.log("michi hi");
              }}
            >
              <Calendar />
            </Button>
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

      <BottomSheet ref={ref}>
        <Comment />
      </BottomSheet>
    </>
  );
};

export default Chapter;
