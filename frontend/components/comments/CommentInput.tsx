import { KeyboardAvoidingView, Platform, View, Alert } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react-native";
import { useState } from "react";
import { client } from "~/lib/amplify-client";
import { getCurrentUser } from "aws-amplify/auth";
import { useErrorHandler } from "~/hooks/useErrorHandler";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

interface CommentInputProps {
  showComments: boolean;
  postId?: string;
  onCommentSubmitted?: () => void;
}

const CommentInput = ({
  showComments,
  postId,
  onCommentSubmitted,
}: CommentInputProps) => {
  const user = useSelector((state: RootState) => state.user);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      handleError("コメントを入力してください", "入力エラー");
      return;
    }

    if (!postId) {
      handleError("投稿IDが見つかりません", "システムエラー");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("Creating comment with:", {
        postId,
        content: commentText.trim(),
        creatorId: user.userId,
        isPrivate: false,
        status: "active",
      });

      // Create comment with proper data types
      const result = await client.models.Comment.create({
        postId: postId,
        content: commentText.trim(),
        creatorId: user.id ?? "",
        isPrivate: false, //TODO make friends only chat and staff
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("Comment created successfully:", result);

      // Clear input and call callback
      setCommentText("");
      onCommentSubmitted?.();

      Alert.alert("成功", "コメントが投稿されました！");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      handleError(error, "コメントの投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(showComments ? 0 : 100, {}),
        },
      ],
    };
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      className="absolute bottom-0 left-0 right-0 z-10"
      pointerEvents={showComments ? "auto" : "none"}
    >
      <Animated.View
        className="p-4 bg-white min-h-[60px]"
        style={animatedStyle}
      >
        <Text className="text-blue-600 mb-2">コメントセクション</Text>
        <View className="flex-row">
          <Input
            placeholder="コメントを入力..."
            className="bg-gray-50 border-2 border-blue-300 flex-1"
            value={commentText}
            onChangeText={setCommentText}
            editable={!isSubmitting}
          />
          <Button
            onPress={handleSubmitComment}
            disabled={isSubmitting || !commentText.trim()}
            className="ml-2"
          >
            <ArrowUp />
          </Button>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default CommentInput;
