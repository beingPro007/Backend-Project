import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserChannelProfile } from "./user.controller.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;
    const channelId = req.query.channel;

    if(!userId){
        throw new ApiError(404,"User id is must required !")
    }

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $group: {
                totalViews:{
                    $sum: "$views"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        },
    ]);

    const totalLikes = await Like.aggregate([
        {
            $match: {
                video: {exists: true, $ne: ""}
            }
        },
        {
            $lookup: {
                from:"videos",
                localField: "video",
                foriegnField: "_id",
                as: "likedVideos"
            },
        },
        {
            $unwind: {$path: "$likedVideos"},
        },
        {
            $match: {
                "likedVideos.owner" : new mongoose.ObjectId(userId)
            },
        },
        {
            $group: {
                _id: null,
                totalLikes: {$sum: 1},
            },
        },
    ])

    const totalCommentLikes = await Like.aggregate([
        {
            $match: {
                comment: {$exists: true, $ne: ""}
            },
        },
        {
            $lookup: {
                from: "comments",
                localField:"comment",
                foriegnField: "_id",
                as: "commentsLikes"
            },
        },
        {
            $unwind: {path: "commentsLikes"},
        },
        {
            $match: {
                "commentsLikes.owner": new mongoose.Types.ObjectId(userId) 
            }
        },
        {
            $group: {
                id: null,
                totalCommentLikes: {
                    $sum: 1,
                }
            }
        }
    ])

    const totalSubsOfAChannel = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                id: null,
                totalSubs: {
                    $sum : 1,
                }
            }
        }
    ])

    const channelStats = {
        totalView: videoStats.length > 0 ? videoStats[0].totalViews : 0,
        totalVideos: videoStats.length > 0 ? videoStats[0].totalVideos : 0,
        totalLikes: totalLikes.length > 0 ? totalLikes[0].totalLikes : 0,
        totalCommentLikes: totalCommentLikes.length > 0 ? totalCommentLikes[0].totalCommentLikes : 0,
        totalSubscription: totalSubsOfAChannel.length >0 ? totalCommentLikes[0].totalSubs : 0
    }

    return res.status(200)
    .json(new ApiResponse(200, channelStats, "Channel Fetched Succesfully ! Enjoy"))
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;

    const videos = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "channel",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likesCount",
                },
            },
            {
                $unwind: {
                    path: "$channel",
                },
            },
            {
                $project: {
                    videoFile: 1,
                    thumbnail: 1,
                    owner: 1,
                    title: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    description: 1,
                    channel: "$channel.username",
                    channelAvatar: "$channel.avatar",
                    channelFullName: "$channel.fullName",
                    isPublic: 1,
                    likesCount: {
                        $cond: {
                            if: { $isArray: "$likesCount" },
                            then: { $size: "$likesCount" },
                            else: 0,
                        },
                    },
                },
            },
        ]
    )

    return res.status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Succesfully !"))
});

export { getChannelStats, getChannelVideos };
