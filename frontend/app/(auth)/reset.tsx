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
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { BlurView } from "expo-blur";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";
import { useErrorHandler } from "~/hooks/useErrorHandler";
import { useDispatch } from "react-redux";
import { showToast } from "~/redux/slices/toastSlice";
import { ToastType } from "~/redux/types/ToastType";

const Reset = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();

  // only two steps: the user wants to request (initial state) via entering email and confirm the reset by new password
  const [step, setStep] = useState<"REQUEST" | "CONFIRM">("REQUEST");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [cfmPassword, setCfmPassword] = useState("");

  const handleRequestReset = async () => {
    try {
      await resetPassword({ username: email });
      dispatch(
        showToast({
          context: "確認コードをメールで送信しました",
          ToastType: ToastType.Success,
        })
      );
      setStep("CONFIRM");
    } catch (e) {
      handleError(e, "パスワードリセットエラー");
    }
  };

  const handleConfirmReset = async () => {
    if (password !== cfmPassword) {
      dispatch(
        showToast({
          context: "パスワードが一致しません",
          ToastType: ToastType.Error,
        })
      );
      return;
    }

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: password,
      });

      dispatch(
        showToast({
          context: "パスワードを変更しました",
          ToastType: ToastType.Success,
        })
      );

      router.replace("/(auth)/signIn");
    } catch (e) {
      handleError(e, "確認コードエラー");
    }
  };

  const renderConfirmFields = () => {
    if (step !== "CONFIRM") return null;

    return (
        <>
        <Text className="text-lg opacity-50">確認コード</Text>
        <View className="rounded-2xl bg-black/10 overflow-hidden">
            <BlurView intensity={20} className="py-4 px-4">
            <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
            />
            </BlurView>
        </View>

        <Text className="text-lg opacity-50">新しいパスワード</Text>
        <View className="rounded-2xl bg-black/10 overflow-hidden">
            <BlurView intensity={20} className="py-4 px-4">
            <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            </BlurView>
        </View>

        <Text className="text-lg opacity-50">パスワード確認</Text>
        <View className="rounded-2xl bg-black/10 overflow-hidden">
            <BlurView intensity={20} className="py-4 px-4">
            <TextInput
                secureTextEntry
                value={cfmPassword}
                onChangeText={setCfmPassword}
            />
            </BlurView>
        </View>
        </>
    );
  };

  const renderSubmitButton = () => {
    if (step === "REQUEST") {
        return (
        <Button onPress={handleRequestReset} className="bg-theme">
            <Text className="text-white font-semibold">
            リセットメール送信
            </Text>
        </Button>
        );
    }

    return (
        <Button onPress={handleConfirmReset} className="bg-theme">
        <Text className="text-white font-semibold">
            パスワードを変更
        </Text>
        </Button>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="bg-white h-full w-full">
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="justify-around w-full h-full px-4"
        >
            <View className="h-40" />

            {/* Title */}
            <View className="gap-3">
            <H1>パスワード再設定</H1>
            <View className="flex-row gap-2 w-40">
                <View className="h-1.5 flex-1 bg-black rounded-full" />
                <View className="h-1.5 flex-1 bg-gray-300 rounded-full" />
            </View>
            </View>

            {/* Form */}
            <View className="gap-3">
            <Text className="text-lg opacity-50">Eメール</Text>
            <View className="rounded-2xl bg-black/10 overflow-hidden">
                <BlurView intensity={20} className="py-4 px-4">
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={step === "REQUEST"}
                />
                </BlurView>
            </View>

            {renderConfirmFields()}
            </View>

            {/* Submit */}
            <View className="gap-2">
            {renderSubmitButton()}

            <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row justify-center"
            >
            {/*This button is invariant between two steps*/}
                <Text className="opacity-50">ログインに戻る</Text>
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
        </View>
    </TouchableWithoutFeedback>
  );
};

export default Reset;
