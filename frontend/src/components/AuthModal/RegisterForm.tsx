// === src/components/AuthModal/RegisterForm.tsx (เวอร์ชันใหม่) ===
import React, { useState } from 'react';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. เพิ่ม State เพื่อจำว่าผู้ใช้ติ๊กยอมรับเงื่อนไขแล้วหรือยัง
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. ตรวจสอบก่อนส่งข้อมูล
    if (!agreed) {
      alert('กรุณายอมรับเงื่อนไขและข้อตกลงในการให้บริการ');
      return; // หยุดการทำงาน
    }

    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
        // อาจจะสั่งให้สลับไปหน้า login อัตโนมัติในอนาคต
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้" required style={{ padding: '10px', marginBottom: '10px' }} />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required style={{ padding: '10px', marginBottom: '10px' }} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required style={{ padding: '10px', marginBottom: '10px' }} />

      {/* 3. เพิ่มส่วนของ Checkbox และลิงก์ */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '0.9em' }}>
        <input 
          type="checkbox" 
          id="agree-terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ margin: '0 10px 0 0' }}
        />
        <label htmlFor="agree-terms">
          ข้าพเจ้ายอมรับ <a href="/terms" target="_blank" rel="noopener noreferrer">เงื่อนไขและข้อตกลง</a> ในการให้บริการ
        </label>
      </div>

      {/* 4. ทำให้ปุ่มกดไม่ได้ถ้ายังไม่ติ๊กยอมรับ */}
      <button type="submit" disabled={!agreed} style={{ padding: '10px', cursor: agreed ? 'pointer' : 'not-allowed', opacity: agreed ? 1 : 0.6 }}>
        สมัครสมาชิก
      </button>
    </form>
  );
};

export default RegisterForm;