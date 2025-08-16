import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

const Step1Name = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      {/* exit */}
      <View className="mb-2">
        <X size={20} />
      </View>
      {/* progress */}
      <View className="h-2 gap-2 flex-row">
        <View className="flex-1 rounded-full bg-primary" />
        <View className="flex-1 rounded-full bg-gray-400" />
        <View className="flex-1 rounded-full bg-gray-400" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-between"
      >
        <View>
          <View className="py-4 gap-2 mt-6">
            <Text className="text-3xl font-bold">ニックネームをつける</Text>
            <Text className="text-xl font-medium opacity-50">
              みんなに見える名前だよ
            </Text>
            <Text className="text-xl font-medium opacity-50">
              あとでも変えられるよ
            </Text>
          </View>
          <Input></Input>
        </View>
        <View>
          <Button
            onPress={() => {
              router.push("/(on-boarding)/step-2-username");
            }}
            className="rounded-full my-4 py-4"
          >
            <Text className="font-semibold">次にいく</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step1Name;
