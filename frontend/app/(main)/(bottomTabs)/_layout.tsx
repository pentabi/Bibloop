import { Tabs } from "expo-router";
import {
  Home,
  Book,
  User,
  BookA,
  BookIcon,
  ScrollText,
} from "lucide-react-native";
import { useColorScheme } from "~/lib/useColorScheme";

export default function MainLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Tabs
      initialRouteName="home" // Set the initial tab
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkColorScheme ? "#ffffff" : "#007AFF",
        tabBarInactiveTintColor: isDarkColorScheme ? "#8e8e93" : "#8e8e93",
        tabBarStyle: {
          backgroundColor: isDarkColorScheme ? "#1c1c1e" : "#ffffff",
          borderTopColor: isDarkColorScheme ? "#38383a" : "#c6c6c8",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chapter"
        options={{
          title: "今日の一章",
          tabBarIcon: ({ color, size }) => (
            <ScrollText color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: "聖書",
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="userProfile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
