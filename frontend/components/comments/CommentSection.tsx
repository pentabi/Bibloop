import {
  ArrowDownWideNarrow,
  Filter,
  Heart,
  RefreshCcw,
} from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useComments } from "~/hooks/useComments";
import { ProfileAvatar } from "~/components/ProfileAvatar";
import { useImagePreloader } from "~/hooks/useImagePreloader";
import { useFriendship } from "~/hooks/useFriendship";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";

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
  const [filter, setFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const { comments, isLoading } = useSelector(
    (state: RootState) => state.comments
  );

  // Create a unique postId for this Bible chapter
  const postId = `${bookName}-${chapter}`;

  // Use the new custom hook
  const { refetch, toggleLike } = useComments(postId);

  // Add image preloader
  const { preloadImages, getPreloadedImage } = useImagePreloader();

  // Get friends list
  const { getFriendIds } = useFriendship();

  // Preload profile images when comments load
  useEffect(() => {
    if (comments.length > 0) {
      // Extract all profile image paths from comments
      const imagePaths = comments
        .map((comment) => comment.creatorProfile?.profileImagePath)
        .filter(Boolean) as string[];

      if (imagePaths.length > 0) {
        console.log("Preloading profile images:", imagePaths.length);
        preloadImages(imagePaths);
      }
    }
  }, [comments]);

  const currentUser = useSelector((state: RootState) => state.user);

  // Fetch friends on mount
  useEffect(() => {
    const fetchFriends = async () => {
      const friendIds = await getFriendIds();
      // Extract friend IDs (the other user in the friendship)
      const friendIdsIncludingMe = [...friendIds, currentUser.id ?? ""];
      setFriendIds(friendIdsIncludingMe);
    };
    fetchFriends();
  }, [currentUser.id]);

  // Filter comments based on selected filter
  const filteredComments = useMemo(() => {
    if (filter === "friend") {
      return comments.filter((comment) =>
        friendIds.includes(comment.creatorId)
      );
    }
    return comments;
  }, [comments, filter, friendIds]);

  return (
    <View className="flex-1 bg-white">
      {/* Overlay to detect touches outside dropdown */}
      {(showSortMenu || showFilterMenu) && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => {
            setShowSortMenu(false);
            setShowFilterMenu(false);
          }}
          activeOpacity={1}
        />
      )}

      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 relative z-50">
        <View className="flex-row items-center justify-between ">
          <View className="flex-row  gap-4">
            <TouchableOpacity
              className="py-2 pl-2 flex-row items-center"
              onPress={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
            >
              <ArrowDownWideNarrow size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2 flex-row items-center"
              onPress={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
            >
              <Filter size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-lg text-center flex-1 font-semibold text-gray-800 ">
            {bookName} {chapter}章のコメント
          </Text>
          <View className="flex-row gap-2 items-center justify-center ">
            <TouchableOpacity
              onPress={() => {
                refetch();
              }}
            >
              <RefreshCcw size={20} color={"#666"} />
            </TouchableOpacity>
            <Text className="text-sm text-gray-500">{comments.length}件</Text>
          </View>
        </View>

        {/* Sort Menu */}
        {showSortMenu && (
          <View className="absolute top-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            <TouchableOpacity
              className={`px-4 py-3 border-b border-gray-100 ${
                sort === "recent" ? "bg-gray-200" : ""
              }`}
              onPress={() => {
                setSort("recent");
                setShowSortMenu(false);
              }}
            >
              <Text
                className={`text-sm ${
                  sort === "recent"
                    ? "text-gray-900 font-medium"
                    : "text-gray-700"
                }`}
              >
                最新順
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-3 ${sort === "likes" ? "bg-gray-200" : ""}`}
              onPress={() => {
                setSort("likes");
                setShowSortMenu(false);
              }}
            >
              <Text
                className={`text-sm ${
                  sort === "likes"
                    ? "text-gray-900 font-medium"
                    : "text-gray-700"
                }`}
              >
                いいね順
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Filter Menu */}
        {showFilterMenu && (
          <View className="absolute top-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            <TouchableOpacity
              className={`px-4 py-3 border-b border-gray-100 ${
                filter === "all" ? "bg-gray-200" : ""
              }`}
              onPress={() => {
                setFilter("all");
                setShowFilterMenu(false);
              }}
            >
              <Text
                className={`text-sm ${
                  filter === "all"
                    ? "text-gray-900 font-medium"
                    : "text-gray-700"
                }`}
              >
                全て
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-3 ${
                filter === "friend" ? "bg-gray-200" : ""
              }`}
              onPress={() => {
                setFilter("friend");
                setShowFilterMenu(false);
              }}
            >
              <Text
                className={`text-sm ${
                  filter === "friend"
                    ? "text-gray-900 font-medium"
                    : "text-gray-700"
                }`}
              >
                フレンド
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Comments List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">読み込み中...</Text>
          </View>
        ) : filteredComments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-center mb-4">
              この章にはまだコメントがありません{"\n"}
              最初のコメントを投稿してみましょう！
            </Text>
            <TouchableOpacity
              onPress={refetch}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              <Text className="text-blue-600">更新</Text>
            </TouchableOpacity>
          </View>
        ) : (
          [...filteredComments]
            .sort((a, b) => {
              if (sort === "likes") {
                // Sort by like count (highest first)
                return b.likesCount - a.likesCount;
              }
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
            .map((comment, index: number) => (
              <View key={comment.id}>
                {/* Main Comment */}
                <View className="py-4 border-b border-gray-100">
                  {/* User Info */}
                  <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "/(main)/(socials)/community-profile",
                          params: { id: comment.creatorId },
                        });
                      }}
                      className="mr-3"
                    >
                      <ProfileAvatar
                        size={32}
                        userName={comment.creatorName}
                        userId={comment.creatorId}
                        profileImagePath={
                          comment.creatorProfile?.profileImagePath || undefined
                        }
                        preloadedImageUrl={getPreloadedImage(
                          comment.creatorProfile?.profileImagePath || ""
                        )}
                      />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row gap-2 items-center">
                      <Text className="text-sm font-medium text-gray-800">
                        {comment.creatorName}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Comment Content with Like Button */}
                  <View className="flex-row items-start ml-11">
                    <Text className="flex-1 text-gray-700 leading-5 text-lg pr-2">
                      {comment.content}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleLike(comment.id)}
                      className="flex-row items-center px-2 py-1"
                    >
                      {comment.likesCount > 0 && (
                        <Text
                          className={`text-xs mr-1 ${
                            comment.isLikedByCurrentUser
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {comment.likesCount}
                        </Text>
                      )}
                      <Heart
                        size={16}
                        color={
                          comment.isLikedByCurrentUser ? "#ef4444" : "#9ca3af"
                        }
                        fill={comment.isLikedByCurrentUser ? "#ef4444" : "none"}
                      />
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
