import React, { useRef, useState } from "react";
import { Dimensions } from "react-native";
import { CommentButton } from "~/components/comments/CommentButton";
import BottomSheet, { BottomSheetRefProps } from "~/components/BottomSheet";
import CommentSection from "~/components/comments/CommentSection";
import { post } from "aws-amplify/api";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SheetWithCommentsProps {
  children: React.ReactNode;
  bookName: string;
  chapter: number;
}

export const SheetWithComments = ({
  children,
  bookName,
  chapter,
}: SheetWithCommentsProps) => {
  const ref = useRef<BottomSheetRefProps>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCommentsActive, setIsCommentsActive] = useState(false);

  // Create a unique postId for this Bible chapter
  const postId = `${bookName}-${chapter}`;

  const handleOpenBottomSheet = () => {
    const isActive = ref.current?.isActive();
    if (isActive) {
      ref.current?.scrollTo(0);
      setIsCommentsActive(false);
    } else {
      // Open to about 1/3 of screen height for better visibility
      ref.current?.scrollTo(-SCREEN_HEIGHT / 3);
      setIsCommentsActive(true);
    }
  };

  const handleCommentSubmitted = () => {
    // Refresh comments by updating the key
    //TODO: comment submitted
  };

  return (
    <>
      <CommentButton
        isActive={isCommentsActive}
        onPress={handleOpenBottomSheet}
      />
      {children}
      <BottomSheet
        ref={ref}
        postId={postId}
        onCommentSubmitted={handleCommentSubmitted}
      >
        <CommentSection
          bookName={bookName}
          chapter={chapter}
          key={refreshKey}
        />
      </BottomSheet>
    </>
  );
};
