import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(404, "User id not found")
    }

    try {
        let video = await Video.findById(videoId);
    
        if(!video){
            throw new ApiError(404,"Video with videoId you entered not exists !!")
        }
    
        const userId = req.user._id;
    
        if(!userId){
            throw new ApiError(404,"userId is must !!")
        }
    
        const isLiked = video.likes.includes(userId);
    
        if(isLiked){
            video.likes = video.likes.filter((id) => id !== userId);
        }else{
            video.likes.push(userId)
        }
        
        video = await video.save();
    
        return res.status(200)
        .json(new ApiResponse(200, video, "Video liked or disliked successfully !"))
    } catch (error) {
        throw new ApiError(500, error.message || "Internal Sever Error !")
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on coomment

    if(!commentId){
        throw new ApiError(404, "Comment ID not found !")
    }

    try {
        let comment = await Comment.findById(commentId);
    
        if(!comment){
            throw new ApiError("The comment with commentId you entered is not found !")
        }
    
        const userId = req.user._id;
    
        if(!userId){
            throw new ApiError(404 , "User not found");
        }
    
        const isLiked = comment.likes.includes(userId)
    
        if(isLiked){
            comment.likes = comment.likes.filter((id) => id !== userId);
        }else{
            comment.push(userId);
        }
    
        comment = comment.save();
        return res.status(200)
        .json(new ApiResponse(200, "Comment like toggles succcessfully !"))
    } catch (error) {
        throw new ApiError(505, error.message || "Internal Server Error !! ")
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(404, "Tweet ID not found !");
    }
    
    try {
        let tweet = await Comment.findById(tweetId);

        if (!tweet) {
            throw new ApiError(
                "The tweet with tweetId you entered is not found !"
            );
        }

        const userId = req.user._id;

        if (!userId) {
            throw new ApiError(404, "User not found");
        }

        const isLiked = tweet.likes.includes(userId);

        if (isLiked) {
            tweet.likes = tweet.likes.filter((id) => id !== userId);
        } else {
            tweet.push(userId);
        }

        tweet = tweet.save();
        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet like toggles succcessfully !"));
    } catch (error) {
        throw new ApiError(505, error.message || "Internal Server Error !! ");
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400,"User id is not found!")
    }

    const likedVideos = await Video.find({likes: userId})

    if(!likedVideos || likedVideos.length === 0){
        throw new ApiError(404, "Liked Videos cannot able to find!")
    }

    return res.status(200)
    .json(new ApiResponse(200, likedVideos, "All Liked videos fetched Succesfully !"))

});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
