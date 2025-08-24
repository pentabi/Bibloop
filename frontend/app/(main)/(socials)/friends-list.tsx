import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, UserPlus, Users, MessageCircle } from "lucide-react-native";
import { useFriendship } from "../../../hooks/useFriendship";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/rootReducer";

interface Friend {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
  friendshipDate?: string;
  sharedStreaks?: number;
  requester?: {
    id: string;
    name?: string;
    userIdentifier: string;
    points?: number;
    streaks?: number;
  };
  addressee?: {
    id: string;
    name?: string;
    userIdentifier: string;
    points?: number;
    streaks?: number;
  };
}

const FriendsList = () => {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { getFriendsList, isLoading } = useFriendship();

  const loadFriends = async () => {
    try {
      const friendsList = await getFriendsList();
      setFriends(friendsList as Friend[]);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const getFriendData = (friend: Friend) => {
    // Return the friend's data (not the current user's data)
    if (friend.requesterId === currentUser.id) {
      return friend.addressee;
    } else {
      return friend.requester;
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          フレンド一覧
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/add-friend")}
          className="p-2"
        >
          <UserPlus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View className="p-4">
          <View className="bg-card rounded-xl p-4 border border-border">
            <View className="flex-row items-center justify-center">
              <Users size={20} color="#007AFF" />
              <Text className="text-foreground font-medium ml-2">
                {friends.length} 人のフレンド
              </Text>
            </View>
          </View>
        </View>

        {/* Friends List */}
        <View className="px-4 pb-4">
          {isLoading && friends.length === 0 ? (
            <View className="bg-card rounded-xl p-6 border border-border items-center">
              <Text className="text-muted-foreground">読み込み中...</Text>
            </View>
          ) : friends.length === 0 ? (
            <View className="bg-card rounded-xl p-6 border border-border items-center">
              <Users size={48} color="#999" />
              <Text className="text-muted-foreground mt-4 text-center font-medium">
                まだフレンドがいません
              </Text>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                フレンドを追加して一緒に聖書を読みましょう！
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/add-friend")}
                className="bg-primary px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-medium">フレンドを追加</Text>
              </TouchableOpacity>
            </View>
          ) : (
            friends.map((friend) => {
              const friendData = getFriendData(friend);
              if (!friendData) return null;

              return (
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(main)/(socials)/community-profile");
                  }}
                  key={friend.id}
                  className="bg-card rounded-xl p-4 border border-border mb-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row">
                      <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
                          <Text className="text-primary font-semibold text-lg">
                            {friendData.name?.charAt(0) ||
                              friendData.userIdentifier?.charAt(0) ||
                              "U"}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-medium text-lg">
                            {friendData.name || "名無しユーザー"}
                          </Text>
                          <Text className="text-muted-foreground text-sm">
                            {friendData.userIdentifier}
                          </Text>
                        </View>
                        {/* Stats */}
                        {friend.friendshipDate && (
                          <Text className="text-xs text-muted-foreground mt-2">
                            フレンド歴:{" "}
                            {new Date(friend.friendshipDate).toLocaleDateString(
                              "ja-JP"
                            )}
                            〜
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FriendsList;
