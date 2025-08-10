import React, { useRef } from "react";
import { View } from "react-native";
import { CommentButton } from "~/components/CommentButton";
import BottomSheet, { BottomSheetRefProps } from "~/components/BottomSheet";
import CommentSection from "~/components/comments/CommentSection";

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

  const handleOpenBottomSheet = () => {
    const isActive = ref.current?.isActive();
    if (isActive) {
      ref.current?.scrollTo(0);
    } else {
      ref.current?.scrollTo(-200);
    }
  };

  return (
    <>
      <CommentButton onPress={handleOpenBottomSheet} />
      {children}
      <BottomSheet ref={ref}>
        <CommentSection bookName={bookName} chapter={chapter} />
      </BottomSheet>
    </>
  );
};
