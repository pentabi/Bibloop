import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Calendar = () => {
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
      <Text>calendar</Text>
      <TouchableOpacity
        onPress={() => {
          router.navigate("/daily-reading");
        }}
      >
        <Text>Jump to date</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Calendar;
