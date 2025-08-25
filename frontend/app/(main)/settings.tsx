import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import { signOut } from "~/utils/signOut";
import {
  ChevronRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  LogOut,
  ArrowLeft,
  User,
  Edit,
} from "lucide-react-native";
import Modal from "~/components/Modal";
import { Input } from "~/components/ui/input";
import ChangeName from "~/components/modal/ChangeName";
import ChangeUserId from "~/components/modal/ChangeUserId";

const settings = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  // Local state for settings
  const [showTestimony, setShowTestimony] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Force light mode
  const [feedbackModalOpen, setFeedbackModal] = useState(false);
  const [changeNameModalOpen, setChangeNameModalOpen] = useState(false);
  const [changeUserIdModalOpen, setChangeUserIdModalOpen] = useState(false);

  const handleToggleDarkMode = () => {
    // Show popup when user tries to enable dark mode
    Alert.alert(
      "ダークモード",
      "ダークモードは今後のアップデートで利用可能になります。現在はライトモードのみご利用いただけます。",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleEmailChange = () => {
    Alert.alert("メールアドレス変更", "メールアドレスを変更しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "変更", onPress: () => console.log("Navigate to email change") },
    ]);
  };

  const handlePasswordChange = () => {
    Alert.alert("パスワード変更", "パスワードを変更しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "変更",
        onPress: () => console.log("Navigate to password change"),
      },
    ]);
  };

  const handleUserIdChange = () => {
    setChangeUserIdModalOpen(true);
  };

  const handleNameChange = () => {
    setChangeNameModalOpen(true);
  };

  const handleFeedback = () => {
    setFeedbackModal(true);
  };

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-muted-foreground mb-3 px-4 uppercase tracking-wide">
        {title}
      </Text>
      <View className="bg-card rounded-xl mx-4 overflow-hidden">
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-border last:border-b-0"
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon size={20} className="text-foreground mr-3" />
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-muted-foreground mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement ||
        (onPress && (
          <ChevronRight size={16} className="text-muted-foreground" />
        ))}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 pt-16 bg-card border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">設定</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="p-4 bg-card mx-4 mt-6 rounded-xl">
          <Text className="text-lg font-semibold text-foreground mb-1">
            {user?.name || "ユーザー"}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {user?.userIdentifier || "user@example.com"}
          </Text>
        </View>
        {/* Appearance */}
        <SettingsSection title="表示">
          <SettingsItem
            icon={Sun}
            title="ダークモード"
            subtitle="今後のアップデートで利用可能になります"
            rightElement={
              <Switch
                value={false}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor="#f4f3f4"
              />
            }
          />
        </SettingsSection>
        {/* Account */}
        <SettingsSection title="アカウント">
          <SettingsItem
            icon={Edit}
            title="名前"
            subtitle="表示名を変更"
            onPress={handleNameChange}
          />
          <SettingsItem
            icon={User}
            title="ユーザーID"
            subtitle="ユーザーIDを変更"
            onPress={handleUserIdChange}
          />
        </SettingsSection>
        {/* <TouchableOpacity
          onPress={() => {
            router.push("/credits");
          }}
        >
          <Text>クレジット</Text>
        </TouchableOpacity>

        {/* Privacy */}
        {/* <SettingsSection title="プライバシー">
          <SettingsItem
            icon={showTestimony ? Eye : EyeOff}
            title="証を公開"
            subtitle={
              showTestimony
                ? "友達以外のユーザーのあなたの証言を見ることができます"
                : "証は友達にしか見られません"
            }
            rightElement={
              <Switch
                value={showTestimony}
                onValueChange={setShowTestimony}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={showTestimony ? "#f5dd4b" : "#f4f3f4"}
              />
            }
          />
        </SettingsSection>
        <Text className="self-center">
          also have credits and updates section and stuff
        </Text> */}
        {/* Support */}
        {/* <SettingsSection title="サポート">
          <SettingsItem
            icon={MessageSquare}
            title="フィードバック"
            subtitle="ご意見・ご要望をお聞かせください"
            onPress={handleFeedback}
          />
        </SettingsSection>
        <Modal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModal(false)}
          withInput
        >
          <View className="bg-background w-full p-4 h-96 rounded-xl items-center justify-center">
            <TouchableOpacity
              onPress={() => {
                setFeedbackModal(false);
              }}
            >
              <Text>Close</Text>
            </TouchableOpacity>
            <Text>pls give feedback</Text>
            <Input className="w-full" />
          </View>
        </Modal> */}
        {/* Change Name Modal */}
        <Modal
          isOpen={changeNameModalOpen}
          onClose={() => setChangeNameModalOpen(false)}
          withInput
        >
          <ChangeName onClose={() => setChangeNameModalOpen(false)} />
        </Modal>
        {/* Change User ID Modal */}
        <Modal
          isOpen={changeUserIdModalOpen}
          onClose={() => setChangeUserIdModalOpen(false)}
          withInput
        >
          <ChangeUserId onClose={() => setChangeUserIdModalOpen(false)} />
        </Modal>
        <SettingsSection title="">
          <SettingsItem icon={LogOut} title="ログアウト" onPress={signOut} />
        </SettingsSection>
        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default settings;
