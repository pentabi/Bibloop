import { signOut as amplifySignOut } from "aws-amplify/auth";
import { confirm } from "./confirm";

export async function signOut() {
  try {
    confirm(
      "アカウントからログアウトしますか？",
      "ログアウト時に確認メッセージが表示される場合があります。",
      async () => {
        await amplifySignOut();
      }
    );
    console.log("Signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function signOutAutomatic() {
  try {
    await amplifySignOut();
    console.log("Signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
