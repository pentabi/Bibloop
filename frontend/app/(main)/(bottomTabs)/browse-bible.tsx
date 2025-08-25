import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import React, { useEffect } from "react";
import { Book, Search, ChevronRight, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useKougoBibleData, KougoBibleBook } from "~/hooks/useKougoBibleData";
import { useKougoBibleUI } from "~/hooks/useKougoBibleUI";

const Bible = () => {
  const router = useRouter();

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (Platform.OS === "android") {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const { books, loading, error, loadKougoBibleBooks } = useKougoBibleData();
  const {
    searchQuery,
    selectedTestament,
    filteredBooks,
    setSearchQuery,
    selectTestament,
    toggleBook,
    isBookExpanded,
  } = useKougoBibleUI(books);

  const navigateToChapter = (
    bookId: number,
    bookName: string,
    chapter: number
  ) => {
    router.push({
      pathname: "/bible-chapter",
      params: { bookId, bookName, chapter },
    });
  };

  const renderChapterButtons = (book: KougoBibleBook) => {
    const chapters = Array.from(
      { length: book.totalChapters },
      (_, i) => i + 1
    );

    return (
      <View className="bg-secondary/30 p-4 border-t border-border">
        <Text className="text-sm text-muted-foreground mb-3 font-medium">
          章を選択してください：
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              onPress={() => navigateToChapter(book.id, book.japName, chapter)}
              className="bg-primary px-4 py-2 rounded-lg min-w-[50px] items-center shadow-sm active:scale-95"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-white font-semibold text-sm">
                {chapter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const BookCard = ({ book }: { book: KougoBibleBook }) => {
    const isExpanded = isBookExpanded(book.id);

    const handleToggle = () => {
      // Configure animation
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
      toggleBook(book.id);
    };

    return (
      <View
        className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          className="p-4 active:bg-secondary/30"
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Book size={18} color="#6366F1" style={{ marginRight: 8 }} />
                <Text className="text-base font-semibold text-foreground">
                  {book.japName}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground font-medium">
                  {book.category}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {book.totalChapters}章
                </Text>
              </View>
            </View>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: isExpanded ? "90deg" : "0deg",
                  },
                ],
              }}
            >
              <ChevronRight
                size={20}
                color="#9CA3AF"
                style={{ marginLeft: 8 }}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
        {isExpanded && renderChapterButtons(book)}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-foreground font-medium">
          聖書を読み込み中...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-red-500 text-center font-medium">{error}</Text>
        <TouchableOpacity
          onPress={loadKougoBibleBooks}
          className="mt-4 bg-primary px-6 py-3 rounded-lg active:scale-95"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-white font-semibold">再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-16 pb-4 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-4">聖書</Text>

        {/* Search Bar */}
        <View
          className="flex-row items-center bg-secondary rounded-xl px-4 py-3 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Search size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 text-foreground"
            placeholder="書名または分類で検索..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Testament Filter */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`px-5 py-2.5 rounded-full ${
              selectedTestament === "old" ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => selectTestament("old")}
            activeOpacity={0.7}
            style={
              selectedTestament === "old"
                ? {
                    shadowColor: "#6366F1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                : {}
            }
          >
            <Text
              className={`text-sm font-semibold ${
                selectedTestament === "old"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              旧約聖書
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-5 py-2.5 rounded-full ${
              selectedTestament === "new" ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => selectTestament("new")}
            activeOpacity={0.7}
            style={
              selectedTestament === "new"
                ? {
                    shadowColor: "#6366F1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                : {}
            }
          >
            <Text
              className={`text-sm font-semibold ${
                selectedTestament === "new"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              新約聖書
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Books List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}

        {filteredBooks.length === 0 && (
          <View className="items-center justify-center py-20">
            <Book size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text className="text-muted-foreground text-center font-medium">
              {searchQuery
                ? "検索結果が見つかりませんでした"
                : "書籍が見つかりませんでした"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Bible;
