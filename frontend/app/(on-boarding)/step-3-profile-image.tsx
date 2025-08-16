import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import React from "react";
import { Button } from "~/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, X } from "lucide-react-native";
import { useRouter } from "expo-router";

const Step3ProfileImage = () => {
  const router = useRouter();
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
        <View className="flex-1 rounded-full bg-primary" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-between"
      >
        <View>
          <View className="py-4 gap-2 mt-6">
            <Text className="text-3xl font-bold">プロフィール画像をつける</Text>
            <Text className="text-xl font-medium opacity-50">
              見られちゃダメな情報はアップロードしないようにね！
            </Text>
          </View>
        </View>
        <View>
          <Button
            onPress={() => {
              router.push("/home");
            }}
            className="rounded-full my-4 py-4"
          >
            <Text className="font-semibold">バイブループを始める！</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step3ProfileImage;
