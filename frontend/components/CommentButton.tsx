import React from "react";
import { MessageSquare } from "lucide-react-native";
import { Button } from "~/components/ui/button";

interface CommentButtonProps {
  onPress: () => void;
}

export const CommentButton = ({ onPress }: CommentButtonProps) => {
  return (
    <Button
      onPress={onPress}
      className="absolute rounded-full right-4 top-20 w-12 h-12 z-[10000] opacity-80 flex items-center justify-center"
    >
      <MessageSquare size={20} />
    </Button>
  );
};
