import { signOut as amplifySignOut } from "aws-amplify/auth";
import { confirm } from "./confirm";

export async function signOut() {
  try {
    confirm(
      "Sign out",
      "Do you want to sign out of your account?",
      async () => {
        await amplifySignOut({ global: true });
      }
    );
    console.log("Signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function signOutAutomatic() {
  try {
    await amplifySignOut({ global: true });
    console.log("Signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
