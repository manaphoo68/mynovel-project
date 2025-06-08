// === ไฟล์ backend/server.js (เวอร์ชันล่าสุด) ===

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./database'); 
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions'
    }),
    secret: 'a_very_secret_key_that_should_be_changed',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 
    }
}));
    
// --- API Routes ---

// API สมัครสมาชิก
app.post('/api/register', async (req, res) => { 
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }); }
        const userExists = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userExists.rows.length > 0) { return res.status(409).json({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว' }); }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await pool.query("INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email", [username, email, password_hash] );
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!', user: newUser.rows[0] });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/register:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

// API ล็อกอิน
app.post('/api/login', async (req, res) => { 
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }); }
        const userResult = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $1", [identifier]);
        if (userResult.rows.length === 0) { return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }); }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) { return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }); }
        req.session.userId = user.user_id;
        req.session.username = user.username;
        res.status(200).json({ message: 'ล็อกอินสำเร็จ!', user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดที่ /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
    }
});

// API ตรวจสอบสถานะ
app.get('/api/me', (req, res) => { 
    if (req.session.userId) { res.status(200).json({ isLoggedIn: true, user: { user_id: req.session.userId, username: req.session.username } }); } else { res.status(401).json({ isLoggedIn: false, message: 'ยังไม่ได้เข้าสู่ระบบ' }); }
});

// API ออกจากระบบ
app.post('/api/logout', (req, res) => { 
    req.session.destroy(err => { if (err) { return res.status(500).json({ message: 'ไม่สามารถออกจากระบบได้' }); } res.clearCookie('connect.sid'); res.status(200).json({ message: 'ออกจากระบบสำเร็จ' }); });
});

// API สร้างนิยายเรื่องใหม่
app.post('/api/novels', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนสร้างนิยาย' });
    }
    try {
        const { title, description } = req.body;
        const author_id = req.session.userId;
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

// === API ใหม่: ดึงข้อมูลนิยายทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ ===
app.get('/api/novels/my-works', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }
    try {
        const author_id = req.session.userId;
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


// Start Server
app.listen(port, () => {
  console.log(`API Server is running on http://localhost:${port}`);
});