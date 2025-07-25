import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "おっと！" }} />
      <View className="mt-16">
        <Text>このページは存在しません。</Text>
      </View>
    </>
  );
}
