# User Authentication Flow Implementation

## Overview

This implementation provides a complete user authentication and onboarding flow that:

1. **Detects first-time users** - Checks if a user profile exists in the database
2. **Creates user profiles** - Automatically creates user profiles for new users
3. **Handles onboarding flow** - Routes users through onboarding if they haven't completed it
4. **Routes appropriately** - Directs users to the main app or onboarding based on their status

## Key Components

### 1. `useUserProfile` Hook

**Location:** `/hooks/useUserProfile.ts`

This custom hook manages all user profile operations:

- `checkAndCreateUserProfile()` - Checks if user exists, creates if needed
- `updateUserProfile()` - Updates existing user profiles
- `getUserProfile()` - Retrieves user profile by identifier

**Key Features:**

- Prevents duplicate user profiles by checking both `userIdentifier` and `userId`
- Automatically updates Redux state with user profile information
- Handles first-time user detection
- Error handling with user-friendly Japanese messages

### 2. Updated `userSlice` Redux State

**Location:** `/redux/slices/userSlice.ts`

Enhanced with new fields:

```typescript
interface UserState {
  isLoggedIn: boolean;
  finishedOnboarding: boolean;
  userIdentifier: string | null;
  name: string | null;
  isFirstTime: boolean; // NEW: Track first-time users
}
```

**New Actions:**

- `setFirstTimeUser(boolean)` - Manually set first-time flag
- `setOnboardingComplete()` - Mark onboarding as finished

### 3. Enhanced `useAuthListener` Hook

**Location:** `/hooks/useAuthListener.ts`

Now includes:

- Integration with `useUserProfile` hook
- Automatic user profile creation/checking on login
- Proper state management for onboarding flow

### 4. Updated App Layout Routing

**Location:** `/app/_layout.tsx`

Smart routing based on user state:

```typescript
if (!user.isLoggedIn) {
  // Route to sign in
} else if (user.isFirstTime || !user.finishedOnboarding) {
  // Route to onboarding
} else {
  // Route to main app
}
```

### 5. Enhanced Onboarding Flow

**Locations:**

- `/app/(on-boarding)/step-1-name.tsx`
- `/app/(on-boarding)/step-2-username.tsx`
- `/app/(on-boarding)/step-3-profile-image.tsx`

**Improvements:**

- Form validation and state management
- Parameter passing between steps
- Database updates on completion
- Proper Redux state updates
- Exit functionality (sign out option)

## Database Schema

The implementation uses the existing `UserProfile` model:

```typescript
UserProfile: {
  id: string(required);
  userIdentifier: string(required); // Used for uniqueness check
  userId: string(required); // AWS Cognito user ID
  name: string(optional); // Used to determine onboarding completion
  email: string(optional);
  phoneNumber: string(optional);
  profileImagePath: string(optional);
  // ... other fields
}
```

## Flow Diagram

```
User Signs In
     ↓
Check if userIdentifier exists in DB
     ↓
No? → Create new UserProfile with empty name
Yes? → Load existing UserProfile
     ↓
Check if name is set
     ↓
No name? → Route to Onboarding (step-1-name)
Has name? → Route to Main App
     ↓
Complete Onboarding → Update DB with name → Set finishedOnboarding = true
```

## Key Features

1. **Duplicate Prevention**: Checks both `userIdentifier` and `userId` to prevent duplicate profiles
2. **First-Time Detection**: Uses the presence of a `name` field to determine completion status
3. **Graceful Error Handling**: Continues with basic login even if profile operations fail
4. **Flexible Identifiers**: Supports various login methods (email, Apple ID, etc.)
5. **Japanese Localization**: Error messages and UI text in Japanese

## Usage

The flow is automatic - users just need to sign in. The system will:

1. Detect if they're new or returning
2. Create profiles as needed
3. Route them appropriately
4. Save their onboarding progress

## Future Enhancements

- Profile image upload functionality
- Username uniqueness validation
- Social features integration
- Profile editing capabilities
