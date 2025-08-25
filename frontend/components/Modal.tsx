import {
  View,
  Text,
  Modal as RNModal,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import React from "react";

type ModalExtensionProps = ModalProps & {
  isOpen: boolean;
  withInput?: boolean;
  onClose: () => void;
};

const Modal = ({
  isOpen,
  withInput,
  onClose,
  children,
  ...rest
}: ModalExtensionProps) => {
  const handleBackdropPress = () => {
    onClose();
  };

  const content = withInput ? (
    <KeyboardAvoidingView
      className="items-center justify-center flex-1 px-3 bg-zinc-900/40"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => {}}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  ) : (
    <View className="items-center justify-center flex-1 px-3 bg-zinc-900/40">
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => {}}>
        {children}
      </TouchableWithoutFeedback>
    </View>
  );

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}
    >
      {content}
    </RNModal>
  );
};

export default Modal;
