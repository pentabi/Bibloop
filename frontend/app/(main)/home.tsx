import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { LogOut } from "lucide-react-native";
import { signOut } from "~/utils/signOut";

const home = () => {
  return (
    <View className="mt-20">
      <Text>home hello</Text>
      <TouchableOpacity onPress={signOut}>
        <LogOut />
      </TouchableOpacity>
    </View>
  );
};

export default home;
