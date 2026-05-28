const { Queue } = require("bullmq");
require("dotenv").config();

const queueName = "paper-generation";
const redisConnection = {
  host: "localhost",
  port: 6379,
};

async function checkFailedJobs() {
  try {
    console.log("Connecting to Redis...");
    const queue = new Queue(queueName, { connection: redisConnection });
    
    console.log("Retrieving failed jobs...");
    const failedJobs = await queue.getFailed();
    
    console.log(`Found ${failedJobs.length} failed jobs in the queue.\n`);
    
    // Sort by timestamp desc and show the last 3 failed reasons
    failedJobs.sort((a, b) => b.timestamp - a.timestamp);
    
    const count = Math.min(3, failedJobs.length);
    for (let i = 0; i < count; i++) {
      const job = failedJobs[i];
      console.log(`--- Failed Job #${i + 1} ---`);
      console.log(`Job ID: ${job.id}`);
      console.log(`Assignment ID: ${job.data.assignmentId}`);
      console.log(`Failed Reason: ${job.failedReason}`);
      console.log(`Stacktrace:`, job.stacktrace);
      console.log("\n");
    }
  } catch (err) {
    console.error("Queue check failed:", err);
  } finally {
    process.exit(0);
  }
}

checkFailedJobs();
