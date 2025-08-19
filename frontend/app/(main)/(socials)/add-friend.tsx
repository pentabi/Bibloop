import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { client } from "~/lib/amplify-client";

const addFriend = () => {
  const user = useSelector((state: RootState) => state.user);
  const [friendUserId, setFriendUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendFriendRequest = async () => {
    if (!friendUserId) {
      Alert.alert("ユーザーIDを入力してください");
      return;
    }
    if (!user.id) {
      Alert.alert("自分のユーザーIDが見つかりません");
      return;
    }
    setIsLoading(true);
    try {
      // Create a new Friendship with status 'pending'
      const result = await client.models.Friendship.create({
        requesterId: user.id as string,
        addresseeId: friendUserId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (result.data) {
        Alert.alert("友達申請を送信しました");
        setFriendUserId("");
      }
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? (error as any).message
          : String(error);
      Alert.alert("申請に失敗しました", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 bg-background">
      <Text className="text-lg font-bold mb-4">友達追加</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="友達のユーザーIDを入力"
        value={friendUserId}
        onChangeText={setFriendUserId}
        autoCapitalize="none"
      />
      <TouchableOpacity
        className="bg-primary rounded-lg p-4 items-center"
        onPress={sendFriendRequest}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold">友達申請を送信</Text>
      </TouchableOpacity>
    </View>
  );
};

export default addFriend;
