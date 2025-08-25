import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, ShoppingBag } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Shop = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">ショップ</Text>
        <View className="w-10" />
      </View>

      {/* Coming Soon Content */}
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-card rounded-xl border border-border p-8 items-center max-w-sm">
          <View className="bg-primary/10 rounded-full p-4 mb-4">
            <ShoppingBag size={48} color="#007AFF" />
          </View>

          <Text className="text-xl font-bold text-foreground mb-2 text-center">
            ショップ機能
          </Text>

          <Text className="text-lg font-semibold text-primary mb-4 text-center">
            近日公開予定！
          </Text>

          <Text className="text-sm text-muted-foreground text-center leading-relaxed">
            ポイントを使ってアバターアイテムや{"\n"}
            特別な機能を購入できるショップを{"\n"}
            準備中です。お楽しみに！
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Shop;
