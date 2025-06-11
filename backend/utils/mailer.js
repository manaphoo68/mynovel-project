// backend/utils/mailer.js
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();

// ตั้งค่าการเชื่อมต่อกับ SendGrid
const options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}
const transporter = nodemailer.createTransport(sgTransport(options));

// ฟังก์ชันสำหรับส่งอีเมลยืนยัน
const sendVerificationEmail = async (userEmail, token) => {
  const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

  const mailOptions = {
    from: 'Novel-Base <manaphoo68@gmail.com>', // ใช้อีเมลจากโดเมนที่คุณยืนยันกับ SendGrid
    to: userEmail,
    subject: 'ยืนยันอีเมลของคุณสำหรับ Novel-Base',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>ยินดีต้อนรับสู่ Novel-Base!</h2>
        <p>กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          ยืนยันอีเมล
        </a>
        <p style="margin-top: 20px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        <p>หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยต่ออีเมลนี้</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = { sendVerificationEmail };