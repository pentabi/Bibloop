import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react-native";
import { signOut } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

const Home = () => {
  const user = useSelector((state: RootState) => state.user);
  const [genesisChapter, setGenesisChapter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = "http://192.168.1.7:3000"; // Replace with your IP

  // Helper function to determine what type of identifier we have
  const getUserDisplayInfo = () => {
    if (!user.userIdentifier)
      return { type: "なし", display: "ログインしていません" };

    if (user.userIdentifier.includes("@")) {
      return { type: "メール", display: user.userIdentifier };
    } else if (user.userIdentifier.includes("-")) {
      return {
        type: "Apple ID",
        display:
          "Appleユーザー (ID: " + user.userIdentifier.substring(0, 8) + "...)",
      };
    } else {
      return { type: "その他", display: user.userIdentifier };
    }
  };

  const displayInfo = getUserDisplayInfo();

  return (
    <View className="flex-1 mt-20 p-4">
      <Text className="text-xl font-bold mb-4">こんにちは、みち！👋</Text>

      <View className="mb-4 p-3 bg-gray-100 rounded-lg">
        <Text className="font-semibold">ユーザー情報:</Text>
        <Text>種類: {displayInfo.type}</Text>
        <Text>識別子: {displayInfo.display}</Text>
        <Text>
          ログイン状態: {user.isLoggedIn ? "ログイン中" : "ログアウト中"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={signOut}
        className="flex-row items-center bg-red-500 p-3 rounded-lg mb-4"
      >
        <LogOut color="white" size={20} />
        <Text className="text-white ml-2 font-semibold">ログアウト</Text>
      </TouchableOpacity>
      <Image
        source={require("../../assets/images/michi.jpg")}
        style={{ width: 300, height: 350, borderRadius: 10 }}
        className="mb-64"
      />
    </View>
  );
};

export default Home;
