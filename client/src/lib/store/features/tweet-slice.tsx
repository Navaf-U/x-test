import axiosInstance from '@/utils/axios';
import { TweetData } from '@/utils/types/types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchAllTweets = createAsyncThunk('tweets/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/user/tweets`);
        return response.data.tweets;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue(error);
        }
    }
});

export const fetchUserTweets = createAsyncThunk('tweets/fetchUserTweets', async (username: string, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/tweets/user/${username}`);
        return response.data.tweets;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue(error);
        }
    }
});

export const createTweet = createAsyncThunk('tweets/create', async (tweetData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/user/tweets/create`, tweetData);
        return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
    } else {
        return rejectWithValue(error);
    }
    }
});

export const deleteTweet = createAsyncThunk<string, string>('2tweets/delete', async (tweetId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/api/user/tweets/delete/${tweetId}`);
        return tweetId;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
    } else {
        return rejectWithValue(error);
    }
    }
});

export const likeTweet = createAsyncThunk('tweets/like', async (tweetId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/user/tweets/like/${tweetId}`);
        return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
    } else {
        return rejectWithValue(error);
    }    }
});

export const saveTweet = createAsyncThunk('tweets/save', async (tweetId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/user/tweets/save/${tweetId}`);
        return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
    } else {
        return rejectWithValue(error);
    }    }
});

export const getSavedTweets = createAsyncThunk('tweets/getSaved', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/user/tweets/saved`);
        return response.data.tweets;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue(error);
        }
    }
});

const tweetSlice = createSlice({
    name: 'tweets',
    initialState: {
        tweets: [] as TweetData[],
        savedTweets: [] as TweetData[],
        userTweets: [] as TweetData[],
        activeTab: "forYou", 
        status: 'idle',
        error: null as string | null,
    },
    reducers: {
      setActiveTab: (state, action: PayloadAction<string>) => {
        state.activeTab = action.payload;
    }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllTweets.fulfilled, (state, action) => {
                state.tweets = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchAllTweets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = typeof action.payload === 'string' 
                ? action.payload 
                : (action.payload as { message?: string })?.message || "Something went wrong!";
            })
            .addCase(fetchAllTweets.fulfilled, (state, action) => {
                state.tweets = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchUserTweets.fulfilled, (state, action) => {
                state.userTweets = action.payload;
            })
            .addCase(createTweet.fulfilled, (state, action: PayloadAction<TweetData>) => {
                state.tweets.unshift(action.payload);
            })
            .addCase(deleteTweet.fulfilled, (state, action) => {
                state.tweets = state.tweets.filter(tweet => tweet._id !== action.payload);
            })
            .addCase(likeTweet.fulfilled, (state, action) => {
                const index = state.tweets.findIndex(tweet => tweet._id === action.payload._id);
                if (index !== -1) state.tweets[index] = action.payload;
            })
            .addCase(saveTweet.fulfilled, (state, action) => {
                const index = state.tweets.findIndex(tweet => tweet._id === action.payload._id);
                if (index !== -1) state.tweets[index] = action.payload;
            })
            .addCase(getSavedTweets.fulfilled, (state, action) => {
                state.savedTweets = action.payload;
            })
    }
});
export const { setActiveTab } = tweetSlice.actions;
export default tweetSlice.reducer;


