import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string)
        console.log("Database connection established");
    } catch (error) {
        console.error("Database connection error",error);
    }
}