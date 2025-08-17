import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const notification = () => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Text>back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default notification;
