import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken= async(userId)=>{
    try{
        const user=  await User.findById(userId)
        const accessToken=  await user.generateAccessToken()
        const refreshToken=  await user.generateRefreshToken()
        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens ")
    }

}
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

    const {fullName, email, username, password}= req.body;
    if([fullName,email,username,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with this username or email already exists")
    }
    const avatarfilelocalpath= req.files?.avatar[0]?.path
    // const coverImagefilelocalpath= req.files?.coverImage[0]?.path
    let coverImagefilelocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImagefilelocalpath= req.files.coverImage[0].path;
    }

    if(!avatarfilelocalpath){
        throw new ApiError(400, "Avatar File is required")
    }
    const avatar= await uploadOnCloudinary(avatarfilelocalpath)
    const coverImage= await uploadOnCloudinary(coverImagefilelocalpath)
    if(!avatar){
        throw new ApiError(404,"Avatar file is required")
    }
    
    const user= await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    const usercreated= await User.findById(user._id).select("-password -refreshToken")
    if(!usercreated){
        throw new ApiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(200,usercreated,"User registered successfully")
    )
})

const loginUser= asyncHandler(async(req,res)=>{
    const {username, email, password}= req.body
    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }
    const user= await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordValid=  await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }
    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
    const loggedinUser= await User.findById(user._id).select("-password -refreshToken")
    const options= {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user: loggedinUser, 
        accessToken, 
        refreshToken
    }, "User logged in successfully"))
})

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options= {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200, {},"User logged out")
    )
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingToken){
        throw new ApiError(401, "Unauthorized request ")
    }
    const decodedToken= jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)
    const user= await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }
    if(incomingToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }
    const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access Token Refreshed"))
})
export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};