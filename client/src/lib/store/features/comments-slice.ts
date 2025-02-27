import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ tweetId, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/user/tweets/comment/${tweetId}`, { content });
      return response.data.comment;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || "An error occurred while fetching tweets");
        }
        return rejectWithValue("Something went wrong");
    }
    }    
);

  export const fetchUserComments = createAsyncThunk(
    "comments/fetchUserComments",
    async (tweetId : string, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`/api/user/tweets/get-comments/${tweetId}`);
        console.log(response.data);
        return response.data.comments;

      } catch (error) {
          if (axios.isAxiosError(error)) {
              return rejectWithValue(error.response?.data?.message || "An error occurred while fetching tweets");
          }
          return rejectWithValue("Something went wrong");
      } 
      }    
  );

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/user/tweets/comment/${commentId}`);
      return { commentId, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete comment");
      }
      return rejectWithValue("Something went wrong");
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {resetComments: (state) => {
    state.comments = [];
  }
},
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter((comment: { _id: string }) => comment._id !== action.payload.commentId);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});
export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer;