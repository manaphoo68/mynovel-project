// backend/server.js

// โหลดตัวแปรจาก .env มาใช้งานเป็นอันดับแรก
require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./database');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const multer = require('multer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const { sendVerificationEmail } = require('./utils/mailer');

const app = express();
const port = process.env.PORT || 3000;

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session Setup ---
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// --- Passport.js Middleware ---
app.use(passport.initialize());
app.use(passport.session());

// --- Passport.js Google Strategy Configuration ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    proxy: true,
    passReqToCallback: true // [สำคัญ] ต้องเปิด option นี้เพื่อให้เข้าถึง req ใน callback ได้
},
async (req, accessToken, refreshToken, profile, done) => { // [สำคัญ] เพิ่ม req เข้ามาเป็นพารามิเตอร์แรก
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const profileImageUrl = photos[0].value;
    const firstName = profile.name.givenName || displayName;
    const lastName = profile.name.familyName || '';

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE google_id = $1", [id]);
        if (userResult.rows.length > 0) {
            return done(null, userResult.rows[0]);
        } else {
            const existingUserByEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            if(existingUserByEmail.rows.length > 0) {
                 const updatedUser = await pool.query(
                       "UPDATE users SET google_id = $1, profile_image_url = $2 WHERE email = $3 RETURNING *",
                       [id, existingUserByEmail.rows[0].profile_image_url || profileImageUrl, email]
                 );
                return done(null, updatedUser.rows[0]);
            } else {
                // [เพิ่มส่วนนี้] ตรวจสอบหา ID ของผู้แนะนำจาก session
                let referrerId = null;
                if (req.session.referralCode) {
                    const referrerResult = await pool.query("SELECT user_id FROM users WHERE affiliate_code = $1", [req.session.referralCode]);
                    if (referrerResult.rows.length > 0) {
                        referrerId = referrerResult.rows[0].user_id;
                    }
                    // เคลียร์ session ทิ้งหลังจากใช้งานแล้ว
                    delete req.session.referralCode;
                }

                const newUser = await pool.query(
                    // [แก้ไข] เพิ่ม referred_by เข้าไปใน INSERT
                    `INSERT INTO users (username, email, google_id, first_name, last_name, profile_image_url, password_hash, is_verified, referred_by) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                    [displayName, email, id, firstName, lastName, profileImageUrl, 'social_login', true, referrerId]
                );
                return done(null, newUser.rows[0]);
            }
        }
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

// --- API Routes ---

app.post('/api/register', upload.single('profileImage'), async (req, res) => {
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
        
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({ 
            message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี', 
            user: newUser 
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/register:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password, rememberMe } = req.body;
        if (!identifier || !password) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }); }

        const userResult = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $1", [identifier]);
        if (userResult.rows.length === 0) { return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }); }

        const user = userResult.rows[0];

        if (!user.password_hash || user.password_hash === 'social_login') {
            return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบผ่าน Google หรือช่องทางที่คุณสมัครไว้' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) { return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }); }

        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
            req.session.cookie.expires = false;
        }
        
        req.login(user, (err) => {
            if (err) {
                console.error('Passport login error:', err);
                return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้าง session' });
            }
            const { password_hash, ...userData } = user;
            return res.status(200).json({ message: 'ล็อกอินสำเร็จ!', user: userData });
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

app.get('/api/me', (req, res) => {
    if (req.isAuthenticated()) {
        const { password_hash, ...userData } = req.user;
        res.status(200).json({ isLoggedIn: true, user: userData });
    } else {
        res.status(401).json({ isLoggedIn: false, message: 'ยังไม่ได้เข้าสู่ระบบ' });
    }
});

app.post('/api/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(err => {
            if (err) { return res.status(500).json({ message: 'ไม่สามารถออกจากระบบได้' }); }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
        });
    });
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'ไม่พบ Token' });
    }

    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email_verification_token = $1 AND token_expires_at > NOW()",
            [token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' });
        }

        const user = userResult.rows[0];

        await pool.query(
            "UPDATE users SET is_verified = true, email_verification_token = NULL, token_expires_at = NULL WHERE user_id = $1",
            [user.user_id]
        );

        if (user.referred_by) {
            console.log(`User ${user.user_id} was referred by ${user.referred_by}. Giving bonus!`);
            await pool.query(
                "UPDATE users SET balance_affiliate_earnings = balance_affiliate_earnings + 5.00 WHERE user_id = $1",
                [user.referred_by]
            );
        }

        res.status(200).json({ message: 'ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

// --- Google OAuth Routes ---
// [แก้ไข] Route ที่ 1: รับ ref code มาเก็บใน session ก่อน redirect
app.get('/api/auth/google', (req, res, next) => {
    const { ref } = req.query;
    if (ref) {
        req.session.referralCode = ref; // เก็บรหัสผู้แนะนำใน session
    }
    // เรียกใช้ passport.authenticate เพื่อเริ่มกระบวนการ
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Route ที่ 2: Callback URL
app.get('/api/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: 'http://localhost:5173/dashboard',
        failureRedirect: 'http://localhost:5173/login'
    })
);


// --- Leaderboard & Other API Routes ---
app.get('/api/referrer-info/:affCode', async (req, res) => {
    try {
        const { affCode } = req.params;
        const result = await pool.query("SELECT username FROM users WHERE affiliate_code = $1", [affCode]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'ไม่พบรหัสผู้แนะนำนี้' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/leaderboard/top-referrers', async (req, res) => {
    const { period } = req.query;
    const interval = period === 'weekly' ? 'week' : 'month';
    const query = `
        SELECT 
            u.user_id, u.username, u.profile_image_url, COUNT(r.user_id) AS referral_count
        FROM users u
        JOIN users r ON u.user_id = r.referred_by
        WHERE r.created_at >= date_trunc($1, CURRENT_DATE) AND r.referred_by IS NOT NULL
        GROUP BY u.user_id
        ORDER BY referral_count DESC
        LIMIT 10;
    `;
    try {
        const { rows } = await pool.query(query, [interval]);
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching top referrers (${interval}):`, error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Novel & Dashboard Routes ---
app.post('/api/novels', async (req, res) => {
    if (!req.isAuthenticated()) { 
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนสร้างนิยาย' });
    }
    try {
        const { title, description } = req.body;
        const author_id = req.user.user_id; 
        if (!title) {
            return res.status(400).json({ message: 'กรุณาใส่ชื่อเรื่อง' });
        }
        const newNovel = await pool.query(
            "INSERT INTO novels (title, description, author_id) VALUES ($1, $2, $3) RETURNING *",
            [title, description, author_id]
        );
        res.status(201).json({
            message: 'สร้างนิยายสำเร็จ!',
            novel: newNovel.rows[0]
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/novels:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

app.get('/api/novels/my-works', async (req, res) => {
    if (!req.isAuthenticated()) { 
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }
    try {
        const author_id = req.user.user_id; 
        const userNovels = await pool.query(
            `SELECT 
                novel_id, title, description, status, 
                view_count, chapter_count, cover_image_url,
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as last_updated 
             FROM novels 
             WHERE author_id = $1 
             ORDER BY updated_at DESC`,
            [author_id]
        );
        res.status(200).json(userNovels.rows);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/novels/my-works:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

app.get('/api/dashboard/overview', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }
    try {
        const userId = req.user.user_id;
        const userEarnings = await pool.query("SELECT balance_writer_earnings, balance_affiliate_earnings FROM users WHERE user_id = $1", [userId]);
        const novelStats = await pool.query(`SELECT COALESCE(SUM(view_count), 0)::int AS total_views, COUNT(novel_id)::int AS total_novels FROM novels WHERE author_id = $1`,[userId]);
        const recentWorks = await pool.query("SELECT novel_id, title, cover_image_url FROM novels WHERE author_id = $1 ORDER BY updated_at DESC LIMIT 5", [userId]);
        const overviewData = {
            writerEarnings: userEarnings.rows[0]?.balance_writer_earnings || '0.00',
            affiliateEarnings: userEarnings.rows[0]?.balance_affiliate_earnings || '0.00',
            totalViews: novelStats.rows[0]?.total_views || 0,
            totalNovels: novelStats.rows[0]?.total_novels || 0,
            totalComments: 0, // Placeholder
            totalFollowers: 0, // Placeholder
            recentWorks: recentWorks.rows
        };
        res.status(200).json(overviewData);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/dashboard/overview:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`API Server is running on http://localhost:${port}`);
});