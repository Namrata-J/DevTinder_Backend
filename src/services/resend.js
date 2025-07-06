const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "TechTribe <no-reply@thetechtribe.in>",
      to,
      subject,
      html,
    });

    console.log("Resend Email Sent:", data);
    return data;
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
};

const sendOtpEmail = ({ to, otp }) => {
  const otpEmailRes = sendEmail(
    to,
    "Your OTP code",
    `<p>Your OTP code is: <strong>${otp}</strong></p>`
  );

  return otpEmailRes;
};

module.exports = { sendOtpEmail };