import { signOut as amplifySignOut } from "aws-amplify/auth";
import { confirm } from "./confirm";

export async function signOut() {
  try {
    confirm(
      "Sign out",
      "Do you want to sign out of your account?",
      async () => {
        await amplifySignOut();
      }
    );
    console.log("Signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
