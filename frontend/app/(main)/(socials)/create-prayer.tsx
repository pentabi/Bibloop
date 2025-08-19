import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const CreatePrayer = () => {
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
      <Text>create prayer</Text>
    </View>
  );
};

export default CreatePrayer;
