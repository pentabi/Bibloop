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
import { useErrorHandler } from "~/hooks/useErrorHandler";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { useDispatch } from "react-redux";
import { addComment } from "~/redux/slices/commentsSlice";

interface CommentInputProps {
  showComments: boolean;
  postId?: string;
}

const CommentInput = ({ showComments, postId }: CommentInputProps) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
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

      if (result.data) {
        dispatch(
          addComment({
            id: result.data.id,
            postId: postId,
            content: commentText.trim(),
            creatorId: user.id ?? "",
            creatorName: user.name || "あなた",
            creatorProfile: {
              profileImagePath: user.profileImagePath ?? undefined,
            },
            likesCount: 0,
            isLikedByCurrentUser: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
      }
      // Clear input and call callback
      setCommentText("");
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
