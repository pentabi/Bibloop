import { Alert } from "react-native";

//pops out confirm menu
export async function confirm(
  title: string,
  message: string,
  onConfirm: () => void
) {
  Alert.alert(title, message, [
    { text: "いいえ", style: "cancel" },
    { text: "はい", style: "destructive", onPress: onConfirm },
  ]);
}
