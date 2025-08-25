import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Bell, LogOut, Plus } from "lucide-react-native";
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

  return (
    <View className="flex-1 mt-20 p-4 gap-4">
      <View className="flex-row justify-between">
        <Text className="self-end"> {user.points} points</Text>
        <TouchableOpacity
          onPress={() => {
            router.push("/notification");
          }}
        >
          <Bell />
        </TouchableOpacity>
      </View>
      {/* chapter shortcut */}
      <TouchableOpacity
        onPress={() => {
          router.navigate("/daily-reading");
        }}
        className="p-8 bg-primary rounded-xl"
      >
        <Text>Chapter shortcut</Text>
      </TouchableOpacity>

      {/* Prayer Requests */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-foreground">お祈り</Text>
        </View>
        {/* prayer modal */}
        <Modal
          isOpen={showPrayerModal}
          onClose={() => {
            setShowPrayerModal(false);
            setSelectedPrayer(null);
          }}
        >
          <View className="w-full p-4 bg-background rounded-xl">
            <TouchableOpacity
              onPress={() => {
                setShowPrayerModal(false);
                setSelectedPrayer(null);
              }}
            >
              <Text className="text-right text-primary mb-4">閉じる</Text>
            </TouchableOpacity>
            {selectedPrayer && (
              <View>
                <Text className="text-lg font-semibold text-foreground mb-2">
                  {selectedPrayer.creator?.name || "名無しユーザー"}
                </Text>
                <Text className="text-base text-foreground leading-6">
                  {selectedPrayer.content}
                </Text>
                <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-border">
                  <Text className="text-sm text-muted-foreground">
                    {new Date(selectedPrayer.createdAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </Text>
                  <Text className="text-sm text-primary">
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
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <TouchableOpacity
            className="w-12 mr-4 p-4 bg-card rounded-xl border border-border items-center justify-center"
            onPress={() => {
              router.push("/create-prayer");
            }}
          >
            <Plus />
          </TouchableOpacity>
          {prayerRequests.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              className="w-64 mr-4 p-4 bg-card rounded-xl border border-border"
              onPress={() => {
                setSelectedPrayer(prayer);
                setShowPrayerModal(true);
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <Text
                    className="text-sm font-medium text-foreground"
                    numberOfLines={1}
                  >
                    {prayer.creator?.name || "名無しユーザー"}
                  </Text>
                  {prayer.creatorId === user.id && (
                    <Text className="text-xs text-muted-foreground ml-2 bg-muted px-2 py-1 rounded">
                      you
                    </Text>
                  )}
                </View>
              </View>
              <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                {prayer.content}
              </Text>
              <View className="flex-row justify-between items-center mt-3">
                <Text className="text-xs text-muted-foreground">
                  {new Date(prayer.createdAt).toLocaleDateString("ja-JP")}
                </Text>
                <Text className="text-xs text-primary">
                  {new Date(prayer.viewableUntil).toLocaleDateString("ja-JP")}{" "}
                  まで
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {prayerRequests.length === 0 && !prayerLoading && (
            <View className="w-64 mr-4 p-4 bg-card rounded-xl border border-border items-center justify-center">
              <Text className="text-sm text-muted-foreground text-center">
                フレンドからのお祈りリクエストがありません
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* streaks and calendar */}
      <View className="flex-row w-full gap-4">
        <TouchableOpacity
          onPress={() => {
            router.navigate("/calendar");
          }}
          className="p-8 bg-primary rounded-xl flex-1 "
        >
          <Text>streaks {user.streaks}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.navigate("/calendar");
          }}
          className="p-8 bg-primary rounded-xl flex-1"
        >
          <Text>calendar</Text>
        </TouchableOpacity>
      </View>
      {/* shop */}
      <TouchableOpacity
        onPress={() => {
          router.navigate("/shop");
        }}
        className="p-8 bg-primary rounded-xl"
      >
        <Text className="">shop</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
