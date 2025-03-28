
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: './.env'
})  


const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(PORT , () =>  {
        console.log(`Server is running at port : ${PORT}`);
    })
    
}).catch((err) => {
    console.log("Mongo DB connection faild !!", err);
});








/*

// this first approch for connect to database 
// this approch is not good for profecinal works

import express from "express"
const app = express()

(async ()=> {
    try  {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("ERROR", (error)=>{
            console.log("ERROR :",error);
            throw error
       })

       app.listen(process.env.PORT, () =>{
        console.log(`App is listening on port ${process.env.PORT}` );
       })
    }
    catch (error){
        console.error("ERROR : "  , error)
        throw error
    }
})()

*/