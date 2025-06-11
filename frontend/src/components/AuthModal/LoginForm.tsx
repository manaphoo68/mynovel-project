import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaLine } from 'react-icons/fa';

const LoginForm: React.FC<{ onLoginSuccess: (user: any) => void }> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    // ดึงรหัสผู้แนะนำที่เก็บไว้
    const referralCode = localStorage.getItem('referralCode');
    
    // สร้าง URL พื้นฐาน
    let url = `http://localhost:3000/api/auth/${provider}`;

    // ถ้ามีรหัสผู้แนะนำ ให้แนบไปด้วย
    if (referralCode) {
      url += `?ref=${referralCode}`;
    }

    // สั่งให้เบราว์เซอร์ไปที่ URL ใหม่นี้
    window.location.href = url;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, rememberMe }),
        credentials: 'include'
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ข้อมูลเข้าระบบไม่ถูกต้อง');
      }

      onLoginSuccess(data.user);
      
      // [แก้ไขล่าสุด] เปลี่ยนเป้าหมายการ redirect ไปที่ /dashboard
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="login-identifier">อีเมล หรือ ชื่อผู้ใช้</label>
          <input type="text" id="login-identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="กรอกอีเมล หรือ ชื่อผู้ใช้" required />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">รหัสผ่าน</label>
          <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="กรอกรหัสผ่านของคุณ" required />
        </div>
        <div className="form-options">
          <div className="remember-me">
              <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <label htmlFor="remember-me">จดจำฉันไว้</label>
          </div>
          <Link to="/forgot-password">ลืมรหัสผ่าน?</Link>
        </div>
        <button type="submit" className="submit-button">เข้าสู่ระบบ</button>
        <div className="social-login-divider"><span>หรือเข้าสู่ระบบด้วย</span></div>
        <div className="social-login-buttons">
          <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')}>
            <FaGoogle />
            <span>Google</span>
          </button>
          <button type="button" className="social-btn facebook" onClick={() => handleSocialLogin('facebook')}>
            <FaFacebook />
            <span>Facebook</span>
          </button>
          <button type="button" className="social-btn line" onClick={() => handleSocialLogin('line')}>
            <FaLine />
            <span>LINE</span>
          </button>
        </div>
    </form>
  );
};

export default LoginForm;