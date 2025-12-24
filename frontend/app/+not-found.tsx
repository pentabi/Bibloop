import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "おっと！" }} />
      <View className="mt-16">
        <Text>このページは存在しません。</Text>
      </View>

      <Button
        onPress={() => router.replace("/(auth)/signIn")}
        className="bg-red-600 w-full mx-6"
        >
          <Text>Homeに戻る</Text>
      </Button>

    </>
  );
}
