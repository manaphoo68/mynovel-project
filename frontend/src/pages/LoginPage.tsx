import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // [แก้ไข] เพิ่ม import useSearchParams
import './LoginPage.css';
import LoginForm from '../components/AuthModal/LoginForm';
import RegisterForm from '../components/AuthModal/RegisterForm';

const LoginPage: React.FC<{ onLoginSuccess: (user: any) => void }> = ({ onLoginSuccess }) => {
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [referrerInfo, setReferrerInfo] = useState(''); // [เพิ่มใหม่] State สำหรับเก็บข้อมูลผู้แนะนำ
  const [searchParams] = useSearchParams(); // [เพิ่มใหม่] Hook สำหรับอ่าน Query Parameter

  // [เพิ่มใหม่] Logic ตรวจจับรหัสผู้แนะนำจาก URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      
      const fetchReferrerInfo = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/referrer-info/${refCode}`);
          if (response.ok) {
            const data = await response.json();
            setReferrerInfo(`คุณได้รับการแนะนำโดย: ${data.username}`);
          } else {
            // ถ้าไม่เจอ refCode ในระบบ ก็ไม่ต้องทำอะไร แต่ลบ code ที่ผิดออกจาก localstorage
            localStorage.removeItem('referralCode');
          }
        } catch (error) {
          console.error("Could not fetch referrer info", error);
        }
      };
      fetchReferrerInfo();
    }
  }, [searchParams]);

  return (
    <div className="login-card">
      <div className="auth-toggle-buttons">
        <button 
          className={`toggle-btn ${formType === 'login' ? 'active' : ''}`}
          onClick={() => setFormType('login')}
        >
          เข้าสู่ระบบ
        </button>
        <button 
          className={`toggle-btn ${formType === 'register' ? 'active' : ''}`}
          onClick={() => setFormType('register')}
        >
          สมัครสมาชิก
        </button>
      </div>

      <div className="form-header">
          <h2>{formType === 'login' ? 'ยินดีต้อนรับกลับมา!' : 'สร้างบัญชีใหม่'}</h2>
          <p>{formType === 'login' ? 'เข้าสู่ระบบเพื่ออ่านและเขียนนิยายต่อ' : 'เริ่มต้นการเดินทางของคุณกับเรา'}</p>
      </div>
      
      {/* [เพิ่มใหม่] แสดงชื่อผู้แนะนำในฟอร์มสมัครสมาชิก */}
      {formType === 'register' && referrerInfo && (
        <p className="referrer-info">{referrerInfo}</p>
      )}

      {formType === 'login' ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <RegisterForm />}

      {formType === 'login' && (
          <div className="form-footer">
              <Link to="/forgot-password">ลืมรหัสผ่าน?</Link>
          </div>
      )}
    </div>
  );
};

export default LoginPage;