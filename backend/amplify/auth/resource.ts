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
      },
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
      },
      callbackUrls: [
        "myapp://", // Your custom scheme
        "com.tabitosatoh.Bibloop://", // Bundle identifier scheme
        "exp://127.0.0.1:19000/--/", // Expo development
      ],
      logoutUrls: [
        "myapp://",
        "com.tabitosatoh.Bibloop://",
        "exp://127.0.0.1:19000/--/",
      ],
    },
  },
  userAttributes: {
    email: {
      required: false, // Make email optional for external providers
    },
  },
});
