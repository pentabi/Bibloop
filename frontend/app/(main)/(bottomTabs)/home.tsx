import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  LogOut,
  Plus,
  BookOpen,
  Calendar,
  ShoppingBag,
  Users,
  Flame,
  Heart,
  Star,
  Sparkles,
  MessageCircle,
} from "lucide-react-native";
import { signOut } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { useRouter } from "expo-router";
import Modal from "~/components/Modal";
import {
  openKougoDB,
  resetKougoDB,
  testDatabaseContent,
} from "~/utils/KougoDb";
import { usePrayerRequest } from "~/hooks/usePrayerRequest";
import { useFriendship } from "~/hooks/useFriendship";

const Home = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use the new subscription-based prayer request hook
  const {
    prayerRequests, // Real-time prayer requests array
    subscriptionsActive, // Boolean indicating if subscriptions are active
    initializePrayerRequests, // Function to start subscriptions
    cleanupSubscriptions, // Function to stop subscriptions
    refreshPrayerRequests, // Function to manually refresh
    isLoading: prayerLoading,
  } = usePrayerRequest();

  const { getFriendsList } = useFriendship();

  // Initialize prayer requests with subscriptions when component mounts
  useEffect(() => {
    const setupPrayerRequests = async () => {
      try {
        console.log("Setting up prayer requests with subscriptions...");

        // Get current friends list
        const friendsList = await getFriendsList();
        const friendIds = friendsList.map((friend: any) =>
          friend.requesterId === user.id
            ? friend.addresseeId
            : friend.requesterId
        );

        console.log("Found friend IDs:", friendIds);

        // Initialize prayer requests with real-time subscriptions
        await initializePrayerRequests(friendIds);
      } catch (error) {
        console.error("Error setting up prayer requests:", error);
      }
    };

    if (user.id) {
      setupPrayerRequests();
    }

    // Cleanup subscriptions when component unmounts
    return () => {
      console.log("Cleaning up prayer request subscriptions...");
      cleanupSubscriptions();
    };
  }, [user.id]);

  // Manual refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Get current friends list
      const friendsList = await getFriendsList();
      const friendIds = friendsList.map((friend: any) =>
        friend.requesterId === user.id ? friend.addresseeId : friend.requesterId
      );

      // Manually refresh prayer requests
      await refreshPrayerRequests(friendIds);
    } catch (error) {
      console.error("Error refreshing prayer requests:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getFriendsList, refreshPrayerRequests, user.id]);

  const { width } = Dimensions.get("window");

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Logo and Greeting */}
      <View className="pt-16 pb-6 px-6">
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image
              source={require("~/assets/images/bibloop-icon.png")}
              className="w-10 h-10 rounded-full mr-3"
              style={{ resizeMode: "contain" }}
            />
            <View>
              <Text className="text-2xl font-bold text-foreground">
                おかえりなさい！
              </Text>
              <Text className="text-sm text-muted-foreground">
                {user.name || "ユーザー"}さん
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-x-3">
            <View className="bg-amber-100 px-3 py-2 rounded-full flex-row items-center">
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-amber-700 font-semibold ml-1">
                {user.points}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/notification")}
              className="p-2 bg-blue-50 rounded-full"
            >
              <Bell size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card with Stats */}
        <View
          className="bg-blue-500 rounded-2xl p-6 mb-6"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-3 rounded-full mr-4">
                <Flame size={24} color="white" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  {user.streaks}日連続
                </Text>
                <Text className="text-white/80 text-sm">
                  継続中のストリーク
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.navigate("/calendar")}
              className="bg-white/20 px-4 py-2 rounded-full flex-row items-center"
            >
              <Calendar size={16} color="white" />
              <Text className="text-white font-medium ml-2">カレンダー</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white/90 text-sm leading-5">
            今日も聖書を読んで、ストリークを伸ばしましょう！
          </Text>
        </View>
      </View>

      {/* Main Actions Grid */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-foreground mb-4">
          今日のアクション
        </Text>

        {/* Primary Action - Today's Bible */}
        <TouchableOpacity
          onPress={() => router.navigate("/daily-reading")}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-4"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <BookOpen size={24} color="#059669" />
                <Text className="text-emerald-800 font-bold text-lg ml-3">
                  今日の聖書
                </Text>
              </View>
              <Text className="text-emerald-600 text-sm leading-5">
                デイリーリーディングを開始して、今日の御言葉と出会いましょう
              </Text>
            </View>
            <View className="bg-emerald-500 p-4 rounded-full ml-4">
              <Sparkles size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View className="flex-row gap-x-4">
          <TouchableOpacity
            onPress={() => router.navigate("/shop")}
            className="flex-1 bg-card border border-border rounded-xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="items-center">
              <View className="bg-purple-100 p-3 rounded-full mb-3">
                <ShoppingBag size={20} color="#8b5cf6" />
              </View>
              <Text className="text-foreground font-semibold text-sm">
                ショップ
              </Text>
              <Text className="text-muted-foreground text-xs text-center mt-1">
                ポイントで購入
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(main)/(socials)/friends-list")}
            className="flex-1 bg-card border border-border rounded-xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="items-center">
              <View className="bg-pink-100 p-3 rounded-full mb-3">
                <Users size={20} color="#ec4899" />
              </View>
              <Text className="text-foreground font-semibold text-sm">
                フレンド
              </Text>
              <Text className="text-muted-foreground text-xs text-center mt-1">
                つながりを見る
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prayer Requests Section */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <MessageCircle size={24} color="#3b82f6" fill="#3b82f6" />
            <Text className="text-xl font-bold text-foreground ml-2">
              お祈りリクエスト
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(main)/(socials)/create-prayer")}
            className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-medium ml-1">新規</Text>
          </TouchableOpacity>
        </View>

        {/* Prayer modal */}
        <Modal
          isOpen={showPrayerModal}
          onClose={() => {
            setShowPrayerModal(false);
            setSelectedPrayer(null);
          }}
        >
          <View className="w-full p-6 bg-background rounded-2xl">
            <TouchableOpacity
              onPress={() => {
                setShowPrayerModal(false);
                setSelectedPrayer(null);
              }}
              className="self-end mb-4"
            >
              <Text className="text-primary font-medium">閉じる</Text>
            </TouchableOpacity>
            {selectedPrayer && (
              <View>
                <View className="flex-row items-center mb-4">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <MessageCircle size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-xl font-bold text-foreground">
                    {selectedPrayer.creator?.name || "名無しユーザー"}
                  </Text>
                </View>
                <View className="bg-gray-50 p-4 rounded-xl mb-4">
                  <Text className="text-base text-foreground leading-6">
                    {selectedPrayer.content}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center pt-4 border-t border-border">
                  <Text className="text-sm text-muted-foreground">
                    作成日:{" "}
                    {new Date(selectedPrayer.createdAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </Text>
                  <Text className="text-sm text-primary font-medium">
                    {new Date(selectedPrayer.viewableUntil).toLocaleDateString(
                      "ja-JP"
                    )}{" "}
                    まで
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Modal>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
        >
          {prayerRequests.map((prayer, index) => (
            <TouchableOpacity
              key={prayer.id}
              className="w-72 mr-4 bg-white rounded-2xl border border-gray-200 overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={() => {
                setSelectedPrayer(prayer);
                setShowPrayerModal(true);
              }}
            >
              {/* Header with consistent styling */}
              <View
                className="p-4 pb-2 bg-blue-50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="p-2 rounded-full bg-blue-100">
                      <MessageCircle size={16} color="#3b82f6" />
                    </View>
                    <Text
                      className="text-foreground font-bold text-base ml-3"
                      numberOfLines={1}
                    >
                      {prayer.creator?.name || "名無しユーザー"}
                    </Text>
                  </View>
                  {prayer.creatorId === user.id && (
                    <View className="bg-amber-100 px-2 py-1 rounded-full">
                      <Text className="text-amber-700 text-xs font-medium">
                        あなた
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Content */}
              <View className="p-4 pt-2">
                <Text
                  className="text-gray-700 text-sm leading-5 mb-4"
                  numberOfLines={4}
                >
                  {prayer.content}
                </Text>

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-xs text-muted-foreground">
                    {new Date(prayer.createdAt).toLocaleDateString("ja-JP")}
                  </Text>
                  <Text className="text-xs text-primary font-medium">
                    {new Date(prayer.viewableUntil).toLocaleDateString("ja-JP")}{" "}
                    まで
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {prayerRequests.length === 0 && !prayerLoading && (
            <View className="w-72 mr-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 items-center justify-center">
              <MessageCircle size={32} color="#d1d5db" />
              <Text className="text-gray-500 text-center font-medium mt-3 mb-2">
                お祈りリクエストがありません
              </Text>
              <Text className="text-gray-400 text-xs text-center leading-4">
                フレンドからのお祈りリクエストがここに表示されます
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default Home;
