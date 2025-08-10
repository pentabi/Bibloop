import { KeyboardAvoidingView, Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react-native";

const CommentInput = ({ showComments }: { showComments: boolean }) => {
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
          />
          <Button>
            <ArrowUp></ArrowUp>
          </Button>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default CommentInput;
