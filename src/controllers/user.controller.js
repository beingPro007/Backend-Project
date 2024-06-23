import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const registerUser = asyncHandler(async(req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists - chack using email or username
    //check for images, check for avatar
    //upload them to cloudinary, avatar 
    //create user object - create entry in db
    //remove password and refresh tooken field from response
    //check for user creation
    //return res

    const { fullName, email, username, password } = req.body
    console.log("email", email);

    if([fullName, email, username, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are compulsory and required");
    }
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser) {
        throw ApiError(409, "\n User with username already exists ! ")
    }
    const avatarPath = req.files ? .
})

export { registerUser }