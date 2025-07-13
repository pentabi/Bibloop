import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
  Platform,
  Keyboard,
} from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { confirmSignUp } from "aws-amplify/auth";
import { ChevronLeft } from "lucide-react-native";
import { H1, H3 } from "~/components/ui/typography";
import { BlurView } from "expo-blur";
import { Button } from "~/components/ui/button";

const emailConfirm = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = code.padEnd(6, " ").split(""); // fill with blanks

  const handleConfirm = async () => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (isSignUpComplete) {
        Alert.alert("Success", "Email confirmed. Please sign in.");
        //   dispatch(
        //     showToast({
        //       title: "Successfully created account",
        //       context: "Email confirmed. Please sign in",
        //       type: ToastType.Success,
        //     })
        //   );
        router.navigate("/(auth)/signIn");
      }
    } catch (e) {
      console.error("Confirmation error:", e);
      // dispatch(
      //   showToast({
      //     context: e instanceof Error ? e.message : String(e),
      //     type: ToastType.Error,
      //   })
      // );
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
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <ChevronLeft size={30}></ChevronLeft>
          </TouchableOpacity>
          <View>
            <H1>Confirm Email</H1>
            <H3>Check your email for the 6-digit code</H3>
            <View className="flex-row gap-2 w-40 mt-3">
              <View className="h-1.5 flex-1 bg-gray-300 rounded-full" />
              <View className="h-1.5 flex-1 bg-black rounded-full" />
            </View>

            <View className="flex-row gap-2 justify-center items-center mt-6">
              {/* Visual boxes */}
              {digits.map((digit, index) => (
                <View
                  key={index}
                  style={{ borderRadius: 8, overflow: "hidden" }}
                  className={
                    isFocused && code.length === index
                      ? "bg-black/10"
                      : "bg-black/25"
                  }
                >
                  <BlurView
                    intensity={20}
                    className="w-16 h-20 justify-center items-center bg-white"
                  >
                    <Text className="font-semibold" style={{ fontSize: 20 }}>
                      {digit}
                    </Text>
                  </BlurView>
                </View>
              ))}

              {/* press to focus*/}
              <Pressable
                onPress={() => {
                  inputRef.current?.focus();
                }}
                className="absolute py-8 w-full"
              ></Pressable>
            </View>
            {/* Hidden text input */}
            <TextInput
              ref={inputRef}
              value={code}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, "").slice(0, 6);
                setCode(sanitized);
              }}
              maxLength={6}
              keyboardType="number-pad"
              autoFocus
              className="w-0 h-0 text-lg absolute left-16"
            />
          </View>
          <View className="gap-1">
            <Button onPress={handleConfirm} className="bg-theme">
              <Text className="text-white font-semibold">Confirm</Text>
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default emailConfirm;
