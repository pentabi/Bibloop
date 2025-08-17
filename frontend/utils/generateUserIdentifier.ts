/**
 * Generates a unique user identifier from authentication attributes
 * Supports multiple OAuth providers (Apple, Google, etc.)
 */
export function generateUserIdentifier(attrs: any): string {
  // Priority order for identifier selection:
  // 1. Email (most reliable across providers)
  if (attrs.email && attrs.email.trim()) {
    return attrs.email.toLowerCase().trim();
  }

  // 2. For Google Sign In - try additional Google-specific attributes
  if (attrs.email_verified && attrs.given_name && attrs.family_name) {
    // Google user with verified email but no email field somehow
    const googleId = `google_${attrs.given_name}_${
      attrs.family_name
    }_${Date.now()}`.toLowerCase();
    return googleId;
  }

  // 3. AWS Cognito sub (unique identifier from Cognito)
  if (attrs.sub && attrs.sub.trim()) {
    return `cognito_${attrs.sub}`;
  }

  // 4. Preferred username (some OAuth providers)
  if (attrs.preferred_username && attrs.preferred_username.trim()) {
    return attrs.preferred_username.toLowerCase().trim();
  }

  // 5. Name field (for Apple Sign In when email is hidden)
  if (attrs.name && attrs.name.trim()) {
    return `name_${attrs.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_${Date.now()}`;
  }

  // 6. For Apple Sign In - generate Apple-specific identifier
  if (attrs.identities && attrs.identities.includes("SignInWithApple")) {
    return `apple_user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // 7. For Google Sign In - generate Google-specific identifier
  if (attrs.identities && attrs.identities.includes("Google")) {
    return `google_user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // 8. Fallback - generate time-based unique identifier
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determines the OAuth provider from authentication attributes
 */
export function getAuthProvider(
  attrs: any
): "apple" | "google" | "cognito" | "unknown" {
  if (attrs.identities) {
    if (attrs.identities.includes("SignInWithApple")) return "apple";
    if (attrs.identities.includes("Google")) return "google";
  }

  if (attrs.sub) return "cognito";

  return "unknown";
}
