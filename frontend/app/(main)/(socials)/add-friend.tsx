import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, UserPlus } from "lucide-react-native";
import { useFriendship } from "../../../hooks/useFriendship";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/rootReducer";

const AddFriend = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const { sendFriendRequest, isLoading } = useFriendship();
  const user = useSelector((state: RootState) => state.user);

  const handleSendRequest = async () => {
    if (!userId.trim()) {
      Alert.alert("エラー", "ユーザーIDを入力してください");
      return;
    }

    // Check if user is trying to add themselves
    if (userId.trim() === user.userId) {
      Alert.alert("エラー", "自分自身をフレンドに追加することはできません");
      return;
    }

    try {
      await sendFriendRequest(userId.trim());
      Alert.alert("成功", "フレンドリクエストを送信しました", [
        {
          text: "OK",
          onPress: () => {
            setUserId("");
            router.back();
          },
        },
      ]);
    } catch (error) {
      // Error is already handled by the hook
      console.log("Friend request failed:", error);
    }
  };

  // Check if the entered userId matches current user's userId
  const isOwnUserId = userId.trim() === user.userId;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          フレンド追加
        </Text>
        <View className="w-8" />
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        <View className="bg-card rounded-xl p-6 border border-border">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <UserPlus size={32} color="#007AFF" />
            </View>
            <Text className="text-xl font-semibold text-foreground mb-2">
              フレンドを追加
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              フレンドのユーザーIDを入力してフレンドリクエストを送信しましょう
            </Text>
          </View>

          {/* Input Section */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              ユーザーID
            </Text>
            <TextInput
              className={`w-full p-4 bg-background border rounded-lg text-foreground ${
                isOwnUserId ? "border-destructive" : "border-border"
              }`}
              placeholder="例: 1234567890abcdef"
              placeholderTextColor="#999"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isOwnUserId ? (
              <Text className="text-xs text-destructive mt-2">
                ⚠️ 自分自身をフレンドに追加することはできません
              </Text>
            ) : (
              <Text className="text-xs text-muted-foreground mt-2">
                ユーザーIDはプロフィール画面で確認できます (@の横の文字)
              </Text>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendRequest}
            disabled={isLoading || !userId.trim() || isOwnUserId}
            className={`w-full p-4 rounded-lg items-center ${
              isLoading || !userId.trim() || isOwnUserId
                ? "bg-muted"
                : "bg-primary"
            }`}
          >
            <Text
              className={`font-semibold ${
                isLoading || !userId.trim() || isOwnUserId
                  ? "text-muted-foreground"
                  : "text-white"
              }`}
            >
              {isLoading
                ? "送信中..."
                : isOwnUserId
                ? "自分自身は追加できません"
                : "フレンドリクエストを送信"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View className="mt-6 bg-card rounded-xl p-4 border border-border">
          <Text className="text-sm font-medium text-foreground mb-2">
            💡 ヒント
          </Text>
          <Text className="text-xs text-muted-foreground leading-relaxed">
            フレンドリクエストが送信されると、相手に通知が届きます{"\n"}•
            相手が承認すると、お互いのフレンド一覧に表示されます{"\n"}•
            自分のユーザーID: {user.userId || "読み込み中..."}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AddFriend;
