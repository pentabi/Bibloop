import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import AnimatedTestimonials from "~/components/AnimatedTestimonials";

const testimonials = [
  {
    quote: "This app changed the way I read every morning.",
    name: "Mika Tanaka",
    designation: "Community Member",
    src: "https://picsum.photos/seed/1/800/600",
  },
  {
    quote: "Clean UI and thoughtful details throughout.",
    name: "David Chen",
    designation: "Engineer",
    src: "https://picsum.photos/seed/2/800/600",
  },
  {
    quote: "It keeps me consistent and focused.",
    name: "Sara Ito",
    designation: "Student",
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
      <AnimatedTestimonials testimonials={testimonials} autoplay />
    </View>
  );
};

export default credits;
