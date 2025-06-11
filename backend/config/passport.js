// backend/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    // Local Strategy (สำหรับ Login ปกติ)
    passport.use(new LocalStrategy({
        usernameField: 'identifier', // บอก passport ว่า "username" ของเราคือ field ที่ชื่อ 'identifier'
        passwordField: 'password'
    }, async (identifier, password, done) => {
        try {
            const userResult = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $1", [identifier]);
            if (userResult.rows.length === 0) {
                return done(null, false, { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
            }
            const user = userResult.rows[0];
            if (!user.password_hash || user.password_hash === 'social_login') {
                return done(null, false, { message: 'กรุณาเข้าสู่ระบบผ่าน Google หรือช่องทางที่คุณสมัครไว้' });
            }
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return done(null, false, { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    // Google Strategy (เหมือนเดิม)
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        const { id, displayName, emails, photos } = profile;
        const email = emails && emails[0] ? emails[0].value : null;
        const profileImageUrl = photos && photos[0] ? photos[0].value : null;
        const firstName = profile.name ? profile.name.givenName || displayName : displayName;
        const lastName = profile.name ? profile.name.familyName || '' : '';

        if (!email) { return done(new Error("ไม่สามารถดึงอีเมลจาก Google ได้"), null); }

        try {
            let user = (await pool.query("SELECT * FROM users WHERE google_id = $1", [id])).rows[0];
            if (user) { return done(null, user); }

            let userByEmail = (await pool.query("SELECT * FROM users WHERE email = $1", [email])).rows[0];
            if (userByEmail) {
                user = (await pool.query("UPDATE users SET google_id = $1, profile_image_url = $2 WHERE email = $3 RETURNING *", [id, userByEmail.profile_image_url || profileImageUrl, email])).rows[0];
                return done(null, user);
            }

            let referrerId = null;
            if (req.session.referralCode) {
                const referrerResult = await pool.query("SELECT user_id FROM users WHERE affiliate_code = $1", [req.session.referralCode]);
                if (referrerResult.rows.length > 0) {
                    referrerId = referrerResult.rows[0].user_id;
                }
                delete req.session.referralCode;
            }

            user = (await pool.query(
                `INSERT INTO users (username, email, google_id, first_name, last_name, profile_image_url, password_hash, is_verified, referred_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [displayName, email, id, firstName, lastName, profileImageUrl, 'social_login', true, referrerId]
            )).rows[0];
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err, null);
        }
    });
};