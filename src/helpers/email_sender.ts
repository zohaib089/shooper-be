import nodemailer from "nodemailer";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (
  email: string,
  subject: string,
  body: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      //zabi.jarral08@gmail.com
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions: MailOptions = {
      from: process.env.EMAIL as string,
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
      if (error) {
        console.error("Error Sending Email:", error);
        reject(Error("Error Sending Email"));
      }
      console.log("Email Sent:", info);
      resolve("Password reset OTP sent to your email");
    });
  });
};
