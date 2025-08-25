import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Calendar as RNCalendar } from "react-native-calendars";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
} from "lucide-react-native";
import { useCalendar } from "../../hooks/useCalendar";
import { useStreaks } from "../../hooks/useStreaks";

const Calendar = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Use the calendar hook to get actual data
  const { chapters, loading, markingLoading, error, markAsCompleted, refetch } =
    useCalendar();

  // Use streaks hook to get streak data
  const { currentStreak, maxStreak, loading: streaksLoading } = useStreaks();

  // Convert chapters data to calendar marking format
  const getMarkedDates = () => {
    const marked: any = {};

    Object.entries(chapters).forEach(([date, data]) => {
      const hasChapter = true;
      const isCompleted = data.completed;

      marked[date] = {
        marked: hasChapter,
        dotColor: isCompleted ? "#22c55e" : "#f59e0b", // Green if completed, Orange if not
        selected: selectedDate === date,
        selectedColor: selectedDate === date ? "#3b82f6" : undefined,
        selectedTextColor: selectedDate === date ? "#ffffff" : undefined,
      };
    });

    return marked;
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const chapterData = chapters[day.dateString];

    if (chapterData) {
      Alert.alert(
        `${chapterData.bookName} ${chapterData.chapterNumber}章`,
        chapterData.title,
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "読む",
            onPress: () => {
              router.push({
                pathname: "/bible-chapter",
                params: {
                  bookName: chapterData.bookName,
                  chapter: chapterData.chapterNumber,
                  date: day.dateString,
                },
              });
            },
          },
        ]
      );
    }
  };

  const handleMarkAsCompleted = async (date: string) => {
    // Return early if already loading
    if (markingLoading) return;

    try {
      await markAsCompleted(date);
      Alert.alert("完了", "この日の読書を完了としてマークしました！");
    } catch (err) {
      Alert.alert("エラー", "完了マークに失敗しました。");
    }
  };

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const todaysChapter = chapters[getTodayString()];

  // Show loading state
  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 pt-16 bg-blue-600">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">読書カレンダー</Text>
          <View className="w-8" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600">読み込み中...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 pt-16 bg-blue-600">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">読書カレンダー</Text>
          <View className="w-8" />
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-red-600 text-center mb-4">
            エラーが発生しました
          </Text>
          <Text className="text-gray-600 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={refetch}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">再試行</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 bg-blue-600">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">読書カレンダー</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1">
        {/* Today's Chapter Quick Access */}
        {todaysChapter && (
          <View className="mx-4 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm text-blue-600 font-medium">
                  今日の読書
                </Text>
                <Text className="text-lg font-bold text-gray-800">
                  {todaysChapter.bookName} {todaysChapter.chapterNumber}章
                </Text>
                <Text className="text-gray-600">{todaysChapter.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  router.replace("/(main)/(bottomTabs)/daily-reading");
                }}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">読む</Text>
              </TouchableOpacity>
            </View>
            {todaysChapter.completed && (
              <View className="flex-row items-center mt-2">
                <CheckCircle2 size={16} color="#22c55e" />
                <Text className="text-green-600 text-sm ml-1">読了済み</Text>
              </View>
            )}
          </View>
        )}

        {/* Legend */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">凡例</Text>
          <View className="flex-row justify-around bg-gray-50 p-4 rounded-xl">
            <View className="items-center">
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 mb-1" />
              <Text className="text-xs text-gray-600">章なし</Text>
            </View>
            <View className="items-center">
              <View className="w-6 h-6 rounded-full border-2 border-orange-500 mb-1">
                <View className="w-2 h-2 rounded-full bg-orange-500 absolute top-1 left-1" />
              </View>
              <Text className="text-xs text-gray-600">未読</Text>
            </View>
            <View className="items-center">
              <View className="w-6 h-6 rounded-full border-2 border-green-500 mb-1">
                <View className="w-2 h-2 rounded-full bg-green-500 absolute top-1 left-1" />
              </View>
              <Text className="text-xs text-gray-600">読了</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View className="mx-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <RNCalendar
            markingType="dot"
            markedDates={getMarkedDates()}
            onDayPress={onDayPress}
            onMonthChange={(month) => {
              setCurrentMonth(
                `${month.year}-${month.month.toString().padStart(2, "0")}`
              );
            }}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#6b7280",
              selectedDayBackgroundColor: "#3b82f6",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#3b82f6",
              dayTextColor: "#1f2937",
              textDisabledColor: "#d1d5db",
              dotColor: "#3b82f6",
              selectedDotColor: "#ffffff",
              arrowColor: "#3b82f6",
              disabledArrowColor: "#d1d5db",
              monthTextColor: "#1f2937",
              indicatorColor: "#3b82f6",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textDayFontWeight: "400",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            firstDay={1} // Start week on Monday
            showWeekNumbers={false}
            disableMonthChange={false}
            hideExtraDays={true}
            disableAllTouchEventsForDisabledDays={true}
          />
        </View>

        {/* Selected Date Info */}
        {selectedDate && chapters[selectedDate] && (
          <View className="mx-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <Text className="text-sm text-gray-600 mb-1">{selectedDate}</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {chapters[selectedDate].bookName}{" "}
                  {chapters[selectedDate].chapterNumber}章
                </Text>
                <Text className="text-gray-600">
                  {chapters[selectedDate].title}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                {chapters[selectedDate].completed ? (
                  <TouchableOpacity
                    onPress={() => handleMarkAsCompleted(selectedDate)}
                    disabled={markingLoading}
                    className={`flex-row items-center px-3 py-1 rounded-full ${
                      markingLoading ? "bg-gray-100 opacity-50" : "bg-green-100"
                    }`}
                  >
                    <CheckCircle2
                      size={16}
                      color={markingLoading ? "#9ca3af" : "#22c55e"}
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        markingLoading ? "text-gray-500" : "text-green-700"
                      }`}
                    >
                      {markingLoading ? "処理中..." : "完了"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleMarkAsCompleted(selectedDate)}
                    disabled={markingLoading}
                    className={`px-3 py-1 rounded-full ${
                      markingLoading
                        ? "bg-gray-100 opacity-50"
                        : "bg-orange-100"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        markingLoading ? "text-gray-500" : "text-orange-700"
                      }`}
                    >
                      {markingLoading ? "処理中..." : "完了にする"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Streaks Display */}
        <View className="mx-4 mt-4 mb-8">
          <View className="flex-row gap-x-4">
            {/* Current Streak */}
            <View className="flex-1 bg-orange-50 p-6 rounded-xl border border-orange-200">
              <View className="flex-row items-center justify-center mb-2">
                <Flame size={24} color="#f97316" />
                <Text className="text-sm font-medium text-orange-700 ml-2">
                  現在のストリーク
                </Text>
              </View>
              <Text className="text-3xl font-bold text-orange-800 text-center">
                {streaksLoading ? "..." : currentStreak}
              </Text>
              <Text className="text-sm text-orange-600 text-center mt-1">
                日連続
              </Text>
            </View>

            {/* Max Streak */}
            <View className="flex-1 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <View className="flex-row items-center justify-center mb-2">
                <Trophy size={24} color="#eab308" />
                <Text className="text-sm font-medium text-yellow-700 ml-2">
                  最大ストリーク
                </Text>
              </View>
              <Text className="text-3xl font-bold text-yellow-800 text-center">
                {streaksLoading ? "..." : maxStreak}
              </Text>
              <Text className="text-sm text-yellow-600 text-center mt-1">
                日連続
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Calendar;
