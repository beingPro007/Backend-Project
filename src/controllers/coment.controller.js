import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const parsePage = parseInt(page)
    const parseLimit = parseInt(limit)

    if(isNaN(parsePage) || isNaN(parseLimit)){
        throw new ApiError(404,"Please Enter the page and limit per page !")
    }
    if(!videoId){
        throw new ApiError(400, "Video ID is missing !")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video not found !")
    }

    const comments = await Comment.find({videoId})
    .skip((parsePage - 1) * parseLimit)
    .limit(parseLimit)
    .sort({createdAt: -1 })
    .exec();

    return res.status(200)
    .json(new ApiResponse(200, Comment, "Comments Fetched Succesfully"));

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.query;
    const {userId, content} = req.body;

    if ([videoId && userId].some((fields) => fields?.trim() === "")) {
        throw new ApiError(
            404,
            "Video And UserId is must required to add a content"
        );
    }

    if(!content || content.trim().length == 0){
        throw new ApiError(404, "Comment must have some data in it !");
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(404, "Invalid User ID format , Enter the correct one !")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
        createdAt: Date.now()
    })
    
    if(!comment){
        throw new ApiError(404, "Comment not able to find!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, `Comment added Succesfully at ${Date.now()}`));

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { videoId } = req.query;
    const { updatedcomment, userId } = req.body;

    if ([videoId && userId].some((fields) => fields?.trim() === "")) {
        throw new ApiError(
            404,
            "Video And UserId is must required to update a comment"
        );
    }

    if (!updatedcomment || updatedcomment.trim().length == 0) {
        throw new ApiError(404, "Comment must have some data in it !");
    }

    const foundComment = await Comment.findOneAndUpdate(
        {
            $and: [{ video: videoId }, { owner: userId }],
        },
        {
            content: updatedcomment,
        },
        {
            new: true, // Return the updated document
            runValidators: true, // Run validation on the update
        }
    );

    if(!foundComment){
        throw new ApiError(404, "Comment is not able to found and cant be updated!")
    }

    return res.status(200)
    .json(new ApiResponse(200, foundComment, "Comment Updated succesfully !"))
    
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId);

    if (!deleteComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
