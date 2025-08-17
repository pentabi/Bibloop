import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { User, MapPin, Calendar, Heart, Settings } from "lucide-react-native";
import { signOut, signOutAutomatic } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const user = useSelector((state: RootState) => state.user);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* <View>
        {Object.entries(user).map(([key, value]) => (
          <View key={key} style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold", marginRight: 8 }}>{key}:</Text>
            <Text>{String(value)}</Text>
          </View>
        ))}
      </View> */}
      <ScrollView className="flex-1">
        <View className="mt-20 p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6 justify-between">
            <View className="flex-row items-center">
              <User size={28} color="#007AFF" />
              <Text className="text-2xl font-bold ml-3">プロフィール</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push("/settings");
              }}
            >
              <Settings />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <View className="items-center mb-4">
              <View className="w-24 h-24 bg-blue-200 rounded-full items-center justify-center mb-3">
                <User size={40} color="#007AFF" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                {user.name}
              </Text>
              <Text className="text-sm text-gray-600">{user.userId}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              router.push("/addFriend");
            }}
            className="p-4 bg-primary rounded-xl mt-4"
          >
            <Text>add friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push("/friendsList");
            }}
            className="p-4 bg-primary rounded-xl my-4"
          >
            <Text>friends list</Text>
          </TouchableOpacity>

          {/* Stats Card */}
          <View className="bg-white rounded-xl border border-gray-200 mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">統計</Text>
            </View>

            <View className="p-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {user.streaks}
                </Text>
                <Text className="text-sm text-gray-600">日連続</Text>
              </View>
            </View>
          </View>

          <View className="items-center mb-6">
            <Text className="text-sm text-gray-600 mt-2">{user.name}</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => {
              console.log("signout");
              signOut();
            }}
            className="bg-red-500 rounded-xl p-4 items-center mb-8"
          >
            <Text className="text-white font-semibold text-lg">ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
