import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState, useMemo } from "react";
import {
  Book,
  Search,
  ChevronRight,
  BookOpen,
  Scroll,
} from "lucide-react-native";
import { useRouter } from "expo-router";

// Bible books data
const oldTestamentBooks = [
  { name: "創世記", chapters: 50, category: "律法書" },
  { name: "出エジプト記", chapters: 40, category: "律法書" },
  { name: "レビ記", chapters: 27, category: "律法書" },
  { name: "民数記", chapters: 36, category: "律法書" },
  { name: "申命記", chapters: 34, category: "律法書" },
  { name: "ヨシュア記", chapters: 24, category: "歴史書" },
  { name: "士師記", chapters: 21, category: "歴史書" },
  { name: "ルツ記", chapters: 4, category: "歴史書" },
  { name: "サムエル記第一", chapters: 31, category: "歴史書" },
  { name: "サムエル記第二", chapters: 24, category: "歴史書" },
  { name: "列王記第一", chapters: 22, category: "歴史書" },
  { name: "列王記第二", chapters: 25, category: "歴史書" },
  { name: "歴代誌第一", chapters: 29, category: "歴史書" },
  { name: "歴代誌第二", chapters: 36, category: "歴史書" },
  { name: "エズラ記", chapters: 10, category: "歴史書" },
  { name: "ネヘミヤ記", chapters: 13, category: "歴史書" },
  { name: "エステル記", chapters: 10, category: "歴史書" },
  { name: "ヨブ記", chapters: 42, category: "詩歌・知恵書" },
  { name: "詩篇", chapters: 150, category: "詩歌・知恵書" },
  { name: "箴言", chapters: 31, category: "詩歌・知恵書" },
  { name: "伝道者の書", chapters: 12, category: "詩歌・知恵書" },
  { name: "雅歌", chapters: 8, category: "詩歌・知恵書" },
  { name: "イザヤ書", chapters: 66, category: "預言書" },
  { name: "エレミヤ書", chapters: 52, category: "預言書" },
  { name: "哀歌", chapters: 5, category: "預言書" },
  { name: "エゼキエル書", chapters: 48, category: "預言書" },
  { name: "ダニエル書", chapters: 12, category: "預言書" },
  { name: "ホセア書", chapters: 14, category: "預言書" },
  { name: "ヨエル書", chapters: 3, category: "預言書" },
  { name: "アモス書", chapters: 9, category: "預言書" },
  { name: "オバデヤ書", chapters: 1, category: "預言書" },
  { name: "ヨナ書", chapters: 4, category: "預言書" },
  { name: "ミカ書", chapters: 7, category: "預言書" },
  { name: "ナホム書", chapters: 3, category: "預言書" },
  { name: "ハバクク書", chapters: 3, category: "預言書" },
  { name: "ゼパニヤ書", chapters: 3, category: "預言書" },
  { name: "ハガイ書", chapters: 2, category: "預言書" },
  { name: "ゼカリヤ書", chapters: 14, category: "預言書" },
  { name: "マラキ書", chapters: 4, category: "預言書" },
];

const newTestamentBooks = [
  { name: "マタイの福音書", chapters: 28, category: "福音書" },
  { name: "マルコの福音書", chapters: 16, category: "福音書" },
  { name: "ルカの福音書", chapters: 24, category: "福音書" },
  { name: "ヨハネの福音書", chapters: 21, category: "福音書" },
  { name: "使徒の働き", chapters: 28, category: "歴史書" },
  { name: "ローマ人への手紙", chapters: 16, category: "パウロ書簡" },
  { name: "コリント人への手紙第一", chapters: 16, category: "パウロ書簡" },
  { name: "コリント人への手紙第二", chapters: 13, category: "パウロ書簡" },
  { name: "ガラテヤ人への手紙", chapters: 6, category: "パウロ書簡" },
  { name: "エペソ人への手紙", chapters: 6, category: "パウロ書簡" },
  { name: "ピリピ人への手紙", chapters: 4, category: "パウロ書簡" },
  { name: "コロサイ人への手紙", chapters: 4, category: "パウロ書簡" },
  { name: "テサロニケ人への手紙第一", chapters: 5, category: "パウロ書簡" },
  { name: "テサロニケ人への手紙第二", chapters: 3, category: "パウロ書簡" },
  { name: "テモテへの手紙第一", chapters: 6, category: "パウロ書簡" },
  { name: "テモテへの手紙第二", chapters: 4, category: "パウロ書簡" },
  { name: "テトスへの手紙", chapters: 3, category: "パウロ書簡" },
  { name: "ピレモンへの手紙", chapters: 1, category: "パウロ書簡" },
  { name: "ヘブル人への手紙", chapters: 13, category: "一般書簡" },
  { name: "ヤコブの手紙", chapters: 5, category: "一般書簡" },
  { name: "ペテロの手紙第一", chapters: 5, category: "一般書簡" },
  { name: "ペテロの手紙第二", chapters: 3, category: "一般書簡" },
  { name: "ヨハネの手紙第一", chapters: 5, category: "一般書簡" },
  { name: "ヨハネの手紙第二", chapters: 1, category: "一般書簡" },
  { name: "ヨハネの手紙第三", chapters: 1, category: "一般書簡" },
  { name: "ユダの手紙", chapters: 1, category: "一般書簡" },
  { name: "ヨハネの黙示録", chapters: 22, category: "黙示文学" },
];

const Bible = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestament, setSelectedTestament] = useState<
    "old" | "new" | "all"
  >("all");

  const filteredBooks = useMemo(() => {
    const allBooks = [
      ...oldTestamentBooks.map((book) => ({
        ...book,
        testament: "old" as const,
      })),
      ...newTestamentBooks.map((book) => ({
        ...book,
        testament: "new" as const,
      })),
    ];

    let filtered = allBooks;

    if (selectedTestament !== "all") {
      filtered = filtered.filter(
        (book) => book.testament === selectedTestament
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedTestament]);

  const BookCard = ({
    book,
    testament,
  }: {
    book: any;
    testament: "old" | "new";
  }) => (
    <TouchableOpacity
      className="bg-card rounded-xl p-4 mb-3 border border-border shadow-sm"
      onPress={() => {
        // TODO: Navigate to book chapters
        console.log(`Navigate to ${book.name}`);
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Book
              size={18}
              className={`mr-2 ${
                testament === "old" ? "text-amber-600" : "text-blue-600"
              }`}
            />
            <Text className="text-base font-semibold text-foreground">
              {book.name}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">
              {book.category}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {book.chapters}章
            </Text>
          </View>
        </View>
        <ChevronRight size={20} className="text-muted-foreground ml-2" />
      </View>
    </TouchableOpacity>
  );

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
              selectedTestament === "all" ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => setSelectedTestament("all")}
          >
            <Text
              className={`text-sm font-medium ${
                selectedTestament === "all"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              すべて
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              selectedTestament === "old" ? "bg-amber-600" : "bg-secondary"
            }`}
            onPress={() => setSelectedTestament("old")}
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
            onPress={() => setSelectedTestament("new")}
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
        {selectedTestament === "all" || selectedTestament === "old" ? (
          <>
            {selectedTestament === "all" && !searchQuery && (
              <View className="flex-row items-center mb-4">
                <Scroll size={20} className="text-amber-600 mr-2" />
                <Text className="text-lg font-bold text-foreground">
                  旧約聖書 ({oldTestamentBooks.length}巻)
                </Text>
              </View>
            )}

            {filteredBooks
              .filter((book) => book.testament === "old")
              .map((book, index) => (
                <BookCard key={`old-${index}`} book={book} testament="old" />
              ))}
          </>
        ) : null}

        {selectedTestament === "all" || selectedTestament === "new" ? (
          <>
            {selectedTestament === "all" && !searchQuery && (
              <View className="flex-row items-center mb-4 mt-6">
                <BookOpen size={20} className="text-blue-600 mr-2" />
                <Text className="text-lg font-bold text-foreground">
                  新約聖書 ({newTestamentBooks.length}巻)
                </Text>
              </View>
            )}

            {filteredBooks
              .filter((book) => book.testament === "new")
              .map((book, index) => (
                <BookCard key={`new-${index}`} book={book} testament="new" />
              ))}
          </>
        ) : null}

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
