import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser= asyncHandler(async(req,res)=>{
    // return res.status(200).json({
    //     message: "ok"
    // })
// -----------------------------------------
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, userName, password}= req.body;
    if([fullName,email,userName,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser= User.findOne({
        $or: [{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with this username or email already exists")
    }
    const avatarfilelocalpath= req.files?.avatar[0]?.path
    const coverImagefilelocalpath= req.files?.coverImage[0]?.path

    if(!avatarfilelocalpath){
        throw new ApiError(400, "Avatar File is required")
    }
    const avatar= await uploadOnCloudinary(avatarfilelocalpath)
    const coverImage= await uploadOnCloudinary(coverImagefilelocalpath)
    if(!avatar){
        throw new ApiError(404,"Avatar file is required")
    }
    
    const user= await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    const usercreated= User.findById(user._id).select("-password -refreshToken")
    if(!usercreated){
        throw new ApiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(200,usercreated,"User registered successfully")
    )
})

export {registerUser};