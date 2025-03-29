import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))       // when data come the form
app.use(express.urlencoded({extended:true, limit:"16kb"}))      // when data come to the URL
app.use(express.static("public"))       // to store static data like images , svg file , documants etc..
app.use(cookieParser())     // we can access and set usrs browers coookies  throgh server 



// --------------------------------------------------------------------
// Router import
import userRouter from "./routes/user.routes.js"


// Router Declartion

// IMMPOERTANT : whenwe create server there we decalte router and we can use app.get 
                // BUT
//              when we declare router or server then we import this then we first do middleware throgh middleware we can declare router 



app.use("/api/v1/users", userRouter)


// http://localhost:8000/api/v1/users/


export {app}