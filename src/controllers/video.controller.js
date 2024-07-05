import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const {username, email} = req.params;

    const pipeline = await User.aggregate([
        {
            $match: {
                username: username.toLowercase(),
                email: email.toLowercase(),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "userId",
                as: "videos",
            },
        },
        {
            $unwind: "videos"
        },
        {
            $match: {
                ...(query ? {"videos.title": {$regex: query, $options: "i"}} : {}),
                ...(userId ? {"video.userId": userId} : {})
            },
        },
        {
            $sort: {[`videos.${sortBy}`] : sortType === "asc" ? 1 : -1 },
        },
        {
            $skip : (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        }
    ]);

    if(!pipeline || pipeline.length == 0){
        throw new ApiError("Videos not found !");
    }

    res.status(200)
    .json(new ApiResponse(200, pipeline, "Videos found succesfully ! "))

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,username, thumbnail } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if(
        [title, description].some((fields) => {fields?.trim() == ""})
    ){
        throw new ApiError(404,"Title and Description not found");
    }

    let thumbnailLocalPath;
    if(
        req.files && 
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail.length > 0
    ){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    const uploadingThumnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!uploadingThumnail){
        throw new ApiError(404,"Thumbnail uploading failed !");
    }

    const videoLocalPath = req.files?.video[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(404,"Video Local Path not found ! ")
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

    if (!uploadedVideo) {
        throw new ApiError(404, "Video Local Path not found ! ");
    }

    const videoOnServer = await Video.create(
        {
            videoFile: uploadedVideo?.url,
            thumbnail: thumbnail?.url || "Thumbnail url not found! kindly do this again",
            description,
            published,
            time: uploadedVideo?.duration,
            username
        }
    )

    const servedVideo = User.findById(videoOnServer.userId).select(
        "-password -refreshToken"
    );
    
    res.status(200)
    .json(new ApiResponse(200, servedVideo, "Video Uploaded successfully !"))

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400, "videoId is not entered !");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Something went wrong whie fetching the video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched succesfully !"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Invalid video id entered");
    }
    //TODO: update video details like title, description, thumbnail

    const { title, description, thumbnail } = req.body;

    if (
        [thumbnail, description, title].some((fields) => {
            fields?.trim == "";
        })
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        (() => {
            const updateFields = {};
            if (title) updateFields.title = title;
            if (description) updateFields.description = description;
            if (thumbnail) updateFields.thumbnail = thumbnail;
            return updateFields;
        })(),
        { new: true, runValidators: true }
    );

    if(!updatedVideo){
        throw new ApiError(400, "Something went wrong while updating values!")
    }

    return res.status(200).json(200, updatedVideo, "Video Updated Successfully !");
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "Invalid video id entered");
    }

    const deletedVideo = await Video.findOneAndDelete(videoId);

    if(!deleteVideo){
        throw new ApiError(404, "Video not found 1");
    }

    return res.status(200).json(200, [], "Video with your providedid deleted succesfully!");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Invalid video id entered");
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(404, " Video with videoid you entered is not valiid!")
    }

    video.isPublished = !video.isPublished;

    return res.status(200)
    .json(new ApiResponse(200, video.isPublished, "Video Toggeled Succesfully !"))
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
