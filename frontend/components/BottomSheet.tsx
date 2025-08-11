import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentInput from "./CommentInput";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = -SCREEN_HEIGHT + 50;

type BottomSheetProps = {
  children?: React.ReactNode;
  postId?: string;
  onCommentSubmitted?: () => void;
};
export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({ children, postId, onCommentSubmitted }, ref) => {
    const insets = useSafeAreaInsets();

    // Calculate dynamic closed position based on tab bar height
    // Typical tab bar height is ~50px + safe area bottom + some padding
    const TAB_BAR_HEIGHT = 60; // Standard tab bar height
    const CLOSED_POSITION = -(insets.bottom + TAB_BAR_HEIGHT + 20); // 20px padding above tab bar
    const COMMENT_THRESHOLD = -SCREEN_HEIGHT / 2.7;

    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);
    const [showComments, setShowComments] = useState(false);

    //tell the components if they should show comment or not
    const shouldShowComments = useDerivedValue(() => {
      return translateY.value <= COMMENT_THRESHOLD;
    });
    // Bridge from worklet to React state
    useAnimatedReaction(
      () => shouldShowComments.value,
      (current) => {
        runOnJS(setShowComments)(current);
      }
    );

    function scrollTo(destination: number) {
      "worklet";
      active.value = destination !== 0;
      translateY.value = withSpring(destination, { damping: 50 });
    }

    function isActive() {
      return active.value;
    }

    useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
      scrollTo,
      isActive,
    ]);

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_SHEET_HEIGHT);
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(CLOSED_POSITION);
        } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
          scrollTo(MAX_SHEET_HEIGHT);
        } else {
          scrollTo(MAX_SHEET_HEIGHT / 2);
        }
      });

    useEffect(() => {
      scrollTo(0);
    }, []);

    const rBottomSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [MAX_SHEET_HEIGHT + 50, MAX_SHEET_HEIGHT],
        [25, 5],
        Extrapolation.CLAMP
      );
      return { borderRadius, transform: [{ translateY: translateY.value }] };
    });

    return (
      <>
        <GestureDetector gesture={gesture}>
          <Animated.View
            className="flex-1 w-full bg-bottomSheet absolute"
            style={[styles.bottomSheetContainer, rBottomSheetStyle]}
          >
            <View className="self-center bg-gray-500 w-14 h-0.5 my-4 rounded-xl" />
            {children}
          </Animated.View>
        </GestureDetector>
        <CommentInput
          showComments={showComments}
          postId={postId}
          onCommentSubmitted={onCommentSubmitted}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    top: SCREEN_HEIGHT,
    height: SCREEN_HEIGHT,
  },
});

export default BottomSheet;
