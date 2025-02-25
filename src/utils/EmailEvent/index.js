import { EventEmitter } from "events";
import sedEmailByNodeMailer from "../../services/sendEmail.js";
import { emailTemplate } from "../../services/emailTemplate.js";
import { customAlphabet } from "nanoid";
import { userModel } from "../../DB/models/index.js";
import { Hash } from "../Encryption/hash.js";
export const emailEvent = new EventEmitter();

emailEvent.on("sendEmailConfirm", async (data) => {
  let { firstName, email } = data;
  const otp = customAlphabet('0123456789', 4)();
  const hashOtp = await Hash({ key: otp, SALT_ROUND: process.env.SALT_ROUND })
  const expiresIn = new Date();
  expiresIn.setMinutes(expiresIn.getMinutes() + 10);
  await userModel.updateOne(
    { email },
    {
      $push: {
        OTP: { code: hashOtp, type: "confirmEmail", expiresIn },
      },
    }
  );
  const emailSent = await sedEmailByNodeMailer(
    "Confirm Email",
    emailTemplate(
      "Confirm Email",
      firstName,
      `<p>Thank you for joining <strong>Job Search App</strong>! Use the code below to verify your email address:</p>
      <div class="otp-box">${otp}</div>
      <p>If you didn’t request this, please ignore this email or contact support if you have questions.</p>
      <p>Best,<br>The Job Search App Team</p>`
    ),
    email
  );

  if (!emailSent) {
    console.error("Error sending email to:", email);
  }
});




emailEvent.on("sendEmailForgetPassword", async (data) => {
  let { firstName, email } = data;
  const otp = customAlphabet('0123456789', 4)();
  const hashOtp = await Hash({ key: otp, SALT_ROUND: process.env.SALT_ROUND })
  const expiresIn = new Date();
  expiresIn.setMinutes(expiresIn.getMinutes() + 10);
  await userModel.updateOne(
    { email },
    {
      $push: {
        OTP: { code: hashOtp, type: "forgetPassword", expiresIn },
      },
    }
  );
  const emailSent = await sedEmailByNodeMailer(
    "Forget Password Email",
    emailTemplate("Forget Password", firstName,
      `
         <p>We received a request to reset the password for your account. Use the code below to reset your password:</p>
         <div class="otp-box">${otp}</div>
         <p>If you didn’t request this, please ignore this email or contact support if you have any concerns.</p>
         <p>Best regards,<br>The Job Search App Team</p>`
    ),
    email
  );
  if (!emailSent) {
    console.error("Error sending email to:", email);
  }
});






emailEvent.on("sendEmailApplicationStatus", async (data) => {
  const { applicantName, email, jobTitle, status } = data;

  const subject = status === "accepted" ? "Application Accepted 🎉" : "Application Rejected";
  const message =
    status === "accepted"
      ? `<p>Dear ${applicantName},</p>
             <p>Congratulations! Your application for <strong>${jobTitle}</strong> has been accepted.</p>
             <p>Our HR team will contact you with further details.</p>
             <p>Best regards,<br>The Job Search App Team</p>`
      : `<p>Dear ${applicantName},</p>
             <p>We regret to inform you that your application for <strong>${jobTitle}</strong> has been rejected.</p>
             <p>We appreciate your interest and encourage you to apply for other openings.</p>
             <p>Best regards,<br>The Job Search App Team</p>`;

  const emailSent = await sedEmailByNodeMailer(
    subject,
    emailTemplate(subject, applicantName, message),
    email
  );

  if (!emailSent) {
    console.error("Error sending application status email to:", email);
  }
});