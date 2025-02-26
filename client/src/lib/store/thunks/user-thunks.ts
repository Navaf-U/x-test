import axios from "axios";
import Cookies from "js-cookie";
import axiosInstance from "@/utils/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";



const Instance = axios.create({
    baseURL: "http://localhost:3008/api",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // Fetch All users
  export const fetchAllUsers = createAsyncThunk(
    "user/fetchAllUsers",
    async () => {
      const response = await Instance.get(`api/user/fetchAllUsers`);
      return response.data?.data;
    }
  );
  
  // Fetch user data
  export const fetchUserData = createAsyncThunk(
    "user/fetchUserData",
    async (userName: string) => {
      const {data} = await Instance.get(`/user/user/${userName}`);
      return data?.user;
    }
  );
  
  // Update user profile
  export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {  name, bio, location, web, pfp, header }: any,
      { rejectWithValue }
    ) => {
      try {
        const currentUser = Cookies.get("user");
        const user = JSON.parse(currentUser || "{}");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("bio", bio);
        formData.append("location", location);
        formData.append("web", web);
  
        if (pfp) {
          formData.append("pfp", pfp);
        }
  
        if (header) {
          formData.append("header", header);
        }
  
        const response = await axiosInstance.post(`api/user/update/profile`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true,
        });
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return rejectWithValue(error.response.data);
      }
    }
  );
  
  export const fetchFollowersOrFollowing = createAsyncThunk(
    "user/fetchFollowersOrFollowing",
    async ({
      userName,
      followStatus,
    }: {
      userName: string;
      followStatus: string;
    }) => {
      const response = await Instance.get(
        `/user/${userName}?status=${followStatus}`
      );
  
      return {
        data:
          followStatus === "followers"
            ? response.data.data.followers
            : response.data.data.following,
      };
    }
  );
  //chnag eto two seperate followers and following
  
  export const toggleFollow = createAsyncThunk(
    "user/toggleFollow",
    async ({
      userId: id,
      followedUserId,
    }: {
      userId: string;
      followedUserId: string;
    }) => {
      const response = await axiosInstance.post(`api/user/follow/${id}`, {
        userId: followedUserId,
      });
  
      return response.data?.data;
    }
  );