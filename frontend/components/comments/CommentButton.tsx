import React from "react";
import { MessageSquare } from "lucide-react-native";
import { Button } from "~/components/ui/button";
import { Text } from "../ui/text";

interface CommentButtonProps {
  isActive: boolean;
  onPress: () => void;
}

export const CommentButton = ({ isActive, onPress }: CommentButtonProps) => {
  return (
    <Button
      onPress={onPress}
      className="absolute rounded-full right-4 top-20  h-12 z-[10000] opacity-80 flex items-center justify-center flex-row gap-2"
    >
      <Text>{isActive ? "隠す" : "コメント"}</Text>
      <MessageSquare size={20} />
    </Button>
  );
};
