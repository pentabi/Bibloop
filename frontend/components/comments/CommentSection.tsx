import { ArrowDownWideNarrow } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { mockComments } from "~/lib/CommentData";
import { useRouter } from "expo-router";
import { useState } from "react";

const CommentSection = ({
  bookName,
  chapter,
}: {
  bookName: string;
  chapter: number;
}) => {
  const router = useRouter();
  const [sort, setSort] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);

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
            {bookName}
            {chapter}のコメント
          </Text>
          <Text className="text-sm text-gray-500">{mockComments.length}件</Text>
        </View>

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
        {mockComments
          .sort((a, b) => {
            if (sort === "likes") {
              return b.likes - a.likes; // Sort by likes descending
            }
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ); // Sort by date descending
          })
          .map((comment, index) => (
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
                      {comment.author.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-1 flex-row gap-2 items-center">
                    <Text className="text-sm font-medium text-gray-800">
                      {comment.author}
                    </Text>
                    <Text className="text-xs text-gray-500">2時間前</Text>
                  </View>
                </View>

                {/* Comment Content */}
                <Text className="text-gray-700 leading-5 ml-11 text-lg">
                  {comment.content}
                </Text>

                {/* Actions */}
                <View className="flex-row items-center mt-3 ml-11">
                  <TouchableOpacity className="flex-row items-center mr-6">
                    <Text className="text-xs text-gray-500">
                      いいね {comment.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-xs text-gray-500">返信</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reply Comments */}
              {comment.replies && comment.replies.length > 0 && (
                <View className="ml-8  border-gray-100">
                  {comment.replies.map((reply, replyIndex) => (
                    <View
                      key={`${comment.id}-reply-${replyIndex}`}
                      className="py-3 pl-4"
                    >
                      {/* Reply User Info */}
                      <View className="flex-row items-center mb-2">
                        <TouchableOpacity className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2">
                          <Text className="text-white text-xs font-semibold">
                            {reply.author.charAt(0).toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                        <View className="flex-1 flex-row gap-2 items-center">
                          <Text className="text-xs font-medium text-gray-800">
                            {reply.author}
                          </Text>
                          <Text className="text-xs text-gray-500">1時間前</Text>
                        </View>
                      </View>

                      {/* Reply Content */}
                      <Text className="text-lg text-gray-700 leading-5 ml-8 ">
                        {reply.content}
                      </Text>

                      {/* Reply Actions */}
                      <View className="flex-row items-center mt-2 ml-8">
                        <TouchableOpacity className="flex-row items-center mr-4">
                          <Text className="text-xs text-gray-500">
                            いいね {reply.likes}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center">
                          <Text className="text-xs text-gray-500">返信</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Show more replies if there are many */}
                  {comment.replies.length > 2 && (
                    <TouchableOpacity className="py-2 pl-4">
                      <Text className="text-xs text-blue-500">
                        他の{comment.replies.length - 2}件の返信を表示
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}

        {/* Add some bottom padding */}
        <View className="h-[250]" />
      </ScrollView>
    </View>
  );
};

export default CommentSection;
