import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { UserDetails } from "../../../utils/types/types";
import {
  saveUserToLocalStorage,
  getUserFromLocalStorage,
  clearUserFromLocalStorage,
  saveAccesstokenToLocalStorage,
} from "../../localstorage";

const Instance = axios.create({
  baseURL: "http://localhost:3008/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


export const sendOtp = createAsyncThunk<string, string>(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await Instance.get(`/auth/send_otp/${email}`);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { message: string } } }).response?.data
          ?.message || "An error occurred"
      );
    }
  }
);

export const verifyOtp = createAsyncThunk<
  string,
  { email: string; otp: string }
>("auth/verifyOtp", async (userData, { rejectWithValue }) => {
  try {
    const response = await Instance.post("/auth/verify_otp", userData);
    return response.data.message;
  } catch (error) {
    return rejectWithValue(
      (error as { response?: { data?: { message: string } } }).response?.data
        ?.message || "An error occurred"
    );
  }
});

export const verifyOtpAndRegister = createAsyncThunk<
  UserDetails,
  { name: string; userName: string; email: string; password: string }
>("auth/verifyOtpAndRegister", async (userDatas, { rejectWithValue }) => {
  try {
    const response = await Instance.post("/auth/register", userDatas);
    const userData: UserDetails = response.data.data;

    if (typeof window !== "undefined") {
      saveUserToLocalStorage(userData);
    }

    return userData;
  } catch (error) {
    return rejectWithValue(
      (error as { response?: { data?: { message: string } } }).response?.data
        ?.message || "An error occurred"
    );
  }
});

export const loginUser = createAsyncThunk<
  UserDetails,
  { email: string; password: string }
>("auth/loginUser", async (credential, { rejectWithValue }) => {
  try {
    const response = await Instance.post("/auth/login", credential);
    const userData: UserDetails = response.data.userDetail;
    const accessToken = response.data.accessToken;
    if (typeof window !== "undefined") {
      saveUserToLocalStorage(userData); 
      saveAccesstokenToLocalStorage(accessToken);
    }

    return userData;
  } catch (error) {
    return rejectWithValue(
      (error as { response?: { data?: unknown } }).response?.data ||
        "An error occurred"
    );
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await Instance.post("/auth/logout");

    if (typeof window !== "undefined") {
      clearUserFromLocalStorage(); 
    }
  } catch (error) {
    throw (
      (error as { response?: { data?: string } }).response?.data ||
      "An error occurred"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: typeof window !== "undefined" ? getUserFromLocalStorage() : null, 
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        console.log("Login successful, user:", action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(verifyOtpAndRegister.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "An error occurred";
      })
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
