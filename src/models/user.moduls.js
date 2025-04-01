
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{

            // we usd cloudinary URL its like a AWS services where we can upload images ,files , etc and they gives URL ( A Cloudinary URL is a link to an image or video stored on Cloudinary, a cloud-based media management service. Cloudinary allows developers to upload, store, transform, and deliver images and videos efficiently. )

            type:String,    
            required:true
        },
        coverImage:{
            type:String
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"video"
            }
        ],
        password:{
            type:String,
            required:[true, "password is required"]
        },
        refreshToken:{

            // The refreshToken field is used in JWT authentication to store a long-lived token that helps users stay logged in without requiring them to enter credentials again.

            type:String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordsCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generatedAccessToken = function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generatedRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)








/*
    bcrypt vs bcrypt.js: What’s the Difference?
Both bcrypt and bcrypt.js are libraries used for hashing passwords securely in Node.js. However, they have key differences in implementation and performance.

-----------------------------------
1️⃣ bcrypt (Native Library)
📌 bcrypt is a C++ native library that requires compilation.

Uses native bindings (written in C++) for better performance.

Requires Node.js build tools (e.g., node-gyp) to install.

Faster than bcrypt.js because it uses hardware acceleration.

May cause installation issues on some systems due to compilation dependencies.

Installation
sh
Copy
Edit
npm install bcrypt
---------------------------

2️⃣ bcrypt.js (Pure JavaScript Library)
📌 bcrypt.js is a pure JavaScript implementation.

Does not require native dependencies.

Slower than bcrypt because it runs in JavaScript, without C++ optimizations.

More portable and easier to install (no compilation issues).

Installation
sh
Copy
Edit
npm install bcryptjs


======================================================================

What is JWT (JSON Web Token)?
📌 JWT (JSON Web Token) is a secure way to authenticate users and transmit data between a client and a server.

It is commonly used for user authentication in web applications.

A JWT is self-contained, meaning it contains all the necessary information inside it.

1️⃣ Why Use JWT?
✅ Authentication – Used for login and user verification.
✅ Security – Ensures data integrity with signatures (HMAC, RSA, etc.).
✅ Stateless – No need to store sessions in a database.
✅ Fast & Scalable – Reduces server load because the token is verified locally.

2️⃣ Structure of a JWT
A JWT consists of three parts:

Header – Contains metadata about the token (e.g., algorithm, token type).

Payload – Contains user data (e.g., userId, email).

Signature – A cryptographic signature to ensure the token is not tampered with.

=============================================================================================
we can not directly encrypt the code if we want ro encrpt the code then w we used to mongoose hooks
pre
post
etc...

this hooks monstly used in model(schema)

Mongoose Hooks (Middleware)
📌 Mongoose Hooks (also called Middleware) allow you to execute logic before or after certain actions like saving, updating, deleting, or validating documents in MongoDB.

------------------------
2️⃣ Pre Hook (pre)
Runs before a document is saved, updated, or deleted.

Useful for hashing passwords, validating data, etc.

How it Works?

Before saving a user (pre("save")), this function hashes the password.

Prevents plain-text passwords from being stored.

------------------------
3️⃣ Post Hook (post)
Runs after a document is saved, updated, or deleted.

Useful for logging actions, sending notifications, etc.

✔️ How it Works?

After a user is saved, it logs a success message.

------------------------------------------------------------

Using Hooks with Different Actions
Hook Type	Example Usage
pre("save")	Hash passwords before saving.
post("save")	Log when a document is saved.
pre("remove")	Perform cleanup before deleting a user.
post("remove")	Log when a user is deleted.
pre("findOneAndUpdate")	Modify data before updating a document.
post("findOneAndUpdate")	Log changes after an update.


-------------------------------------------------------------------
when you used mngoose hooks in this can not used callback function or arrow function becouse of arrow functionncan not have this keyword reference and its can not  known about contenx

prefer to used simple function function declaration

============================================================
encryption is a complex  performamce becouse its algorithm preccessing cpu peoceessing take the time  that's     why it take a time 
 */
