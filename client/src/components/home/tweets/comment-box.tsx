"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaComment } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import {
  createComment,
  deleteComment,
  fetchUserComments,
  resetComments
} from "@/lib/store/features/comments-slice";
import Image from "next/image";
import { socket } from "@/lib/socket";
import { TweetData } from "@/utils/types/types";

type CommentProps = {
  tweet: TweetData | null;
  loggedUser: {
    pfp: string;
  };
};


const CommentBox: React.FC<CommentProps> = ({ tweet }) => {
  const [commentText, setCommentText] = useState<string>("");
  const { user } = useAppSelector((state) => state?.auth);
  const { loading, error, comments } = useAppSelector(
    (state) => state.comments
  ) as {
    loading: boolean;
    error: string | null;
    comments: Array<{
      _id: string;
      user: { pfp: string; userName: string; _id: string };
      content: string;
    }>;
  };
  const dispatch = useAppDispatch();
  const tweetID = tweet?._id; 
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open && tweetID) {
      dispatch(resetComments());
      dispatch(fetchUserComments(tweetID));
    }
  };
  

  const handleSubmit = () => {
    if (commentText.trim() === "") {
      toast.info("Comment cannot be empty");
      return;
    }

    dispatch(
      createComment({ tweetId: tweet?._id as string, content: commentText })
    )
      .unwrap()
      .then(() => {
        socket.emit("comment", { tweetId: tweet?._id, userId: user?._id });
        toast.success("Comment submitted successfully");
        setCommentText("");
        dispatch(fetchUserComments(tweetID));
      })
      .catch((err) => {
        toast.error(err.message || "Failed to submit comment");
      });
  };

  

  const handleDeleteComment = (commentId: string) => {
    console.log("Deleting comment with ID:", commentId);

    dispatch(deleteComment(commentId))
      .unwrap()
      .then((res: { message: string }) => {
        socket.emit("deleteComment", { commentId });
        toast.success(res.message);
      })
      .catch((err) => {
        toast.error(err || "Failed to delete comment");
      });

      if(tweetID){
        dispatch(fetchUserComments(tweetID));
      }
  };


  // useEffect(()=>{
  //     dispatch(resetComments());
  //     dispatch(fetchUserComments(tweetID));
  // },[])

  return (
    <Dialog onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="hover:bg-black p-2">
          <FaComment className="text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[600px] bg-black border-none rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            Post your reply
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          {tweet?.user?.pfp && (
            <Image
              src={tweet?.user?.pfp}
              alt="profile"
              height={50}
              width={50}
              className=" object-cover rounded-full"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {tweet?.user?.userName}
              </span>
            </div>
            <div className="text-gray-300 mt-2">{tweet?.text}</div>
          </div>
        </div>

        <div className="border-b border-gray-700 my-4"></div>

        <div className="flex items-start gap-3">
          {user?.pfp && (
            <Image
              src={user.pfp}
              alt="profile"
              height={40}
              width={40}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <Input
              placeholder="Post your reply"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-transparent text-gray-300 placeholder-gray-500 border border-gray-700 rounded-xl p-2"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmit}
            disabled={commentText.trim() === "" || loading}
            className={`px-4 py-2 rounded-full font-bold ${
              commentText.trim() === "" || loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-400"
            }`}
          >
            {loading ? "Posting..." : "Reply"}
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto mt-6 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="flex items-center  gap-3 p-4 bg-gray-900 rounded-xl"
            >
              {comment.user.pfp ? (
                <Image
                  src={comment.user.pfp}
                  alt="profile"
                  height={70}
                  width={70}
                  className="w-12 h-12 object-cover rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {comment.user.userName}
                  </span>
                  {comment.user._id === user?._id && (
                    <Button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <div className="text-gray-300 mt-1">{comment.content}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentBox;
