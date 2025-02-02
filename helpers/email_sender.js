const nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, body) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      //zabi.jarral08@gmail.com
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error Sending Email:", error);
        reject(Error("Error Sending Email"));
      }
      console.log("Email Sent:", info);
      resolve("Password reset OTP sent to your email");
    });
  });
};
