
import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { sendEmail } from "../services/emailService.js";

console.log("Loading email worker...");

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    console.log("Processing email job:", job.id);

    const { to, subject, text, html } = job.data;

    const result = await sendEmail({
      to,
      subject,
      text,
      html,
    });

    console.log("Email processed successfully!");

    return result;
  },
  {
    connection: redisConnection,
  }
);

console.log("Email worker created!");

// Worker ready
emailWorker.on("ready", () => {
  console.log("Email worker is ready!");
});

// Job started
emailWorker.on("active", (job) => {
  console.log("Job is active:", job.id);
});

// Job completed
emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
  console.log("Email preview URL:", job.returnvalue?.previewUrl);
});

// Job failed
emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

// Job stalled
emailWorker.on("stalled", (jobId) => {
  console.log("Job stalled:", jobId);
});

// Worker error
emailWorker.on("error", (error) => {
  console.error("Worker error:", error.message);
});

export default emailWorker;
