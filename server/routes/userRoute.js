import express from "express";
import tryCatch from "../utils/tryCatch.js";
import verifyToken from "../middlewares/auth.js";
import upload from "../config/multer.js";
import {
  getAllUsers,
  updateUserPfp,
  removeUserPfp,
  updateUserHeader,
  removeUserHeader,
  updateProfile,
  getSearchUsers,
} from "../controllers/user/userDetailController.js";
import { uploadToCloudinary } from "../middlewares/uploadFile.js";
import {
  createTweet,
  getAllTweets,
  likeTweet,
  getLikedTweets,
  saveTweet,
  getSavedTweets,
  repostTweet,
  deleteTweet,
  commentOnTweet,
  fetchUserComments,
  fetchFollowingUserPost,
  fetchUserTweets,
  deleteComment,
  getUserTweets,
} from "../controllers/user/tweetController.js";

import {
  getOneUser,
  userProfilePic,
} from "../controllers/user/userQueryController.js";

import {
  removeFollower,
  getFollowerList,
  getFollowingList,
  getFollowCount,
  getFollowStatus,
  followUserToggle,
} from "../controllers/user/followController.js";

const router = express.Router();1
router

  //profile
  .get("/fetchAllUsers", verifyToken, getAllUsers)
  .get("/searchUsers", getSearchUsers)
  .get("/user/:username", tryCatch(getOneUser))
  
  .post(
    "/update/pfp",
    verifyToken,
    upload.single("file"),
    uploadToCloudinary,
    tryCatch(updateUserPfp)
  )
  .delete("/remove/pfp", verifyToken, tryCatch(removeUserPfp))

  .post(
    "/update/header",
    verifyToken,
    upload.single("file"),
    uploadToCloudinary,
    tryCatch(updateUserHeader)
  )
  .delete("/remove/header", verifyToken, tryCatch(removeUserHeader))
  .post("/update/profile" ,verifyToken ,tryCatch(updateProfile))

  .get("/profile_pic/:username", tryCatch(userProfilePic))

  //tweet
  .get("/tweets", tryCatch(getAllTweets))
  .post(
    "/tweets/create",
    verifyToken,
    upload.single("file"),
    uploadToCloudinary,
    createTweet
  )

  .get("/tweets/user/:username",getUserTweets)  
  .delete("/tweets/delete/:id", verifyToken, deleteTweet)
  .post("/tweets/like/:id", verifyToken, likeTweet)
  .get("/tweets/liked", verifyToken, getLikedTweets)
  .post("/tweets/save/:id", verifyToken, saveTweet)
  .get("/tweets/saved", verifyToken, getSavedTweets)
  .post("/tweets/repost/:id", verifyToken, repostTweet)
  .post("/tweets/comment/:id", verifyToken, commentOnTweet)
  .delete("/tweets/comment/:id",verifyToken,deleteComment)
  .get("/tweets/get-comments/:id", tryCatch(fetchUserComments))
  .get("/tweets/:userId", verifyToken, tryCatch(fetchUserTweets))
  //follow
  .post("/follow/:id", verifyToken, tryCatch(followUserToggle))
  .delete("/remove/:id", verifyToken, tryCatch(removeFollower))
  .get("/followers/:id", tryCatch(getFollowerList))
  .get("/following/:id", tryCatch(getFollowingList))
  .get("/follow-count/:id",  tryCatch(getFollowCount))
  .get("/follow-status/:id", verifyToken, tryCatch(getFollowStatus))

//user
.get("/tweets/following", verifyToken, tryCatch(fetchFollowingUserPost));

export default router;
