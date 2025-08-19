import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { client } from "~/lib/amplify-client";

const FriendsList = () => {
  const router = useRouter();
  const userId = ""; // TODO: get current user id from redux
  const [friends, setFriends] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Fetch accepted friends for this user
    async function fetchFriends() {
      setIsLoading(true);
      try {
        // Show all friendships where user is requester or addressee and status is accepted
        const result = await client.models.Friendship.list({
          filter: {
            and: [
              {
                or: [
                  { requesterId: { eq: userId } },
                  { addresseeId: { eq: userId } },
                ],
              },
              { status: { eq: "accepted" } },
            ],
          },
        });
        setFriends(result.data || []);
      } catch (e) {
        setFriends([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFriends();
  }, [userId]);

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Text>back</Text>
      </TouchableOpacity>
      <Text className="text-lg font-bold mb-4">友達リスト</Text>
      {isLoading ? (
        <Text>読み込み中...</Text>
      ) : friends.length === 0 ? (
        <Text>友達がいません</Text>
      ) : (
        friends.map((f) => (
          <View key={f.id} className="p-4 m-2 bg-card rounded-lg">
            <Text>
              {f.requesterId === userId ? f.addresseeId : f.requesterId}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export default FriendsList;
