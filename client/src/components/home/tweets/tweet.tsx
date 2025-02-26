"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaRetweet,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import Link from "next/link";
import {
  fetchAllTweets,
  likeTweet as likedPost,
  saveTweet as savedPost,
} from "../../../lib/store/features/tweet-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import CommentBox from "./comment-box";
import {socket} from "@/lib/socket"; 
import { format } from "date-fns";
import { Comment, UserDetails } from "@/utils/types/types";
import {fetchUserComments} from "@/lib/store/features/comments-slice";
export interface TweetProps {
  _id?: string;
  user?: UserDetails;
  text?: string;
  media?: string[];
  comments?: Comment[];
  likes?: { _id: string; userName: string; pfp?: string }[];
  reposts?: { _id: string; userName: string; pfp?: string }[];
  saved?: { _id: string; userName: string; pfp?: string }[]; 
  createdAt?: string;
}

export type LoggedUser = {
  id?: string | undefined;
  pfp: string;
};

export const getTimeAgo = (time: string) => {
  const messageDate = new Date(time);
  const currentDate = new Date();

  const diffInMilliseconds = currentDate.getTime() - messageDate.getTime();
  const diffInMinutes = diffInMilliseconds / (1000 * 60);
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  if (diffInMinutes < 1) {
    return "Now";
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minute${
      Math.floor(diffInMinutes) > 1 ? "s" : ""
    }`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hour${
      Math.floor(diffInHours) > 1 ? "s" : ""
    } `;
  } else if (diffInDays < 1) {
    return "Yesterday";
  } else if (diffInDays < 2) {
    return "2 days ";
  } else {
    return format(messageDate, "dd-MM-yyyy HH:mm");
  }
};

const Tweet: React.FC<TweetProps> = ({
  _id,
  user,
  text,
  media,
  likes,
  saved,
  comments,
  reposts,
  createdAt,
}) => {
  const [liked, setLiked] = useState(false);
  const [save, setSave] = useState(false);
  const [likesCount, setLikesCount] = useState(likes?.length);
  const [repost, setRepost] = useState(reposts?.length);
  const dispatch = useAppDispatch();
  const { tweets } = useAppSelector((state) => state.tweets);
  const [loggedUser, setLoginedUser] = useState<LoggedUser>();
  const [commentCount, setCommentCount] = useState(comments?.length);
  const currUser = useAppSelector((state) => state.auth.user);

  
  useEffect(() => {
    const isLiked = likes?.some((like) => like?._id === currUser?.id) || false;
    setLoginedUser(currUser);
    setLiked(isLiked);
  
    const isSaved = saved?.some((save) => save._id === currUser?.id) || false;
    setSave(isSaved);
  
    const handleUpdatedLikes = ({ updatedLikes, postId }: { updatedLikes: number; postId: string }) => {
      if (_id === postId) {
        setLikesCount(updatedLikes);
      }
    };
  
    const handleUpdatedComments = ({ postId, updatedComment }: { postId: string; updatedComment: number }) => {
      if (postId === _id) {
        setCommentCount(updatedComment);
      }
    };
  
    socket.on("updatedLikes", handleUpdatedLikes);
    socket.on("updatedComments", handleUpdatedComments);
  
    return () => {
      socket.off("updatedLikes", handleUpdatedLikes);
      socket.off("updatedComments", handleUpdatedComments);
    };
  }, [_id, likes, saved, currUser]);
  




  const handleLike = async (postId: string) => {
    try {
      setLiked((prev) => !prev);
      setLikesCount((prevCount = 0) => (liked ? prevCount - 1 : prevCount + 1));  
        const response = await dispatch(likedPost(postId)).unwrap();
      if (response) {
        socket.emit("likes", { postId, userId: currUser?.id });
      }
    } catch (error) {
      console.error("Error liking post:", error);
        setLiked((prev) => !prev);
      setLikesCount((prevCount = 0) => (liked ? prevCount + 1 : prevCount - 1));
    }
  };
  

  const handleRepost = () => {
    setRepost(repost && repost + 1);
  };

  const handleSave = async (postId: string) => {
    await dispatch(savedPost(postId));
    setSave(!save);
  };

  const handleComment = (tweet: string) => {
    dispatch(fetchUserComments(tweets?._id));
  };

  useEffect(() => {
    if (_id && !tweets) {
      dispatch(fetchAllTweets(tweets?._id));
    }
  }, [_id, tweets, dispatch]);

  useEffect(() => {
    if (_id) {
      dispatch(fetchUserComments());
    }
  }, [_id, dispatch]);

  return (
    <div className="bg-black text-white border-b border-gray-700 p-4 flex space-x-4">
      <Link href={`/${user?.userName}`}>
        {user?.pfp ? (
          <Image
            src={user?.pfp}
            alt={`${user?.userName}'s profile`}
            className="w-12 h-12 rounded-full"
            width={48}
            height={48}
          />
        ) : (
          <div className="w-12 h-12 text-white bg-green-700 text-2xl flex justify-center items-center rounded-full">
            {user?.name && user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/${user?.userName}`}
              className="font-bold hover:underline"
            >
              {user?.name}
            </Link>
            <Link href={`/${user?.userName}`} className="text-gray-500 pl-2">
              @{user?.userName}
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            {createdAt && getTimeAgo(createdAt)}
          </p>
        </div>
        <Link href={`/${user?.userName}/status/${_id}`}>
          <p className="mt-2 text-sm">{text}</p>
          {media && (
            <div
              className={`mt-4 max-w-full ${
                media.length > 1 ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : ""
              }`}
            >
              {media.map((m, i) => (
                <div key={i} className={`${media.length > 1 ? "" : "w-full"}`}>
                  <Image
                    src={m || ""}
                    alt="Media"
                    unoptimized
                    width={media.length > 1 ? 200 : 500}
                    height={media.length > 1 ? 200 : 300}
                    className={`rounded-lg ${
                      media.length > 1
                        ? " object-cover  w-full"
                        : "h-auto w-full"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </Link>

        <div className="flex justify-around mt-4 text-gray-400">
          <div className="flex justify-center items-center">
            <div onClick={() => handleComment(_id || "")}>
              <CommentBox
                tweet={tweets?.find(tweet => tweet._id === _id) || null}
                loggedUser={loggedUser || { pfp: "" }}
              />
            </div>
            <span>{commentCount}</span>
          </div>
          <button
            onClick={handleRepost}
            className="flex items-center space-x-1 hover:text-green-500"
            //repost
          >
            <FaRetweet />
            <span>{repost}</span>
          </button>
          <button
            onClick={() => handleLike(_id || "")}
            className="flex items-center space-x-1 hover:text-red-500"
          >
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => handleSave(_id || "")}
            className="flex items-center space-x-1 hover:text-yellow-500"
          >
            {save ? (
              <FaBookmark className="text-yellow-500" />
            ) : (
              <FaRegBookmark />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tweet;
