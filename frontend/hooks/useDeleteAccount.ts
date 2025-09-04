import { useState } from "react";
import { Alert } from "react-native";
import { generateClient } from "aws-amplify/data";
import { deleteUser, getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import type { Schema } from "../../backend/amplify/data/resource";

const client = generateClient<Schema>();

export const useDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "アカウント削除",
      "本当にアカウントを削除しますか？この操作は取り消すことができません。\n\n削除されるデータ:\n• プロフィール情報\n• 読書記録\n• フレンド関係\n• すべての投稿",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: showFinalConfirmation,
        },
      ]
    );
  };

  const showFinalConfirmation = () => {
    Alert.alert("最終確認", "本当にアカウントを永久に削除しますか？", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "完全に削除",
        style: "destructive",
        onPress: deleteAccountPermanently,
      },
    ]);
  };

  const deleteAccountPermanently = async () => {
    try {
      setIsDeleting(true);

      // Show loading alert
      Alert.alert("削除中", "アカウントを削除しています...", [], {
        cancelable: false,
      });

      // Get current user info
      const { userId } = await getCurrentUser();

      // Delete user profile from database
      await client.models.UserProfile.delete({
        id: userId,
      });

      // Delete related data
      await deleteUserData(userId);

      // Finally, delete the Amplify Auth user
      await deleteUser();

      // Navigate to auth screen
      Alert.alert(
        "削除完了",
        "アカウントが正常に削除されました。",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/signIn");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert(
        "エラー",
        "アカウントの削除中にエラーが発生しました。しばらく時間をおいて再度お試しください。",
        [{ text: "OK" }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteUserData = async (userId: string) => {
    try {
      // Delete completed chapters
      const { data: completedChapters } =
        await client.models.CompletedChapter.list({
          filter: { creatorId: { eq: userId } },
        });

      for (const chapter of completedChapters) {
        await client.models.CompletedChapter.delete({ id: chapter.id });
      }

      // Delete prayer requests
      const { data: prayerRequests } = await client.models.PrayerRequest.list({
        filter: { creatorId: { eq: userId } },
      });

      for (const prayer of prayerRequests) {
        await client.models.PrayerRequest.delete({ id: prayer.id });
      }

      // Delete friendships
      const { data: friendships } = await client.models.Friendship.list({
        filter: {
          or: [
            { requesterId: { eq: userId } },
            { addresseeId: { eq: userId } },
          ],
        },
      });

      for (const friendship of friendships) {
        await client.models.Friendship.delete({ id: friendship.id });
      }
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  };

  return {
    handleDeleteAccount,
    isDeleting,
  };
};
