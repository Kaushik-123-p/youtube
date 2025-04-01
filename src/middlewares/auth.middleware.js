import asyncHandler from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError"
import jwt from "jsonwebtoken"
import {User} from "../models/user.moduls"



export const verifyJWT = asyncHandler (async (req,_,next) => {      // we cannnot used res that's why we can write (_) undescored , production level we can see many many like this 
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!token){
      throw new ApiError(401, "Unauthorized request !")
    }
  
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
  const user = await User.findById(decodedToken?._id).select("-password _refreshToken")
  
  if(!user){
      throw new ApiError(401, "Invalid Access Token")
  }
  
  req.user = user
  next()
  } catch (error) {
    throw new ApiError(401, error?.messge || "Invalid Access Token !" )
  }
})