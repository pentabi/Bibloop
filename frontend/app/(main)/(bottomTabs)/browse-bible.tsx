import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Book, Search, ChevronRight, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useKougoBibleData, KougoBibleBook } from "~/hooks/useKougoBibleData";
import { useKougoBibleUI } from "~/hooks/useKougoBibleUI";

const Bible = () => {
  const router = useRouter();

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
      <View className="bg-gray-50 p-4 border-l-2 border-blue-200">
        <Text className="text-sm text-gray-600 mb-3">
          章を選択してください：
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              onPress={() => navigateToChapter(book.id, book.japName, chapter)}
              className="bg-blue-500 px-4 py-2 rounded-lg min-w-[50px] items-center"
            >
              <Text className="text-white font-semibold">{chapter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const BookCard = ({ book }: { book: KougoBibleBook }) => {
    const isExpanded = isBookExpanded(book.id);

    return (
      <View className="bg-card rounded-xl mb-3 border border-border shadow-sm overflow-hidden">
        <TouchableOpacity className="p-4" onPress={() => toggleBook(book.id)}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Book
                  size={18}
                  className={`mr-2 ${
                    book.testament === "old"
                      ? "text-amber-600"
                      : "text-blue-600"
                  }`}
                />
                <Text className="text-base font-semibold text-foreground">
                  {book.japName}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">
                  {book.category}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {book.totalChapters}章
                </Text>
              </View>
            </View>
            {isExpanded ? (
              <ChevronDown size={20} className="text-muted-foreground ml-2" />
            ) : (
              <ChevronRight size={20} className="text-muted-foreground ml-2" />
            )}
          </View>
        </TouchableOpacity>
        {isExpanded && renderChapterButtons(book)}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-foreground">聖書を読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          onPress={loadKougoBibleBooks}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white">再試行</Text>
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
        <View className="flex-row items-center bg-secondary rounded-xl px-3 py-2 mb-4">
          <Search size={20} className="text-muted-foreground mr-2" />
          <TextInput
            className="flex-1 text-foreground"
            placeholder="書名または分類で検索..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Testament Filter */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              selectedTestament === "old" ? "bg-amber-600" : "bg-secondary"
            }`}
            onPress={() => selectTestament("old")}
          >
            <Text
              className={`text-sm font-medium ${
                selectedTestament === "old"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              旧約聖書
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              selectedTestament === "new" ? "bg-blue-600" : "bg-secondary"
            }`}
            onPress={() => selectTestament("new")}
          >
            <Text
              className={`text-sm font-medium ${
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
            <Book size={48} className="text-muted-foreground mb-4" />
            <Text className="text-muted-foreground text-center">
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
