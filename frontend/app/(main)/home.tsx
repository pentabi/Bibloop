import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { LogOut } from "lucide-react-native";
import { signOut } from "~/utils/signOut";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

const home = () => {
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log(user);
  }, []);

  // Helper function to determine what type of identifier we have
  const getUserDisplayInfo = () => {
    if (!user.userIdentifier) return { type: "None", display: "Not logged in" };

    if (user.userIdentifier.includes("@")) {
      return { type: "Email", display: user.userIdentifier };
    } else if (user.userIdentifier.includes("-")) {
      return {
        type: "Apple ID",
        display:
          "Apple User (ID: " + user.userIdentifier.substring(0, 8) + "...)",
      };
    } else {
      return { type: "Other", display: user.userIdentifier };
    }
  };

  const displayInfo = getUserDisplayInfo();

  return (
    <View className="mt-20 p-4">
      <Text className="text-xl font-bold mb-4">Hello Michi! 👋</Text>

      <View className="mb-4 p-3 bg-gray-100 rounded-lg">
        <Text className="font-semibold">User Info:</Text>
        <Text>Type: {displayInfo.type}</Text>
        <Text>Identifier: {displayInfo.display}</Text>
        <Text>Logged In: {user.isLoggedIn ? "Yes" : "No"}</Text>
      </View>

      <TouchableOpacity
        onPress={signOut}
        className="flex-row items-center bg-red-500 p-3 rounded-lg mb-4"
      >
        <LogOut color="white" size={20} />
        <Text className="text-white ml-2 font-semibold">Sign Out</Text>
      </TouchableOpacity>

      <Image
        source={require("../../assets/images/michi.jpg")}
        style={{ width: 300, height: 350, borderRadius: 10 }}
      />
    </View>
  );
};

export default home;
