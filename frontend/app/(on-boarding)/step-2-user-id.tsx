import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowBigLeft, ArrowLeft, X } from "lucide-react-native";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../backend/amplify/data/resource";

const client = generateClient<Schema>();

const Step2UserId = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [userId, setUserId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isValidUserId, setIsValidUserId] = useState<boolean | null>(null);

  const checkUserIdAvailability = async (userIdToCheck: string) => {
    if (!userIdToCheck.trim()) {
      setIsValidUserId(null);
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

  const handleUserIdChange = (newUserId: string) => {
    setUserId(newUserId);

    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkUserIdAvailability(newUserId);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleNext = async () => {
    if (!userId.trim()) return;

    // Final check before proceeding
    setIsChecking(true);
    await checkUserIdAvailability(userId);

    if (isValidUserId) {
      // Pass both name and userId to the next step
      router.push({
        pathname: "/(on-boarding)/step-3-profile-image",
        params: { name: name || "", userId: userId.trim() },
      });
    } else {
      Alert.alert(
        "ユーザーIDが使用できません",
        "このユーザーIDは既に使用されています。別のIDを選択してください。"
      );
    }
    setIsChecking(false);
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
            onChangeText={handleUserIdChange}
            placeholder="ユーザーIDを入力してください"
            autoFocus
          />

          {/* User ID validation feedback */}
          {userId.trim() && (
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
        <View>
          <Button
            onPress={handleNext}
            className="rounded-full my-4 py-4"
            disabled={!userId.trim() || isChecking || isValidUserId === false}
          >
            <Text className="font-semibold">
              {isChecking ? "確認中..." : "次にいく"}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Step2UserId;
