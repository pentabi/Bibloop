import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import AnimatedInfoCards from "~/components/AnimatedInfoCards";

const testimonials = [
  {
    content: "This app changed the way I read every morning.",
    title: "Mika Tanaka",
    subTitle: "Community Member",
    src: "https://picsum.photos/seed/1/800/600",
  },
  {
    content: "Clean UI and thoughtful details throughout.",
    title: "David Chen",
    subTitle: "Engineer",
    src: "https://picsum.photos/seed/2/800/600",
  },
  {
    content: "It keeps me consistent and focused.",
    title: "Sara Ito",
    subTitle: "Student",
    src: "https://picsum.photos/seed/3/800/600",
  },
];

const credits = () => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Text>back</Text>
      </TouchableOpacity>
      <AnimatedInfoCards
        informations={testimonials}
        autoplay
        interval_length={10000}
      />
    </View>
  );
};

export default credits;
