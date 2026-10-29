import nodemailer from "nodemailer";

let transporter;

export const createEmailTransporter = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();

    console.log("Ethereal test account created");
    console.log("Preview user:", testAccount.user);

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const emailTransporter = await createEmailTransporter();

  const info = await emailTransporter.sendMail({
    from: '"ReachInbox Scheduler" <scheduler@example.com>',
    to,
    subject,
    text,
    html,
  });

  console.log("Email sent:", info.messageId);

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log("Email preview:", previewUrl);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
};