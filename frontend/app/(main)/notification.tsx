import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, X, User } from "lucide-react-native";
import { useFriendship } from "../../hooks/useFriendship";

interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
  createdAt: string;
  requester?: {
    id: string;
    name?: string;
    userIdentifier: string;
  };
}

const Notification = () => {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const {
    getPendingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading,
  } = useFriendship();

  const loadPendingRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const requests = await getPendingRequests();
      setPendingRequests(requests as FriendRequest[]);
    } catch (error) {
      console.error("Error loading pending requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleAcceptRequest = async (
    friendshipId: string,
    requesterName?: string
  ) => {
    try {
      await acceptFriendRequest(friendshipId);
      Alert.alert(
        "承認しました",
        `${requesterName || "ユーザー"}とフレンドになりました！`,
        [{ text: "OK" }]
      );
      loadPendingRequests(); // Refresh the list
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (
    friendshipId: string,
    requesterName?: string
  ) => {
    Alert.alert(
      "フレンドリクエストを拒否",
      `${requesterName || "ユーザー"}からのフレンドリクエストを拒否しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "拒否",
          style: "destructive",
          onPress: async () => {
            try {
              await declineFriendRequest(friendshipId);
              loadPendingRequests(); // Refresh the list
            } catch (error) {
              console.error("Error declining request:", error);
            }
          },
        },
      ]
    );
  };

  // Loading Screen Component
  const LoadingScreen = () => (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">通知</Text>
        <View className="w-8" />
      </View>

      {/* Loading Content */}
      <View className="flex-1 items-center justify-center px-4">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-muted-foreground mt-4 text-center">
          通知を読み込み中...
        </Text>
        <Text className="text-muted-foreground text-sm mt-2 text-center">
          フレンドリクエストをチェックしています
        </Text>
      </View>
    </View>
  );

  // Show loading screen while fetching
  if (isLoadingRequests) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">通知</Text>
        <View className="w-8" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {/* Friend Requests Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            フレンドリクエスト
          </Text>

          {pendingRequests.length === 0 ? (
            <View className="bg-card rounded-xl p-6 border border-border items-center">
              <User size={48} color="#999" />
              <Text className="text-muted-foreground mt-4 text-center">
                新しいフレンドリクエストはありません
              </Text>
            </View>
          ) : (
            pendingRequests.map((request) => (
              <View
                key={request.id}
                className="bg-card rounded-xl p-4 border border-border mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                        <Text className="text-primary font-semibold">
                          {request.requester?.name?.charAt(0) ||
                            request.requester?.userIdentifier?.charAt(0) ||
                            "U"}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-medium">
                          {request.requester?.name || "名無しユーザー"}
                        </Text>
                        <Text className="text-muted-foreground text-sm">
                          {request.requester?.userIdentifier}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-3">
                      フレンドリクエストが届いています
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-4 gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      handleAcceptRequest(request.id, request.requester?.name)
                    }
                    disabled={isLoading}
                    className="flex-1 bg-primary p-3 rounded-lg flex-row items-center justify-center"
                  >
                    <Check size={16} color="white" />
                    <Text className="text-white font-medium ml-2">承認</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeclineRequest(request.id, request.requester?.name)
                    }
                    disabled={isLoading}
                    className="flex-1 bg-destructive p-3 rounded-lg flex-row items-center justify-center"
                  >
                    <X size={16} color="white" />
                    <Text className="text-white font-medium ml-2">拒否</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Other Notifications Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            その他の通知
          </Text>
          <View className="bg-card rounded-xl p-6 border border-border items-center">
            <Text className="text-muted-foreground text-center">
              他の通知はありません
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Notification;
