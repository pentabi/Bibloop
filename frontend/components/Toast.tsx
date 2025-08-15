import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { Animated, Text, View } from "react-native";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { clearToast } from "../redux/slices/toastSlice";
import { ToastType } from "../redux/types/ToastType";

//function for displaying toast components
export default function Toast() {
  const { title, context, type } = useSelector(
    (state: RootState) => state.toast
  );
  const dispatch = useDispatch();
  const translateY = useRef(new Animated.Value(-300)).current;

  const toastTheme = setColorByType(type!);
  const logo = changeLogoByTheme(toastTheme.theme);

  //for changing colors of the toast
  function setColorByType(type: ToastType) {
    if (type === ToastType.Error)
      return {
        theme: "Error",
        toastColor: "#FBD5D5",
        shadowColor: "#CE0000FF",
      };
    if (type === ToastType.Warning)
      return {
        theme: "Warning",
        toastColor: "#FEF3C7",
        shadowColor: "#C0CE00FF",
      };
    if (type === ToastType.Success)
      return {
        theme: "Success",
        toastColor: "#D1FADF",
        shadowColor: "#00CE34FF",
      };
    if (type === ToastType.Information)
      return {
        theme: "Information",
        toastColor: "#DBEAFE",
        shadowColor: "#0026CEFF",
      };
    return {
      theme: "Error",
      toastColor: "#FBD5D5",
      shadowColor: "#CE0000FF",
    };
  }

  //for changing logos of toast
  function changeLogoByTheme(type: string) {
    if (type === "Error") return <CircleAlert color={toastTheme.shadowColor} />;
    if (type === "Warning")
      return <TriangleAlert color={toastTheme.shadowColor} />;
    if (type === "Success")
      return <CircleCheck color={toastTheme.shadowColor} />;
    if (type === "Information") return <Info color={toastTheme.shadowColor} />;
    return <CircleAlert color={toastTheme.shadowColor} />;
  }

  useEffect(() => {
    translateY.setValue(-300);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Clear Redux after animation ends
        setTimeout(() => dispatch(clearToast()), 0);
      });
    }, 2000); // visible for 2s

    return () => clearTimeout(timeout);
  }, [context]);
  if (!context) return null;
  return (
    <View className="absolute top-0 left-8 right-8 items-center z-[999]">
      <Animated.View
        className="w-full mt-16  bg-white rounded-lg"
        style={{
          transform: [{ translateY }],
          shadowColor: toastTheme.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <LinearGradient
          colors={[toastTheme.toastColor, "#ffffff", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 8,
            padding: 16,
          }}
        >
          <View className="flex-row ">
            {logo}
            <View className="ml-2">
              <Text className="font-semibold text-lg mb-2">{title}</Text>
              <Text className="text-gray-500">{context}</Text>
            </View>
          </View>

          <View className="p-"></View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
