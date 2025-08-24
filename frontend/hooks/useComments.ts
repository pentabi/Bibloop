import { useState, useEffect, useCallback, useRef } from "react";
import { client } from "~/lib/amplify-client";
import { useErrorHandler } from "./useErrorHandler";
import type { Schema } from "../../backend/amplify/data/resource";

type Comment = Schema["Comment"]["type"];
type UserProfile = Schema["UserProfile"]["type"];

interface CommentWithCreator extends Omit<Comment, "creator"> {
  creatorName: string;
  creatorProfile?: UserProfile;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<CommentWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
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

      // Combine comments with creator info
      const commentsWithCreators: CommentWithCreator[] =
        commentsResult.data.map((comment) => ({
          ...comment,
          creatorName:
            creatorsMap.get(comment.creatorId)?.name || "匿名ユーザー",
          creatorProfile: creatorsMap.get(comment.creatorId),
        }));

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

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    refetch: loadComments,
    createComment,
  };
};
