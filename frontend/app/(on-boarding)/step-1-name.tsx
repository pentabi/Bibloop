import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { signOut } from "~/utils/signOut";

// Todo: don't allow user to go next unless name is valid

const Step1Name = () => {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleNext = () => {
    if (name.trim()) {
      // Pass the name to the next step
      router.push({
        pathname: "/(on-boarding)/step-2-username",
        params: { name: name.trim() },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      {/* exit */}
      <Pressable onPress={signOut} className="mb-2">
        <X size={20} />
      </Pressable>
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
          <Input
            value={name}
            onChangeText={setName}
            placeholder="あなたの名前を入力してください"
            autoFocus
          />
        </View>
        <View>
          <Button
            onPress={handleNext}
            className="rounded-full my-4 py-4"
            disabled={!name.trim()}
          >
            <Text className="font-semibold">次にいく</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step1Name;
