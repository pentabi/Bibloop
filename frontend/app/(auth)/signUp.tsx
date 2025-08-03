import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { signUp as amplifySignUp } from "aws-amplify/auth";
import { BlurView } from "expo-blur";
import { Button } from "~/components/ui/button";
import { userLogIn } from "~/redux/slices/userSlice";
import { H1 } from "~/components/ui/typography";

const SignUp = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cfmPassword, setCfmPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      if (password !== cfmPassword) {
        console.log("not same password");
        //   dispatch(
        //     showToast({
        //       context: "パスワードが一致しません",
        //       ToastType: ToastType.Error,
        //     })
        //   );
        return;
      }
      const { isSignUpComplete, nextStep } = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push({
          pathname: "/(auth)/emailConfirm",
          params: { email, password },
        });
      } else if (isSignUpComplete) {
        dispatch(userLogIn(email));
      }
    } catch (e) {
      //   dispatch(
      // showToast({
      //   context: e instanceof Error ? e.message : String(e),
      //   type: ToastType.Error,
      // })
      //   );
      console.error("Error signing up:", e);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="bg-white h-full w-full">
        {/* <Toast /> */}
        {/* background */}
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
            <H1>アカウント作成</H1>
            <View className="flex-row gap-2 w-40">
              <View className="h-1.5 flex-1 bg-black rounded-full" />
              <View className="h-1.5 flex-1 bg-gray-300 rounded-full" />
            </View>
          </View>
          {/* Form */}
          <View>
            <Text className="text-lg opacity-50">Eメール</Text>
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
            <Text className="text-lg opacity-50">パスワード</Text>
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
            <Text className="text-lg opacity-50">パスワード確認</Text>
            <View className="flex-row items-center relative">
              <View
                style={{ borderRadius: 16, overflow: "hidden" }}
                className="w-full bg-black/10"
              >
                <BlurView intensity={20} className="py-4 px-4">
                  <TextInput
                    secureTextEntry
                    value={cfmPassword}
                    onChangeText={setCfmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </BlurView>
              </View>
            </View>
          </View>
          {/* Submit */}
          <View className="gap-1">
            <Button onPress={handleSignUp} className="bg-theme">
              <Text className="text-white font-semibold">サインイン</Text>
            </Button>
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
              className="flex-row justify-center gap-1"
            >
              <Text className="opacity-50">
                すでにアカウントをお持ちですか？
              </Text>
              <Text className="font-semibold">ログイン</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUp;
