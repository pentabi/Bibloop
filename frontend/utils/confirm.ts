import { Alert } from "react-native";

//pops out confirm menu
export async function confirm(
  title: string,
  message: string,
  onConfirm: () => void
) {
  Alert.alert(title, message, [
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: onConfirm },
  ]);
}
