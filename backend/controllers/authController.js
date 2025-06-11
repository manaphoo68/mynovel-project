// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../database');
const crypto = require('crypto');
const passport = require('passport');

// สมมติว่าไฟล์ mailer.js อยู่ใน utils
// const { sendVerificationEmail } = require('../utils/mailer'); 

exports.register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, referralCode } = req.body;
        const profileImageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
        }
        
        const userExists = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว' });
        }

        let referrerId = null;
        if (referralCode) {
            const referrerResult = await pool.query("SELECT user_id FROM users WHERE affiliate_code = $1", [referralCode]);
            if (referrerResult.rows.length > 0) {
                referrerId = referrerResult.rows[0].user_id;
            }
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1 ชั่วโมง

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserResult = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, profile_image_url, referred_by, email_verification_token, token_expires_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING user_id, username, email`,
            [username, email, password_hash, firstName, lastName, profileImageUrl, referrerId, verificationToken, tokenExpires]
        );
        const newUser = newUserResult.rows[0];
        
        // await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี', user: newUser });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/register:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).json({ message: info.message }); }

        req.logIn(user, (err) => {
            if (err) { return next(err); }

            if (req.body.rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.expires = false;
            }
            
            const { password_hash, ...userData } = user;
            return res.status(200).json({ message: 'ล็อกอินสำเร็จ!', user: userData });
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(err => { 
            if (err) { return res.status(500).json({ message: 'ไม่สามารถออกจากระบบได้' }); } 
            res.clearCookie('connect.sid'); 
            res.status(200).json({ message: 'ออกจากระบบสำเร็จ' }); 
        });
    });
};

exports.getCurrentUser = (req, res) => {
    if (req.isAuthenticated()) {
        const { password_hash, ...userData } = req.user;
        res.status(200).json({ isLoggedIn: true, user: userData });
    } else {
        res.status(401).json({ isLoggedIn: false, message: 'ยังไม่ได้เข้าสู่ระบบ' });
    }
};

exports.verifyEmail = async (req, res) => {
    // ... โค้ด Verify Email เดิมของคุณ ...
};

exports.getReferrerInfo = async (req, res) => {
    // ... โค้ด getReferrerInfo เดิมของคุณ ...
};