import axiosInstance from '@/utils/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3008';

// Async actions
export const toggleFollow = createAsyncThunk('follow/toggleFollow', async (userId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/user/follow/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error);
    }
}); 

export const fetchFollowers = createAsyncThunk('follow/fetchFollowers', async (userId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/followers/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error);
    }
});

export const fetchFollowing = createAsyncThunk('follow/fetchFollowing', async (userId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/following/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error);
    }
});

export const fetchFollowCount = createAsyncThunk('follow/fetchFollowCount', async (userId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/follow-count/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error);
    }
});

export const fetchFollowStatus = createAsyncThunk('follow/fetchFollowStatus', async (userId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/user/follow-status/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error);
    }
});

// Slice
const followSlice = createSlice({
    name: 'follow',
    initialState: {
        followers: [],
        following: [],
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(toggleFollow.fulfilled, (state, action) => {
                state.isFollowing = action.payload.action === 'follow';
            })
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.followers = action.payload.followers;
            })
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.following = action.payload.following;
            })
            .addCase(fetchFollowCount.fulfilled, (state, action) => {
                state.followerCount = action.payload.followerCount;
                state.followingCount = action.payload.followingCount;
            })
            .addCase(fetchFollowStatus.fulfilled, (state, action) => {
                state.isFollowing = action.payload.isFollowing;
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.status = 'loading';
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state) => {
                    state.status = 'succeeded';
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.status = 'failed';
                    state.error = action.payload;
                }
            );
    },
});

export default followSlice.reducer;
