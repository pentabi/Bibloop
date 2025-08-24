import React from "react";
import { Alert, Platform } from "react-native";
import * as Updates from "expo-updates";

interface RestartAlertProps {
  visible: boolean;
  onDismiss: () => void;
}

export const RestartAlert: React.FC<RestartAlertProps> = ({
  visible,
  onDismiss,
}) => {
  const handleRestart = async () => {
    try {
      onDismiss();

      if (Platform.OS === "web") {
        // For web, reload the page
        window.location.reload();
      } else {
        // For mobile, use Expo Updates
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error("Error restarting app:", error);
      Alert.alert(
        "エラー",
        "アプリの再起動に失敗しました。手動でアプリを再起動してください。",
        [{ text: "OK" }]
      );
    }
  };

  React.useEffect(() => {
    if (visible) {
      Alert.alert(
        "📅 新しい日が始まりました",
        "今日の聖書箇所を読み込むため、アプリを再起動します。",
        [
          {
            text: "OK",
            style: "default",
            onPress: handleRestart,
          },
        ],
        { cancelable: false }
      );
    }
  }, [visible]);

  return null; // This component only shows alerts
};
