import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Comment {
  id: string;
  postId: string;
  content: string;
  creatorId: string;
  creatorName: string;
  creatorProfile?: {
    profileImagePath?: string | null;
    name?: string | null;
    id?: string;
  };
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
}

const initialState: CommentsState = {
  comments: [],
  isLoading: false,
};

export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setComments(state, action: PayloadAction<Comment[]>) {
      state.comments = action.payload;
    },
    addComment(state, action: PayloadAction<Comment>) {
      state.comments = [action.payload, ...state.comments];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    toggleCommentLike(state, action: PayloadAction<string>) {
      const comment = state.comments.find((c) => c.id === action.payload);
      if (comment) {
        comment.isLikedByCurrentUser = !comment.isLikedByCurrentUser;
        comment.likesCount += comment.isLikedByCurrentUser ? 1 : -1;
      }
    },
    clearComments(state) {
      state.comments = [];
    },
  },
});

export const {
  setComments,
  addComment,
  setLoading,
  toggleCommentLike,
  clearComments,
} = commentsSlice.actions;

export default commentsSlice.reducer;
