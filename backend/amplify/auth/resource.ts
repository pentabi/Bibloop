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
        "myapp://", // For development
        "com.tabitosatoh.Bibloop://", // For production/preview builds
        "exp://127.0.0.1:19000/--/", // For Expo development
      ],
      logoutUrls: [
        "myapp://", // For development
        "com.tabitosatoh.Bibloop://", // For production/preview builds
        "exp://127.0.0.1:19000/--/", // For Expo development
      ],
    },
  },
  userAttributes: {
    email: {
      required: false, // Make email optional for external providers
    },
  },
});
