import { useState, useEffect, useCallback, useRef } from "react";
import { client } from "~/lib/amplify-client";
import { useErrorHandler } from "./useErrorHandler";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import type { Schema } from "../../backend/amplify/data/resource";

type Comment = Schema["Comment"]["type"];
type UserProfile = Schema["UserProfile"]["type"];
type Like = Schema["Like"]["type"];

interface CommentWithCreator extends Omit<Comment, "creator" | "likes"> {
  creatorName: string;
  creatorProfile?: UserProfile;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  likes?: Like[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<CommentWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const currentUser = useSelector((state: RootState) => state.user);
  const handleErrorRef = useRef(handleError);

  // Keep the error handler ref up to date
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  const loadComments = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      console.log("Fetching comments for postId:", postId);

      // Fetch comments filtered by postId and status
      const commentsResult = await client.models.Comment.list({
        filter: {
          and: [{ postId: { eq: postId } }, { status: { eq: "active" } }],
        },
      });

      if (!commentsResult.data || commentsResult.data.length === 0) {
        setComments([]);
        return;
      }

      // Get unique creator IDs
      const creatorIds = [
        ...new Set(commentsResult.data.map((comment) => comment.creatorId)),
      ];
      console.log("Creator IDs:", creatorIds);

      // Fetch all creators one by one (since 'in' filter may not be supported)
      const creatorsMap = new Map<string, UserProfile>();

      await Promise.all(
        creatorIds.map(async (creatorId) => {
          try {
            const creatorResult = await client.models.UserProfile.get({
              id: creatorId,
            });
            if (creatorResult.data) {
              creatorsMap.set(creatorId, creatorResult.data);
            }
          } catch (error) {
            console.warn(`Failed to fetch creator ${creatorId}:`, error);
          }
        })
      );

      // Combine comments with creator info and like data
      const commentsWithCreators: CommentWithCreator[] = await Promise.all(
        commentsResult.data.map(async (comment) => {
          try {
            // Fetch likes for this comment
            const likesResult = await client.models.Like.list({
              filter: {
                commentId: { eq: comment.id },
              },
            });

            const likes = likesResult.data || [];
            const likesCount = likes.length;
            const isLikedByCurrentUser = currentUser?.id
              ? likes.some((like) => like.userId === currentUser.id)
              : false;

            return {
              ...comment,
              creatorName:
                creatorsMap.get(comment.creatorId)?.name || "匿名ユーザー",
              creatorProfile: creatorsMap.get(comment.creatorId),
              likesCount,
              isLikedByCurrentUser,
              likes,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch likes for comment ${comment.id}:`,
              error
            );
            return {
              ...comment,
              creatorName:
                creatorsMap.get(comment.creatorId)?.name || "匿名ユーザー",
              creatorProfile: creatorsMap.get(comment.creatorId),
              likesCount: 0,
              isLikedByCurrentUser: false,
              likes: [],
            };
          }
        })
      );

      setComments(commentsWithCreators);
    } catch (error) {
      console.error("Error loading comments:", error);
      handleErrorRef.current(error, "コメントの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(
    async (
      content: string,
      userProfileId: string,
      isPrivate: boolean = false
    ) => {
      try {
        console.log("Creating comment with creatorId:", userProfileId);

        const result = await client.models.Comment.create({
          postId,
          content,
          creatorId: userProfileId, // This should be user.id (UserProfile database ID)
          isPrivate,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any); // Use 'as any' to bypass potential type conflicts

        if (result.data) {
          console.log("Comment created successfully");
          // Refresh comments to show the new one
          await loadComments();
          return result.data;
        }
      } catch (error) {
        console.error("Error creating comment:", error);
        handleErrorRef.current(error, "コメントの投稿に失敗しました");
        throw error;
      }
    },
    [postId, loadComments]
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!currentUser?.id) {
        handleErrorRef.current(
          new Error("User not logged in"),
          "ログインが必要です"
        );
        return;
      }

      try {
        // Check if user already liked this comment
        const existingLikes = await client.models.Like.list({
          filter: {
            and: [
              { commentId: { eq: commentId } },
              { userId: { eq: currentUser.id } },
            ],
          },
        });

        if (existingLikes.data && existingLikes.data.length > 0) {
          // Unlike - delete the like
          const likeToDelete = existingLikes.data[0];
          await client.models.Like.delete({
            id: likeToDelete.id,
          });
          console.log("Comment unliked successfully");
        } else {
          // Like - create a new like
          await client.models.Like.create({
            userId: currentUser.id,
            commentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any);
          console.log("Comment liked successfully");
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        handleErrorRef.current(error, "いいねの処理に失敗しました");
      }
    },
    [currentUser?.id, loadComments]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    refetch: loadComments,
    createComment,
    toggleLike,
  };
};
