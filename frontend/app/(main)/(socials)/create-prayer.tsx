import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Send } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayerRequest } from "~/hooks/usePrayerRequest";

const CreatePrayer = () => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(0); // Days
  const { createPrayerRequest, isLoading } = usePrayerRequest();

  const durationOptions = [
    { label: "1日間", days: 1 },
    { label: "2日間", days: 2 },
    { label: "5日間", days: 5 },
    { label: "1週間", days: 7 },
    { label: "2週間", days: 14 },
  ];

  const handleCreatePrayer = async () => {
    try {
      // Calculate viewableUntil date
      const viewableUntil = new Date();
      viewableUntil.setDate(viewableUntil.getDate() + selectedDuration);

      await createPrayerRequest(content.trim(), viewableUntil.toISOString());

      Alert.alert("成功", "お祈りリクエストを作成しました", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create prayer request:", error);
      // Error is already handled by the hook
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            お祈りリクエスト作成
          </Text>
          <TouchableOpacity
            onPress={handleCreatePrayer}
            disabled={isLoading || !content.trim() || selectedDuration === 0}
            className={`p-2 ${
              isLoading || !content.trim() || selectedDuration === 0
                ? "opacity-50"
                : ""
            }`}
          >
            <Send size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Content Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              お祈りの内容
            </Text>
            <TextInput
              className="w-full p-4 bg-card border border-border rounded-lg text-foreground min-h-32"
              placeholder="お祈りしてほしい内容を詳しく書いてください..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text className="text-xs text-muted-foreground mt-2 text-right">
              {content.length}/500
            </Text>
          </View>

          {/* Duration Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              <Calendar size={16} className="mr-2" />
              表示期間
            </Text>
            <Text className="text-xs text-muted-foreground mb-3">
              フレンドがこのお祈りリクエストを見ることができる期間を選択してください
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.days}
                  onPress={() => setSelectedDuration(option.days)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedDuration === option.days
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedDuration === option.days
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-xs text-muted-foreground mt-2">
              {selectedDuration === 0
                ? "表示期間を選択してください"
                : `選択期間: ${selectedDuration}日間 (${new Date(
                    Date.now() + selectedDuration * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("ja-JP")}まで)`}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleCreatePrayer}
            disabled={isLoading || !content.trim() || selectedDuration === 0}
            className={`w-full p-4 rounded-lg items-center ${
              isLoading || !content.trim() || selectedDuration === 0
                ? "bg-muted"
                : "bg-primary"
            }`}
          >
            <Text
              className={`font-semibold ${
                isLoading || !content.trim() || selectedDuration === 0
                  ? "text-muted-foreground"
                  : "text-white"
              }`}
            >
              {isLoading
                ? "作成中..."
                : !content.trim()
                ? "内容を入力してください"
                : selectedDuration === 0
                ? "表示期間を選択してください"
                : "お祈りリクエストを作成"}
            </Text>
          </TouchableOpacity>

          {/* Info Section */}
          <View className="mt-6 bg-card rounded-xl p-4 border border-border">
            <Text className="text-sm font-medium text-foreground mb-2">
              💡 お祈りリクエストについて
            </Text>
            <Text className="text-xs text-muted-foreground leading-relaxed">
              • お祈りリクエストはフレンドのみに表示されます{"\n"}•
              設定した期間が過ぎると自動的に非表示になります{"\n"}•
              作成後は編集できませんので、内容をよく確認してください{"\n"}•
              個人情報や機密事項は含めないでください
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePrayer;
