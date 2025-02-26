"use client";
import React, { useEffect } from "react";
import Tweet from "@/components/home/tweets/tweet";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import { fetchAllTweets} from "@/lib/store/features/tweet-slice";
import { CircularProgress } from "@mui/material";
import { setActiveTab } from "@/lib/store/features/tweet-slice";

const TweetList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tweets, activeTab, status, error } = useAppSelector(
    (state) => state.tweets
  );

  useEffect(() => {
    const storedStatus = localStorage.getItem("status");
    const initialTab = storedStatus ? JSON.parse(storedStatus) : "forYou";
    dispatch(setActiveTab(initialTab));
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "forYou") {
      const fetchTweets = () => dispatch(fetchAllTweets());
      const interval = setInterval(fetchTweets, 10000);
  
      fetchTweets();
      return () => clearInterval(interval);
    }
  }, [activeTab, dispatch]);
  

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (status === "failed") {
    return <div className="text-red-500">{error || "Failed to load tweets."}</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      {tweets?.length > 0 ? (
        [...tweets].reverse().map((tweet, index) => <Tweet key={index} {...tweet} />)
      ) : (
        <div className="text-center p-4 text-gray-400">
          {activeTab === "forYou" ? "No tweets available" : "No following tweets yet"}
        </div>
      )}
    </div>

  );
};

export default TweetList;
