import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { LogOut } from "lucide-react-native";
import { signOut } from "~/utils/signOut";

const home = () => {
  return (
    <View className="mt-20">
      <Text>hello michi</Text>
      <TouchableOpacity onPress={signOut}>
        <LogOut />
      </TouchableOpacity>
      <Image
        source={require("../../assets/images/michi.jpg")}
        style={{ width: 600, height: 700 }}
      />
    </View>
  );
};

export default home;
