import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { setUser } from "~/redux/slices/userSlice";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../backend/amplify/data/resource";
import { X } from "lucide-react-native";

const client = generateClient<Schema>();

interface ChangeNameProps {
  onClose: () => void;
}

const ChangeName: React.FC<ChangeNameProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [newName, setNewName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) {
      Alert.alert("エラー", "名前を入力してください");
      return;
    }

    if (!user?.id) {
      Alert.alert("エラー", "ユーザー情報が見つかりません");
      return;
    }

    try {
      setIsLoading(true);

      // Update the user profile in the database
      const { data: updatedProfile, errors } =
        await client.models.UserProfile.update({
          id: user.id,
          name: newName.trim(),
        });

      if (errors) {
        console.error("Error updating name:", errors);
        Alert.alert("エラー", "名前の更新に失敗しました");
        return;
      }

      // Update Redux state
      dispatch(setUser({ name: newName.trim() }));

      Alert.alert("成功", "名前が更新されました", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("エラー", "名前の更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-background w-full p-6 rounded-xl">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-foreground">名前を変更</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>

      {/* Current name */}
      <View className="mb-4">
        <Text className="text-sm text-muted-foreground mb-2">現在の名前</Text>
        <Text className="text-base text-foreground">
          {user?.name || "未設定"}
        </Text>
      </View>

      {/* New name input */}
      <View className="mb-6">
        <Text className="text-sm text-muted-foreground mb-2">新しい名前</Text>
        <Input
          value={newName}
          onChangeText={setNewName}
          placeholder="新しい名前を入力してください"
          autoFocus
        />
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onPress={onClose}
          disabled={isLoading}
        >
          <Text>キャンセル</Text>
        </Button>
        <Button
          className="flex-1"
          onPress={handleSave}
          disabled={
            isLoading || !newName.trim() || newName.trim() === user?.name
          }
        >
          <Text className="font-semibold">
            {isLoading ? "更新中..." : "保存"}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default ChangeName;
