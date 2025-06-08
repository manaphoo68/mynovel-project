// === ไฟล์ database.js (เวอร์ชันใหม่) ===

const { Pool } = require('pg');

// ตั้งค่าการเชื่อมต่อเหมือนเดิม
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'novel_project_db',
  password: '053433571', // <-- ใส่รหัสผ่านจริงของคุณ
  port: 5432,
});

// ส่งออก (export) ตัวแปร pool นี้ออกไปเพื่อให้ไฟล์อื่นสามารถเรียกใช้ได้
module.exports = pool;