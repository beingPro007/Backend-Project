import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) return null;
        else {
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            });
            //file uploaded succesfully
            // console.log("File upoaded Succesfully to cloudinary", response.url);
            fs.unlinkSync(localFilePath)
            return response;
        }
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as tbe upload opertion got failed
        return null;
    }
};

export { uploadOnCloudinary };