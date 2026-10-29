
import express from "express";
import emailQueue from "../queues/emailQueue.js";

const router = express.Router();

// Get all scheduled and processed emails
router.get("/", async (req, res) => {
  try {
    const jobs = await emailQueue.getJobs([
      "waiting",
      "delayed",
      "active",
      "completed",
      "failed",
    ]);

    const emails = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        to: job.data.to,
        subject: job.data.subject,
        text: job.data.text,
        scheduledAt: job.data.scheduledAt,
        status: await job.getState(),
      }))
    );

    res.json({
      success: true,
      total: emails.length,
      emails,
    });
  } catch (error) {
    console.error("Fetch emails error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch emails.",
    });
  }
});

// Schedule an email
router.post("/schedule", async (req, res) => {
  try {
    const { to, subject, text, html, scheduledAt } = req.body;

    if (!to || !subject || (!text && !html) || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide to, subject, text or html, and scheduledAt.",
      });
    }

    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(scheduledAt);

const scheduledTime = new Date(
  hasTimezone ? scheduledAt : `${scheduledAt}+05:30`
).getTime();


    if (Number.isNaN(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date and time.",
      });
    }

    if (scheduledTime <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future.",
      });
    }

    const delay = scheduledTime - Date.now();

    const job = await emailQueue.add(
      "send-email",
      {
        to,
        subject,
        text,
        html,
        scheduledAt,
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    res.status(201).json({
      success: true,
      message: "Email scheduled successfully!",
      jobId: job.id,
      scheduledAt,
    });
  } catch (error) {
    console.error("Scheduling error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to schedule email.",
    });
  }
});

export default router;
