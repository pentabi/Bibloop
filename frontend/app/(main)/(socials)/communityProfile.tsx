import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Heart,
  MessageCircle,
  Share,
  UserPlus,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  MoreHorizontal,
} from "lucide-react-native";

const CommunityProfile = () => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("testimonies");

  const mockTestimonies = [
    {
      id: 1,
      date: "2024年1月15日",
      title: "神様の導きを感じた日",
      content:
        "今日は朝の祈りで神様からの平安を深く感じました。困難な状況の中でも、詩篇23篇の「主は私の羊飼い」という言葉が心に響き、神様が共にいてくださることを実感しました。",
      likes: 24,
      comments: 8,
      verse: "詩篇 23:1",
    },
    {
      id: 2,
      date: "2024年1月8日",
      title: "赦しの力",
      content:
        "長年心に抱えていた怒りを神様に委ねることができました。マタイ6:14-15の教えを通して、赦すことの大切さを学び、心が軽くなりました。",
      likes: 31,
      comments: 12,
      verse: "マタイ 6:14-15",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(main)/chapter");
        }}
      >
        <Text>back</Text>
      </TouchableOpacity>
      {/* Profile Header */}
      <View className="px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-start">
          {/* Profile Image */}
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">田</Text>
          </View>

          {/* Stats */}
          <View className="flex-1 flex-row justify-around">
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">42</Text>
              <Text className="text-sm text-gray-500">証し</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">186</Text>
              <Text className="text-sm text-gray-500">友達</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">94</Text>
              <Text className="text-sm text-gray-500">フォロワー</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View className="mt-4">
          <Text className="text-lg font-bold text-gray-800">田中 恵美</Text>
          <Text className="text-sm text-gray-600 mt-1">
            イエス様と共に歩む日々 ✨ | 東京聖書教会 ⛪
          </Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={14} color="#666" />
            <Text className="text-sm text-gray-500 ml-1">東京, 日本</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Calendar size={14} color="#666" />
            <Text className="text-sm text-gray-500 ml-1">
              2020年からBibloopユーザー
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mt-4 gap-3">
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-lg ${
              isFollowing ? "bg-gray-200" : "bg-blue-500"
            }`}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text
              className={`text-center font-medium ${
                isFollowing ? "text-gray-700" : "text-white"
              }`}
            >
              {isFollowing ? "フォロー中" : "フォローする"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-2 px-4 bg-gray-200 rounded-lg">
            <Text className="text-center font-medium text-gray-700">
              メッセージ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-2 px-3 bg-gray-200 rounded-lg">
            <MoreHorizontal size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "testimonies" ? "border-b-2 border-blue-500" : ""
          }`}
          onPress={() => setActiveTab("testimonies")}
        >
          <View className="flex-row items-center justify-center">
            <BookOpen
              size={16}
              color={activeTab === "testimonies" ? "#3b82f6" : "#666"}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === "testimonies" ? "text-blue-500" : "text-gray-600"
              }`}
            >
              証し
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "prayers" ? "border-b-2 border-blue-500" : ""
          }`}
          onPress={() => setActiveTab("prayers")}
        >
          <View className="flex-row items-center justify-center">
            <Heart
              size={16}
              color={activeTab === "prayers" ? "#3b82f6" : "#666"}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === "prayers" ? "text-blue-500" : "text-gray-600"
              }`}
            >
              祈り
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-4">
        {activeTab === "testimonies" && (
          <View>
            {mockTestimonies.map((testimony) => (
              <View
                key={testimony.id}
                className="mb-6 bg-gray-50 rounded-lg p-4"
              >
                {/* Testimony Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm text-gray-500">
                    {testimony.date}
                  </Text>
                  <View className="bg-blue-100 px-2 py-1 rounded">
                    <Text className="text-xs text-blue-600">
                      {testimony.verse}
                    </Text>
                  </View>
                </View>

                {/* Testimony Title */}
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  {testimony.title}
                </Text>

                {/* Testimony Content */}
                <Text className="text-gray-700 leading-6 mb-4">
                  {testimony.content}
                </Text>

                {/* Engagement */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity className="flex-row items-center">
                      <Heart size={16} color="#ef4444" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {testimony.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center">
                      <MessageCircle size={16} color="#666" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {testimony.comments}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity>
                    <Share size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "prayers" && (
          <View className="items-center py-8">
            <Heart size={48} color="#ccc" />
            <Text className="text-gray-500 mt-4">
              祈りのリクエストはまだありません
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CommunityProfile;
