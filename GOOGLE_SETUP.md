# Google OAuth Setup for Bibloop

## Required Google OAuth Configuration

To complete the Google sign-in setup, you need to:

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs for:
   - **Web application** (for web version)
   - **iOS** (for iOS app)
   - **Android** (for Android app if needed)

### 2. Configure Redirect URIs in Google Console
Add these authorized redirect URIs in your Google OAuth client:
- `https://618a42c28024404e00f7.auth.us-east-2.amazoncognito.com/oauth2/idpresponse`
- `myapp://` (for mobile deep linking)

### 3. Set Amplify Secrets
Run these commands to set the required secrets:

```bash
npx amplify sandbox secret set GOOGLE_CLIENT_ID
npx amplify sandbox secret set GOOGLE_CLIENT_SECRET
```

Enter your Google OAuth client ID and client secret when prompted.

### 4. Deploy Changes
```bash
npx amplify sandbox
```

### 5. Update Mobile App Configuration
For iOS, you may need to add the Google Sign-In SDK and configure URL schemes in your `Info.plist`.

## Notes
- The Google sign-in button will appear on all platforms
- Make sure to test on both web and mobile platforms
- The button uses a red background (`bg-red-600`) to match Google's branding
- Text is in Japanese: "📧 Googleでサインイン"
