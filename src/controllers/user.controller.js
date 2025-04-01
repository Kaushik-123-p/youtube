import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.moduls.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadCloudinary} from "../utils/cloudinary.js"
import  jwt  from "jsonwebtoken";



const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generatedAccessToken()
    const refreshToken = user.generatedRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went to wrong while generating access and refresh token !")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  /*

  get user details from frontend
  validation - not empty
  check if user already exists : username , email
  check for image, check for avatar
  upload the to cloudinaty, avatar
  create user object - create entry in db
  remove passwod and refresh token field from response
  check fror user creation
  retun response

*/

  // if data are came to  form or json then it can get on req.body
  const { username, email, fullName, password } = req.body;

  //  console.log("username : ", username);
  //  console.log("EMAIL : ", email);
  //  console.log("fullName : ", fullName);
  //  console.log("password : ", password);

  /*

  // this condition to check is for begginer

    if(username == ""){
      throw new ApiError(400, "usernae is required")
    }
    if(email == ""){
      throw new ApiError(400, "email is required")
    }
    if(fullName == ""){
      throw new ApiError(400, "fullname is required")
    }
    if(password == ""){
      throw new ApiError(400, "password is required")
    }

*/

  // this condition to check is industri level

  if (
    [username, email, fullName, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    if(existedUser.username === username){
      throw new ApiError(409, "Username already exists!");
    }else{
      throw new ApiError(409, "Email already exists!");
    }
  }

  // console.log(req.files);

  const avatarLocalFilePath = req.files?.avatar[0]?.path;
  // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

  let coverImageLocalFilePath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalFilePath = req.files.coverImage[0].path
  } 
  
  if(!avatarLocalFilePath){
    throw new ApiError(400, "Avatar file is required! ")
  }


  // time of upload file on cloudinary
  const avatar = await uploadCloudinary(avatarLocalFilePath)
  const coverImage = await uploadCloudinary(coverImageLocalFilePath) 

  if(!avatar){
    throw new ApiError(400, "Avatar file is required ")
  }

  const user = await User.create(
    {
      username : username.toLowerCase(),
      email,
      fullName,
      password,
      avatar : avatar.url,
      coverImage : coverImage?.url || ""
    }
  )
  // console.log("User Created Successfully:", user);
  
  const createdUser = await User
                            .findById(user._id)
                            .select("-password -refreshToken")


  if(!createdUser){
    throw new ApiError(500, "Something went to Wrong While registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Register Successfully !")
  )

});


const loginUser = asyncHandler(async (req,res) => {
    /*
        1. fetch req body -> data
        2. check username or email
        3. find the user is alreadyregister
        4. check password is match 
        5. gives access and refresh token
        6. send cookie
        7. send  response for success
    */

    const {username, email, password} = req.body

    if(!username && !email){
      throw new ApiError(400, "username or email is required !")
    }

    //  above code alternative 
    // if(!(username || email)){
    //   throw new ApiError(400, "username or emai; is required!")
    // }


    const user = await User.findOne(
      {
         $or: [{username}, {email}]
      }
    )

    if(!user){
      throw new ApiError(404, "User does not exists !")
    }


   const isPasswordValid = await user.isPasswordsCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401, "invalid password !")
   }


   const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly : true,
    secure : true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
          200,
          {
            user : loggedInUser, accessToken, refreshToken
          },
          "User logged In SuccessFully."
      )
   )



})


const logoutUser = asyncHandler (async (req,res) => { 
  await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken : undefined
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : true
   }

   return res 
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
    new ApiResponse(
      200,
      {},
      "User Logged Out !"
    )
   )

})


const refreshAccessToken = asyncHandler (async (req,res) => {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unothorized request !")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
    throw new ApiError(401,"Invalid Refresh Token !")
    }
  
  
    if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "Refresh Token is Expired !")
    }
  
    const options = {
      httpOnly : true,
      secure : true 
    }
  
    const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res 
    .status(201)
    .req.cookies("accessToken", newAccessToken, options)
    .req.cookies("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
            accessToken: newAccessToken, refreshToken: newRefreshToken
        },
        "New Access Token Generated !"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token !" )
  }

})

export { 
          registerUser,
          loginUser,
          logoutUser,
          refreshAccessToken
      };
