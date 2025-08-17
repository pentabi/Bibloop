// Example of how to create a comment using the new hook
// This should be used in your comment input component

import { useSelector } from "react-redux";
import { useComments } from "~/hooks/useComments";
import { RootState } from "~/redux/rootReducer";

const ExampleCommentCreation = () => {
  const user = useSelector((state: RootState) => state.user);
  const { createComment } = useComments("Genesis-1"); // Example postId

  const handleSubmitComment = async (content: string) => {
    try {
      // Make sure user has a profile ID (from database, not Cognito userId)
      if (!user.id) {
        console.error(
          "User profile ID not found. User must be logged in and have a profile."
        );
        return;
      }

      await createComment(
        content,
        user.id, // This is the UserProfile database ID, not userId (Cognito ID)
        false // isPrivate
      );

      console.log("Comment created successfully!");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return null; // This is just an example
};

/* 
Key points:
1. Use user.id (UserProfile database ID) as creatorId
2. NOT user.userId (Cognito user ID)
3. This ensures proper relationship with UserProfile table
4. The hook will automatically refresh comments after creation
*/
