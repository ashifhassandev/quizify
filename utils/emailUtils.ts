import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { Resend } from "resend";

import transporter from "../config/emailConfig.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");

// Sends an email verification link to a new user (via nodemailer)
const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `http://localhost:3000/users/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SEND_OTP_EMAIL as string,
    to: email,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking the link below:</p>
               <a href="${verificationLink}">${verificationLink}</a>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Verification email sending failed:", error as Error);
    throw new Error("Verification email sending failed");
  }
};

// Sends a user feedback/contact form submission to the admin (via Resend)
const sendFeedback = async (name: string, email: string, message: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Quizify Contact <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL as string,
      replyTo: email,
      subject: "📬 New Feedback Submission",
      html: `<p>You have received new feedback from Quizify contact form:</p>
                 <p><strong>👤 Name:</strong> ${name}</p>
                 <p><strong>📧 Email:</strong> ${email}</p>
                 <p><strong>💬 Message:</strong></p>
                 <p>${message}</p>`,
    });

    if (error) {
      console.error("Feedback email sending failed:", error);
      throw new Error("Feedback email sending failed");
    }

    return data;
  } catch (error) {
    console.error("Feedback email sending failed:", error as Error);
    throw new Error("Feedback email sending failed");
  }
};

export { generateVerificationToken, sendVerificationEmail, sendFeedback };