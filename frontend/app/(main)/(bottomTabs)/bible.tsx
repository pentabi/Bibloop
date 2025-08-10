import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import {
  Book,
  Search,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Scroll,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { openKougoDB } from "~/utils/Kougodb";

interface BibleBook {
  id: number;
  name: string;
  japName: string;
  totalChapters: number;
  testament: "old" | "new";
  category: string;
}

// Map English book names to Japanese
const bookNameMap: { [key: string]: { name: string; category: string } } = {
  Genesis: { name: "創世記", category: "律法書" },
  Exodus: { name: "出エジプト記", category: "律法書" },
  Leviticus: { name: "レビ記", category: "律法書" },
  Numbers: { name: "民数記", category: "律法書" },
  Deuteronomy: { name: "申命記", category: "律法書" },
  Joshua: { name: "ヨシュア記", category: "歴史書" },
  Judges: { name: "士師記", category: "歴史書" },
  Ruth: { name: "ルツ記", category: "歴史書" },
  "I Samuel": { name: "サムエル記第一", category: "歴史書" },
  "II Samuel": { name: "サムエル記第二", category: "歴史書" },
  "I Kings": { name: "列王記第一", category: "歴史書" },
  "II Kings": { name: "列王記第二", category: "歴史書" },
  "I Chronicles": { name: "歴代誌第一", category: "歴史書" },
  "II Chronicles": { name: "歴代誌第二", category: "歴史書" },
  Ezra: { name: "エズラ記", category: "歴史書" },
  Nehemiah: { name: "ネヘミヤ記", category: "歴史書" },
  Esther: { name: "エステル記", category: "歴史書" },
  Job: { name: "ヨブ記", category: "詩歌・知恵書" },
  Psalms: { name: "詩篇", category: "詩歌・知恵書" },
  Proverbs: { name: "箴言", category: "詩歌・知恵書" },
  Ecclesiastes: { name: "伝道者の書", category: "詩歌・知恵書" },
  "Song of Solomon": { name: "雅歌", category: "詩歌・知恵書" },
  Isaiah: { name: "イザヤ書", category: "預言書" },
  Jeremiah: { name: "エレミヤ書", category: "預言書" },
  Lamentations: { name: "哀歌", category: "預言書" },
  Ezekiel: { name: "エゼキエル書", category: "預言書" },
  Daniel: { name: "ダニエル書", category: "預言書" },
  Hosea: { name: "ホセア書", category: "預言書" },
  Joel: { name: "ヨエル書", category: "預言書" },
  Amos: { name: "アモス書", category: "預言書" },
  Obadiah: { name: "オバデヤ書", category: "預言書" },
  Jonah: { name: "ヨナ書", category: "預言書" },
  Micah: { name: "ミカ書", category: "預言書" },
  Nahum: { name: "ナホム書", category: "預言書" },
  Habakkuk: { name: "ハバクク書", category: "預言書" },
  Zephaniah: { name: "ゼパニヤ書", category: "預言書" },
  Haggai: { name: "ハガイ書", category: "預言書" },
  Zechariah: { name: "ゼカリヤ書", category: "預言書" },
  Malachi: { name: "マラキ書", category: "預言書" },
  Matthew: { name: "マタイの福音書", category: "福音書" },
  Mark: { name: "マルコの福音書", category: "福音書" },
  Luke: { name: "ルカの福音書", category: "福音書" },
  John: { name: "ヨハネの福音書", category: "福音書" },
  Acts: { name: "使徒の働き", category: "歴史書" },
  Romans: { name: "ローマ人への手紙", category: "パウロ書簡" },
  "I Corinthians": { name: "コリント人への手紙第一", category: "パウロ書簡" },
  "II Corinthians": { name: "コリント人への手紙第二", category: "パウロ書簡" },
  Galatians: { name: "ガラテヤ人への手紙", category: "パウロ書簡" },
  Ephesians: { name: "エペソ人への手紙", category: "パウロ書簡" },
  Philippians: { name: "ピリピ人への手紙", category: "パウロ書簡" },
  Colossians: { name: "コロサイ人への手紙", category: "パウロ書簡" },
  "I Thessalonians": {
    name: "テサロニケ人への手紙第一",
    category: "パウロ書簡",
  },
  "II Thessalonians": {
    name: "テサロニケ人への手紙第二",
    category: "パウロ書簡",
  },
  "I Timothy": { name: "テモテへの手紙第一", category: "パウロ書簡" },
  "II Timothy": { name: "テモテへの手紙第二", category: "パウロ書簡" },
  Titus: { name: "テトスへの手紙", category: "パウロ書簡" },
  Philemon: { name: "ピレモンへの手紙", category: "パウロ書簡" },
  Hebrews: { name: "ヘブル人への手紙", category: "一般書簡" },
  James: { name: "ヤコブの手紙", category: "一般書簡" },
  "I Peter": { name: "ペテロの手紙第一", category: "一般書簡" },
  "II Peter": { name: "ペテロの手紙第二", category: "一般書簡" },
  "I John": { name: "ヨハネの手紙第一", category: "一般書簡" },
  "II John": { name: "ヨハネの手紙第二", category: "一般書簡" },
  "III John": { name: "ヨハネの手紙第三", category: "一般書簡" },
  Jude: { name: "ユダの手紙", category: "一般書簡" },
  "Revelation of John": { name: "ヨハネの黙示録", category: "黙示文学" },
};
const Bible = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestament, setSelectedTestament] = useState<"old" | "new">(
    "old"
  );
  const [expandedBook, setExpandedBook] = useState<number | null>(null);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBibleBooks();
  }, []);

  const loadBibleBooks = async () => {
    try {
      const db = await openKougoDB();

      // Get all books with their chapter counts
      const result = db.getAllSync(`
        SELECT 
          b.id,
          b.name,
          COUNT(DISTINCT v.chapter) as totalChapters
        FROM JapKougo_books b
        LEFT JOIN JapKougo_verses v ON b.id = v.book_id
        GROUP BY b.id, b.name
        ORDER BY b.id ASC
      `);

      const bibleBooks = result.map((row: any) => {
        const bookMapping = bookNameMap[row.name];
        return {
          id: row.id,
          name: row.name,
          japName: bookMapping?.name || row.name,
          totalChapters: row.totalChapters || 0,
          testament: row.id <= 39 ? ("old" as const) : ("new" as const),
          category: bookMapping?.category || "その他",
        };
      });

      setBooks(bibleBooks);
    } catch (error) {
      console.error("Error loading bible books:", error);
      setError("聖書の書を読み込めませんでした");
    } finally {
      setLoading(false);
    }
  };

  const toggleBook = (bookId: number) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

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

  const filteredBooks = useMemo(() => {
    let filtered = books.filter((book) => book.testament === selectedTestament);

    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.japName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [books, searchQuery, selectedTestament]);

  const renderChapterButtons = (book: BibleBook) => {
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

  const BookCard = ({ book }: { book: BibleBook }) => {
    const isExpanded = expandedBook === book.id;

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
          onPress={loadBibleBooks}
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
