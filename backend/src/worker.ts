import "dotenv/config";
import { connectDB } from "./config/db";
import { generationWorker } from "./workers/generationWorker";

connectDB();

console.log("Worker started, waiting for jobs...");

generationWorker.on("completed", (job) => {console.log(`Job ${job.id} completed`)});

generationWorker.on("failed", (job) => {
    console.log(`Job ${job?.id} failed`, job?.failedReason);
})