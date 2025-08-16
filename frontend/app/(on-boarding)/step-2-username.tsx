import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import React from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowBigLeft, ArrowLeft, X } from "lucide-react-native";

const Step2Username = () => {
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
          <Input></Input>
        </View>
        <View>
          <Button
            onPress={() => {
              router.push("/(on-boarding)/step-3-profile-image");
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

export default Step2Username;
