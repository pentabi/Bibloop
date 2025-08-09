import { useEffect, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from "react-native-reanimated";

type Information = {
  content: string;
  title: string;
  subTitle: string;
  src: string; // local require or remote URL
};

type AnimatedInfoCardsProps = {
  informations: Information[];
  autoplay?: boolean;
  interval_length?: number;
};

export default function AnimatedInfoCards({
  informations,
  autoplay = false,
  interval_length = 5000,
}: AnimatedInfoCardsProps) {
  const [active, setActive] = useState(0);

  // Safety check for empty array
  if (!informations || informations.length === 0) {
    return (
      <View className="w-full px-4 py-6">
        <Text className="text-center text-gray-500">
          No information available
        </Text>
      </View>
    );
  }

  //moves the index
  const handleNext = () => {
    setActive((prev) => (prev + 1) % informations.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + informations.length) % informations.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  //optional autoplay functionality
  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, interval_length);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 25) - 10;
  };

  return (
    <View className="w-full px-4 py-6">
      <View className="flex-row">
        {/* Left: stacked images */}
        <View className="w-1/2 h-80 relative mr-6">
          {informations.map((information, index) => {
            const AnimatedCard = () => {
              const opacity = useSharedValue(isActive(index) ? 1 : 0.7);
              const scale = useSharedValue(isActive(index) ? 1 : 0.95);
              const zIndex = useSharedValue(
                isActive(index) ? 40 : informations.length + 2 - index
              );
              const rotate = useSharedValue(
                isActive(index) ? 0 : randomRotateY()
              );
              const translateY = useSharedValue(0);

              useEffect(() => {
                opacity.value = withTiming(isActive(index) ? 1 : 0.7, {
                  duration: 400,
                });
                scale.value = withTiming(isActive(index) ? 1 : 0.95, {
                  duration: 400,
                });
                zIndex.value = withTiming(
                  isActive(index) ? 40 : informations.length + 2 - index,
                  { duration: 400 }
                );
                rotate.value = withTiming(
                  isActive(index) ? 0 : randomRotateY(),
                  {
                    duration: 400,
                  }
                );

                if (isActive(index)) {
                  // Bounce animation: y: [0, -80, 0]
                  translateY.value = withSequence(
                    withTiming(0, { duration: 0 }),
                    withTiming(-80, { duration: 200 }),
                    withTiming(0, { duration: 200 })
                  );
                } else {
                  translateY.value = withTiming(0, { duration: 400 });
                }
              }, [active]);

              const animatedStyle = useAnimatedStyle(() => ({
                opacity: opacity.value,
                transform: [
                  { scale: scale.value },
                  { rotate: `${rotate.value}deg` },
                  { translateY: translateY.value },
                ],
                zIndex: zIndex.value,
              }));

              // Support local require or remote URL
              const source =
                typeof information.src === "number"
                  ? information.src
                  : { uri: information.src };

              return (
                <Animated.View
                  key={`${information.src}-${index}`}
                  className="absolute inset-0 rounded-3xl overflow-hidden bg-gray-200"
                  style={animatedStyle}
                >
                  <Image
                    source={source}
                    resizeMode="cover"
                    className="w-full h-full"
                    onError={(error) => console.log("Image load error:", error)}
                    onLoad={() => console.log("Image loaded successfully")}
                  />
                </Animated.View>
              );
            };

            return <AnimatedCard key={`card-${index}`} />;
          })}
        </View>

        {/* Right: text & controls */}
        <View className="w-1/2 justify-between py-2">
          <AnimatedTextBlock key={active} information={informations[active]} />

          <View className="flex-row gap-3 pt-6">
            <CircleButton onPress={handlePrev} label="‹" />
            <CircleButton onPress={handleNext} label="›" />
          </View>
        </View>
      </View>
    </View>
  );
}

function AnimatedTextBlock({ information }: { information: Information }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 20;

    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
  }, [information]);

  const textAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={textAnim}>
      <Text className="text-2xl font-bold text-black dark:text-white">
        {information.title}
      </Text>
      <Text className="mt-0.5 text-sm text-gray-500 dark:text-neutral-500">
        {information.subTitle}
      </Text>
      <View className="mr-4">
        <AnimatedQuote content={information.content} />
      </View>
    </Animated.View>
  );
}

function AnimatedQuote({ content }: { content: string }) {
  const words = content.split(" ");

  return (
    <View className="mt-4 flex-row flex-wrap">
      {words.map((word, index) => {
        const WordComponent = () => {
          const opacity = useSharedValue(0);
          const translateY = useSharedValue(5);

          useEffect(() => {
            const delay = 20 * index; // 0.02s * index converted to ms

            setTimeout(() => {
              opacity.value = withTiming(1, { duration: 200 });
              translateY.value = withTiming(0, { duration: 200 });
            }, delay);
          }, []);

          const wordStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
          }));

          return (
            <Animated.Text
              key={`word-${index}`}
              className="text-lg text-gray-500 dark:text-neutral-300 "
              style={wordStyle}
            >
              {word}{" "}
            </Animated.Text>
          );
        };

        return <WordComponent key={`word-comp-${index}`} />;
      })}
    </View>
  );
}

function CircleButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
    >
      <Text className="text-lg text-black dark:text-neutral-400">{label}</Text>
    </Pressable>
  );
}
