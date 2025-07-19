import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      signInWithApple: {
        clientId: secret("SIWA_CLIENT_ID"),
        keyId: secret("SIWA_KEY_ID"),
        privateKey: secret("SIWA_PRIVATE_KEY"),
        teamId: secret("SIWA_TEAM_ID"),
        scopes: ["email"],
      },
      callbackUrls: [
        "myapp://auth/callback",
        // "exp://127.0.0.1:8081/--/auth/callback", // For Expo development
      ],
      logoutUrls: [
        "myapp://auth/signout",
        // "exp://127.0.0.1:8081/--/auth/signout", // For Expo development
      ],
    },
  },
});
