

/*
    What is mongoose-aggregate-paginate-v2?
mongoose-aggregate-paginate-v2 is a Mongoose plugin that helps with pagination when using MongoDB aggregation queries.

📌 Key Features:
✅ Allows you to paginate aggregation query results.
✅ Supports sorting, filtering, and projections easily.
✅ Reduces manual work when handling large datasets.

Why Use mongoose-aggregate-paginate-v2?
When dealing with large datasets, fetching all records at once can be slow and inefficient. Pagination helps by:

Loading data in smaller chunks (e.g., 10 or 20 records at a time).

Reducing server load and improving performance.

Enhancing user experience in UI (e.g., "Next Page" buttons).

--------------------------

What is Pagination?
Pagination is the process of dividing large amounts of data into smaller, manageable parts (pages) instead of retrieving everything at once.

📌 Example:

Instead of loading 10,000 videos at once, load 10 videos per page.

The user can click "Next" to view more videos.

This improves performance and user experience.

Why Use Pagination?
✅ Improves Performance – Fetching a few records is faster than fetching all.
✅ Better User Experience – Users can browse page by page instead of waiting for everything to load.
✅ Saves Server Resources – Reduces memory and database load.

*/

import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,     // we used cloudinary URL
            required: [true, "video is required to upload"],
        },
        thumbnail: {

            // The thumbnail field in your Mongoose schema is used to store the URL of a video thumbnail (preview image).
            // means if we click for watching a video thare have defauild images is call thumbnail

            type: String,     // we used cloudinary URL
            required: [true, "Thumbnail is required to upload"],
        },
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,    //  / we used cloudinary URL to time of the video   ( cloudinary autoaticcaly gives time of duration )
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },  
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)