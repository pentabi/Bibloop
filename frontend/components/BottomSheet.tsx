import { View, Text, Dimensions, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useImperativeHandle } from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = -SCREEN_HEIGHT + 50;

type BottomSheetProps = { children?: React.ReactNode };
export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({ children }, ref) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);

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
          scrollTo(-120);
        } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
          scrollTo(MAX_SHEET_HEIGHT);
        } else {
          scrollTo(MAX_SHEET_HEIGHT / 2);
        }
      });

    useEffect(() => {
      scrollTo(-SCREEN_HEIGHT / 3);
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
      <GestureDetector gesture={gesture}>
        <Animated.View
          className="flex-1 w-full bg-bottomSheet absolute"
          style={[styles.bottomSheetContainer, rBottomSheetStyle]}
        >
          <View className="self-center bg-gray-500 w-14 h-0.5 my-4 rounded-xl" />
          {children}
        </Animated.View>
      </GestureDetector>
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
