import {
  View,
  Text,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { signIn as amplifySignIn, signInWithRedirect } from "aws-amplify/auth";
import { H1 } from "~/components/ui/typography";
import { Button } from "~/components/ui/button";
import { useDispatch } from "react-redux";
import { BlurView } from "expo-blur";
import { ThemeToggle } from "~/components/ThemeToggle";
import { useErrorHandler } from "~/hooks/useErrorHandler";

const SignIn = () => {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogIn = async () => {
    try {
      const result = await amplifySignIn({
        username: email,
        password,
      });
      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        // User exists but email not confirmed, redirect to confirmation page
        router.push({
          pathname: "/(auth)/emailConfirm",
          params: { email, password },
        });
      } else if (result.nextStep.signInStep === "DONE") {
        return;
      } else {
        console.log("Problem with LogInScreen");
      }
    } catch (e) {
      console.error("Error logging in:", e);

      // Check if the error is due to unconfirmed email
      if (e instanceof Error && e.message.includes("User is not confirmed")) {
        // Redirect to email confirmation page
        router.push({
          pathname: "/(auth)/emailConfirm",
          params: { email, password },
        });
        return;
      }

      handleError(e, "ログインに失敗しました");
    }
  };

  const handleSignInWithApple = async () => {
    try {
      await signInWithRedirect({
        provider: "Apple",
      });
    } catch (e) {
      console.error("Error signing in with Apple:", e);
      handleError(e, "ログインに失敗しました");
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch (e) {
      console.error("Error signing in with Google:", e);
      handleError(e, "ログインに失敗しました");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="bg-background h-full w-full">
        {/* <ImageBackground
            style={{ height: "100%" }}
            source={require("../../assets/background.png")}
            resizeMode="cover"
            className="flex flex-col justify-center opacity-20"
          ></ImageBackground> */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="justify-around w-full h-full absolute px-4"
        >
          {/* Title */}
          <View className="h-40" />
          <View className="gap-3">
            <H1>ログイン</H1>
            <ThemeToggle></ThemeToggle>
          </View>
          {/* Form */}
          <View>
            <Text className="text-lg text-foreground opacity-50">Eメール</Text>
            <View className="flex-row items-center rounded-2xl relative">
              <View
                style={{ borderRadius: 16, overflow: "hidden" }}
                className="w-full bg-black/10"
              >
                <BlurView intensity={20} className="py-4 px-4 bg-white/10">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="oneTimeCode"
                  />
                </BlurView>
              </View>
            </View>
            <Text className="text-lg text-foreground opacity-50">
              パスワード
            </Text>
            <View className="flex-row items-center relative">
              <View
                style={{ borderRadius: 16, overflow: "hidden" }}
                className="w-full bg-black/10"
              >
                <BlurView intensity={20} className="py-4 px-4">
                  <TextInput
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </BlurView>
              </View>
            </View>
          </View>
          {/* Submit */}
          <View className="gap-3">
            <Button onPress={handleLogIn} className="bg-theme">
              <Text className="text-white font-semibold">ログイン</Text>
            </Button>

            {Platform.OS === "ios" && (
              <Button onPress={handleSignInWithApple} className="bg-black">
                <Text className="text-white font-semibold">
                  🍎 Appleでサインイン
                </Text>
              </Button>
            )}

            <Button onPress={handleSignInWithGoogle} className="bg-red-600">
              <Text className="text-white font-semibold">
                📧 Googleでサインイン
              </Text>
            </Button>

            <TouchableOpacity
              onPress={() => {
                router.navigate("/signUp");
              }}
              className="flex-row justify-center gap-1"
            >
              <Text className="text-foreground opacity-50">
                アカウントが無い？
              </Text>
              <Text className="text-foreground font-semibold">サインイン</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignIn;
