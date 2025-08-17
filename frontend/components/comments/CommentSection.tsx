import { ArrowDownWideNarrow } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { client } from "~/lib/amplify-client";
import type { Schema } from "../../../backend/amplify/data/resource";
import { useErrorHandler } from "~/hooks/useErrorHandler";

type Comment = Schema["Comment"]["type"];

const CommentSection = ({
  bookName,
  chapter,
}: {
  bookName: string;
  chapter: number;
}) => {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [sort, setSort] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Create a unique postId for this Bible chapter
  const postId = `${bookName}-${chapter}`;

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log("Fetching comments for postId:", postId);

      // Fetch comments filtered by postId and status
      const { data: filteredComments } = await client.models.Comment.list({
        filter: {
          and: [{ postId: { eq: postId } }, { status: { eq: "active" } }],
        },
      });

      setComments(filteredComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      handleError(error, "コメントの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <View className="flex-1 bg-white">
      {/* Overlay to detect touches outside dropdown */}
      {showSortMenu && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => setShowSortMenu(false)}
          activeOpacity={1}
        />
      )}

      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 relative z-50">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="p-2 flex-row items-center"
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowDownWideNarrow size={20} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            {bookName} {chapter}章のコメント
          </Text>
          <Text className="text-sm text-gray-500">{comments.length}件</Text>
        </View>

        {/* Chapter Info */}
        <Text className="text-xs text-gray-400 mt-1">
          {comments.length === 0
            ? "この章にはまだコメントがありません"
            : `${comments.length}件のコメント`}
        </Text>

        {/* Sort Menu */}
        {showSortMenu && (
          <View className="absolute top-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            <TouchableOpacity
              className="px-4 py-3 border-b border-gray-100"
              onPress={() => {
                setSort("recent");
                setShowSortMenu(false);
              }}
            >
              <Text className="text-sm text-gray-700">最新順</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => {
                setSort("likes");
                setShowSortMenu(false);
              }}
            >
              <Text className="text-sm text-gray-700">いいね順</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Comments List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">読み込み中...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-center mb-4">
              この章にはまだコメントがありません{"\n"}
              最初のコメントを投稿してみましょう！
            </Text>
            <TouchableOpacity
              onPress={fetchComments}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              <Text className="text-blue-600">更新</Text>
            </TouchableOpacity>
          </View>
        ) : (
          comments
            .sort((a: Comment, b: Comment) => {
              if (sort === "likes") {
                // For now, sort by creation date since we don't have likes in the schema yet
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              }
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
            .map((comment: Comment, index: number) => (
              <View key={comment.id}>
                {/* Main Comment */}
                <View className="py-4 border-b border-gray-100">
                  {/* User Info */}
                  <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                      onPress={() => {
                        router.push("/communityProfile");
                      }}
                      className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3"
                    >
                      <Text className="text-white text-sm font-semibold">
                        {comment.creator?.name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </TouchableOpacity>
                    <View className="flex-1 flex-row gap-2 items-center">
                      <Text className="text-sm font-medium text-gray-800">
                        {comment.creator?.name || "匿名"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Comment Content */}
                  <Text className="text-gray-700 leading-5 ml-11 text-lg">
                    {comment.content}
                  </Text>

                  {/* Actions */}
                  <View className="flex-row items-center mt-3 ml-11">
                    <TouchableOpacity className="flex-row items-center mr-6">
                      <Text className="text-xs text-gray-500">いいね</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center">
                      <Text className="text-xs text-gray-500">返信</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
        )}

        {/* Add some bottom padding */}
        <View className="h-[250]" />
      </ScrollView>
    </View>
  );
};

export default CommentSection;
