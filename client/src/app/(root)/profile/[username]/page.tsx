"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { fetchUserData } from "@/lib/store/thunks/user-thunks";
import { useAppDispatch } from "@/lib/store/hook";
import EditProfileModal from "../../../../components/profile/editProfile";
import SearchSection from "@/components/home/search-section/search-section";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Image from "next/image";
import {
  fetchUserTweets,
  likeTweet,
  retweetTweet,
  saveTweet,
} from "@/lib/store/features/tweet-slice";
import { socket } from "@/lib/socket";
import { fetchUserComments } from "@/lib/store/features/comments-slice";
import {
  FaBookmark,
  FaComment,
  FaHeart,
  FaRegBookmark,
  FaRegHeart,
  FaRetweet,
} from "react-icons/fa6";

const getParams = (pathname: string) => {
  const parts = pathname.split("/");
  return { userName: parts[parts.length - 1] };
};

const ProfilePage = () => {
  const pathname = usePathname();
  const { userName } = getParams(pathname);
  const dispatch = useAppDispatch();
  const [userProfile, setUserProfile] = useState<{
    username: string;
    fullname: string;
    bio: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>({});
  const [commentsCount, setCommentsCount] = useState<{ [key: string]: number }>(
    {}
  );
  const [retweeted, setRetweeted] = useState<{ [key: string]: boolean }>({});
  const [saved, setSaved] = useState<{ [key: string]: boolean }>({});
  const userTweets = useSelector((state: RootState) => state.tweets.userTweets);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleLike = async (postId: string) => {
    try {
      setLiked((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setLikesCount((prevCounts) => ({
        ...prevCounts,
        [postId]: liked[postId]
          ? prevCounts[postId] - 1
          : prevCounts[postId] + 1,
      }));

      const response = await dispatch(likeTweet(postId)).unwrap();
      if (response) {
        socket.emit("likes", { postId, userId: currentUser?.id });
      }
    } catch (error) {
      console.error("Error liking post:", error);

      setLiked((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setLikesCount((prevCounts) => ({
        ...prevCounts,
        [postId]: liked[postId]
          ? prevCounts[postId] + 1
          : prevCounts[postId] - 1,
      }));
    }
  };

  useEffect(() => {
    const likedTweets = userTweets.reduce((acc, tweet) => {
      acc[tweet._id] =
        tweet.likes?.some((like) => like._id === currentUser?.id) || false;
      return acc;
    }, {} as { [key: string]: boolean });
    setLiked(likedTweets);
  }, [userTweets, currentUser]);

  useEffect(() => {
    if (userTweets.length > 0 && currentUser) {
      const likesMap: Record<string, boolean> = {};
      const likesCountMap: Record<string, number> = {};

      userTweets.forEach((tweet) => {
        likesMap[tweet._id] = !!tweet.likes?.some(
          (like) => like._id === currentUser.id
        );
        likesCountMap[tweet._id] = tweet.likes?.length || 0;
      });

      setLiked(likesMap);
      setLikesCount(likesCountMap);
    }
  }, [userTweets, currentUser]);

  const handleRetweet = async (postId: string) => {
    try {
      setRetweeted((prev) => ({ ...prev, [postId]: !prev[postId] }));
      const response = await dispatch(retweetTweet(postId)).unwrap();

      if (response.message === "Tweet un-reposted") {
        setRetweeted((prev) => ({ ...prev, [postId]: false }));
      } else {
        setRetweeted((prev) => ({ ...prev, [postId]: true }));
      }

      socket.emit("retweets", { postId, userId: currentUser?.id });
    } catch (error) {
      console.error("Error retweeting post:", error);
      setRetweeted((prev) => ({ ...prev, [postId]: !prev[postId] }));
    }
  };

  const handleComment = (tweetId: string) => {
    dispatch(fetchUserComments(tweetId));
  };

  useEffect(() => {
    const retweetedTweets = userTweets.reduce((acc, tweet) => {
      acc[tweet._id] = tweet.reposts?.includes(currentUser?.id) || false;
      return acc;
    }, {} as { [key: string]: boolean });

    setRetweeted(retweetedTweets);
  }, [userTweets, currentUser]);

  const handleSave = async (postId: string) => {
    try {
      setSaved((prev) => ({ ...prev, [postId]: !prev[postId] }));
      await dispatch(saveTweet(postId)).unwrap();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        await dispatch(fetchUserTweets(userName)).unwrap();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchTweets();
  }, [dispatch, userName]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await dispatch(fetchUserData(userName)).unwrap();
        setUserProfile(user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, [dispatch, userName]);

  if (!userProfile) {
    return <div className="text-center text-white">Loading profile...</div>;
  }

  const isCurrentUser = currentUser?.username === userName;

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto">
        <ProfileHeader user={userProfile} />
        <div className="p-6 pb-2 mt-16">
          <div>
            <h2 className="text-xl font-bold">{userProfile.fullname}</h2>
            <p className="text-gray-300">@{userProfile.username}</p>
            {/* <h2 className="text-xl font-bold">About</h2>
            <p className="text-gray-300">{userProfile?.bio}</p> */}
          </div>
          {isCurrentUser ? (
            <div className="w-full flex justify-end mt-[-40px]">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end mt-[-40px]">
              <button className="bg-white flex justify-center items-center px-4 py-2 rounded-full hover:bg-gray-200 text-black">
                <p className="font-bold">Follow</p>
              </button>
            </div>
          )}
        </div>
        <div className="p-6 flex gap-6">
          <p>0 follwoing</p>
          <p>0 followers</p>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold">Posts</h2>
          {userTweets.length > 0 ? (
            userTweets.map((tweet) => (
              <div key={tweet._id} className="p-4 border-b border-gray-800">
                <p>{tweet.text}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(tweet.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {Array.isArray(tweet.media) && tweet.media.length > 0 ? (
                  <Image
                    src={tweet.media[0]}
                    alt="Tweet Image"
                    width={200}
                    height={200}
                  />
                ) : null}
                <div className="flex gap-4 ps-4 mt-1">
                  <button
                    onClick={() => handleLike(tweet._id || "")}
                    className="flex items-center space-x-1 hover:text-red-500"
                  >
                    {liked[tweet._id] ? (
                      <FaHeart size={20} className="text-red-500" />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                    <span>{likesCount[tweet._id || ""]}</span>
                  </button>
                  <button onClick={() => handleRetweet(tweet._id)}>
                    {retweeted[tweet._id] ? (
                      <FaRetweet size={20} className="text-green-500" />
                    ) : (
                      <FaRetweet size={20} />
                    )}
                  </button>
                  <button onClick={() => handleSave(tweet._id)}>
                    {saved[tweet._id] ? (
                      <FaBookmark size={20} className="text-yellow-500" />
                    ) : (
                      <FaRegBookmark size={20} />
                    )}
                  </button>
                  <button onClick={() => handleComment(tweet._id)}>
                    <FaComment size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>
      <div className="w-[350px] hidden lg:block">
        <SearchSection />
      </div>
      {isEditing && (
        <EditProfileModal
          user={userProfile}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
