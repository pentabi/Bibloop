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

interface ChangeUserIdProps {
  onClose: () => void;
}

const ChangeUserId: React.FC<ChangeUserIdProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [newUserId, setNewUserId] = useState(user?.userId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidUserId, setIsValidUserId] = useState<boolean | null>(null);

  const checkUserIdAvailability = async (userIdToCheck: string) => {
    if (!userIdToCheck.trim()) {
      setIsValidUserId(null);
      return;
    }

    // If it's the same as current userId, it's valid
    if (userIdToCheck.trim() === user?.userId) {
      setIsValidUserId(true);
      return;
    }

    try {
      setIsChecking(true);

      // Check if userId already exists in UserProfile
      const { data: existingUsers } = await client.models.UserProfile.list({
        filter: {
          userId: { eq: userIdToCheck.trim() },
        },
      });

      const isAvailable = !existingUsers || existingUsers.length === 0;
      setIsValidUserId(isAvailable);
    } catch (error) {
      console.error("Error checking userId availability:", error);
      setIsValidUserId(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUserIdChange = (userIdToCheck: string) => {
    setNewUserId(userIdToCheck);

    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkUserIdAvailability(userIdToCheck);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = async () => {
    if (!newUserId.trim()) {
      Alert.alert("エラー", "ユーザーIDを入力してください");
      return;
    }

    if (!user?.id) {
      Alert.alert("エラー", "ユーザー情報が見つかりません");
      return;
    }

    // Final check before saving
    setIsChecking(true);
    await checkUserIdAvailability(newUserId);

    if (isValidUserId === false) {
      Alert.alert(
        "ユーザーIDが使用できません",
        "このユーザーIDは既に使用されています。別のIDを選択してください。"
      );
      setIsChecking(false);
      return;
    }

    try {
      setIsLoading(true);

      // Update the user profile in the database
      const { data: updatedProfile, errors } =
        await client.models.UserProfile.update({
          id: user.id,
          userId: newUserId.trim(),
        });

      if (errors) {
        console.error("Error updating userId:", errors);
        Alert.alert("エラー", "ユーザーIDの更新に失敗しました");
        return;
      }

      // Update Redux state
      dispatch(setUser({ userId: newUserId.trim() }));

      Alert.alert("成功", "ユーザーIDが更新されました", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error) {
      console.error("Error updating userId:", error);
      Alert.alert("エラー", "ユーザーIDの更新に失敗しました");
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  const isSaveDisabled =
    !newUserId.trim() ||
    isLoading ||
    isChecking ||
    isValidUserId === false ||
    newUserId.trim() === user?.userId;

  return (
    <View className="bg-background w-full p-6 rounded-xl">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-foreground">
          ユーザーIDを変更
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>

      {/* Current userId */}
      <View className="mb-4">
        <Text className="text-sm text-muted-foreground mb-2">
          現在のユーザーID
        </Text>
        <Text className="text-base text-foreground">
          {user?.userId || "未設定"}
        </Text>
      </View>

      {/* New userId input */}
      <View className="mb-4">
        <Text className="text-sm text-muted-foreground mb-2">
          新しいユーザーID
        </Text>
        <Input
          value={newUserId}
          onChangeText={handleUserIdChange}
          placeholder="新しいユーザーIDを入力してください"
          autoFocus
        />

        {/* User ID validation feedback */}
        {newUserId.trim() && newUserId.trim() !== user?.userId && (
          <View className="mt-2">
            {isChecking ? (
              <Text className="text-sm text-gray-500">確認中...</Text>
            ) : isValidUserId === true ? (
              <Text className="text-sm text-green-600">
                ✓ このユーザーIDは利用可能です
              </Text>
            ) : isValidUserId === false ? (
              <Text className="text-sm text-red-600">
                ✗ このユーザーIDは既に使用されています
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Info text */}
      <View className="mb-6">
        <Text className="text-xs text-muted-foreground">
          ユーザーIDは友達追加の時に使用されます。他のユーザーに教えることがあるので、覚えやすいものを選んでください。
        </Text>
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
          disabled={isSaveDisabled}
        >
          <Text className="font-semibold">
            {isLoading ? "更新中..." : isChecking ? "確認中..." : "保存"}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default ChangeUserId;
