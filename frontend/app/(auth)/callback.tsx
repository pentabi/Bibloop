import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Hub } from 'aws-amplify/utils';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Listen for auth events from Amplify
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          console.log('Sign in with redirect successful');
          // Navigate to main app
          router.replace('/(main)/home');
          break;
        case 'signInWithRedirect_failure':
          console.log('Sign in with redirect failed:', payload.data);
          // Navigate back to sign in
          router.replace('/(auth)/signIn');
          break;
        case 'customOAuthState':
          console.log('Custom OAuth state:', payload.data);
          break;
      }
    });

    return unsubscribe;
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg text-gray-600">Processing authentication...</Text>
    </View>
  );
}
