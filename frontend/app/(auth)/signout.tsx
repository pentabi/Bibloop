import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'aws-amplify/auth';

export default function SignOutCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
        console.log('Sign out successful');
        // Navigate to sign in page
        router.replace('/(auth)/signIn');
      } catch (error) {
        console.error('Error signing out:', error);
        // Still navigate to sign in page
        router.replace('/(auth)/signIn');
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg text-gray-600">Signing out...</Text>
    </View>
  );
}
