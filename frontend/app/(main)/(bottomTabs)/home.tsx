import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Bell, LogOut, Plus } from "lucide-react-native";
import { signOut } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { useRouter } from "expo-router";
import { mockPrayerRequests } from "~/lib/PrayerRequestData";
import Modal from "~/components/Modal";
import {
  openKougoDB,
  resetKougoDB,
  testDatabaseContent,
} from "~/utils/KougoDb";

const Home = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

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
        <Text className="text-lg font-semibold mb-3 text-foreground">
          お祈り
        </Text>
        {/* prayer modal */}
        <Modal isOpen={showPrayerModal}>
          <View className="w-full p-4 bg-background rounded-xl">
            <TouchableOpacity
              onPress={() => {
                setShowPrayerModal(false);
              }}
            >
              <Text>close</Text>
              <Text>some prayer</Text>
            </TouchableOpacity>
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
          {mockPrayerRequests.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              className="w-64 mr-4 p-4 bg-card rounded-xl border border-border"
              onPress={() => {
                setShowPrayerModal(true);
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm font-medium text-foreground"
                  numberOfLines={1}
                >
                  {prayer.author}
                </Text>
              </View>
              <Text
                className="text-base font-semibold text-foreground mb-2"
                numberOfLines={1}
              >
                {prayer.title}
              </Text>
              <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                {prayer.content}
              </Text>
              <View className="flex-row justify-between items-center mt-3">
                <Text className="text-xs text-muted-foreground">
                  {new Date(prayer.createdAt).toLocaleDateString("ja-JP")}
                </Text>
                <Text className="text-xs text-primary">
                  {new Date(prayer.displayUntil).toLocaleDateString("ja-JP")}{" "}
                  まで
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
