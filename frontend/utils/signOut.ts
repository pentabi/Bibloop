import { signOut as amplifySignOut } from "aws-amplify/auth";
import { confirm } from "./confirm";
import { useErrorHandler } from "~/hooks/useErrorHandler";

export async function signOut() {
  const { handleError } = useErrorHandler();
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
    handleError(error, "ログインに失敗しました");
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
