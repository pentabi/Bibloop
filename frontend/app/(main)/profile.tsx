import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { User, MapPin, Calendar, Heart } from "lucide-react-native";
import { signOut } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

const profile = () => {
  const user = useSelector((state: RootState) => state.user);

  // Helper function to determine what type of identifier we have
  const getUserDisplayInfo = () => {
    if (!user.userIdentifier)
      return { type: "なし", display: "ログインしていません" };

    if (user.userIdentifier.includes("@")) {
      return { type: "メール", display: user.userIdentifier };
    } else if (user.userIdentifier.includes("-")) {
      return {
        type: "Apple ID",
        display:
          "Appleユーザー (ID: " + user.userIdentifier.substring(0, 8) + "...)",
      };
    } else {
      return { type: "その他", display: user.userIdentifier };
    }
  };

  const displayInfo = getUserDisplayInfo();

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="mt-20 p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <User size={28} color="#007AFF" />
            <Text className="text-2xl font-bold ml-3">プロフィール</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <View className="items-center mb-4">
              <View className="w-24 h-24 bg-blue-200 rounded-full items-center justify-center mb-3">
                <User size={40} color="#007AFF" />
              </View>
              <Text className="text-xl font-bold text-gray-800">みち</Text>
              <Text className="text-sm text-gray-600">聖書の読者</Text>
            </View>
          </View>

          {/* User Info */}
          <View className="bg-white rounded-xl border border-gray-200 mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                アカウント情報
              </Text>
            </View>

            <View className="p-4 space-y-3">
              <View className="flex-row items-center">
                <MapPin size={18} color="#8e8e93" />
                <Text className="ml-3 text-gray-600">
                  種類: {displayInfo.type}
                </Text>
              </View>

              <View className="flex-row items-center">
                <User size={18} color="#8e8e93" />
                <Text className="ml-3 text-gray-600 flex-1" numberOfLines={1}>
                  識別子: {displayInfo.display}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Calendar size={18} color="#8e8e93" />
                <Text className="ml-3 text-gray-600">
                  ステータス: {user.isLoggedIn ? "ログイン中" : "ログアウト中"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-white rounded-xl border border-gray-200 mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">統計</Text>
            </View>

            <View className="p-4">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">1</Text>
                  <Text className="text-sm text-gray-600">読んだ章</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">31</Text>
                  <Text className="text-sm text-gray-600">読んだ節</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-purple-600">1</Text>
                  <Text className="text-sm text-gray-600">日連続</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Michi Image */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/michi.jpg")}
              style={{ width: 200, height: 240, borderRadius: 15 }}
            />
            <Text className="text-sm text-gray-600 mt-2">みちちゃん 🐾</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={signOut}
            className="bg-red-500 rounded-xl p-4 items-center mb-8"
          >
            <Text className="text-white font-semibold text-lg">ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default profile;
