import asyncHandler from "../utils/asyncHandler.js"


const registerUser = asyncHandler( async (req,res) =>{
    console.log("✅ Request received at /register",req.body)
  res.status(200).json({
        message:"ok"
    })
})

export {registerUser}