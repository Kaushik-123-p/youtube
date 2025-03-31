import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.moduls.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadCloudinary} from "../utils/cloudinary.js"

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




export { registerUser };
