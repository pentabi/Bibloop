import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowBigLeft, ArrowLeft, X } from "lucide-react-native";

//TODO make sure user_id doesn't overlap
const Step2UserId = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [userId, setUserId] = useState("");

  const handleNext = () => {
    if (userId.trim()) {
      // Pass both name and userId to the next step
      router.push({
        pathname: "/(on-boarding)/step-3-profile-image",
        params: { name: name || "", userId: userId.trim() },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      {/* exit */}
      <Pressable
        onPress={() => {
          router.back();
        }}
        className="mb-2"
      >
        <ArrowLeft size={20} />
      </Pressable>
      {/* progress */}
      <View className="h-2 gap-2 flex-row">
        <View className="flex-1 rounded-full bg-primary" />
        <View className="flex-1 rounded-full bg-primary" />
        <View className="flex-1 rounded-full bg-gray-400" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-between"
      >
        <View>
          <View className="py-4 gap-2 mt-6">
            <Text className="text-3xl font-bold">ユーザーIDをつける</Text>
            <Text className="text-xl font-medium opacity-50">
              友達追加の時に使うよ
            </Text>
            <Text className="text-xl font-medium opacity-50">
              あとでも変えられるよ
            </Text>
          </View>
          <Input
            value={userId}
            onChangeText={setUserId}
            placeholder="ユーザーIDを入力してください"
            autoFocus
          />
        </View>
        <View>
          <Button
            onPress={handleNext}
            className="rounded-full my-4 py-4"
            disabled={!userId.trim()}
          >
            <Text className="font-semibold">次にいく</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step2UserId;
