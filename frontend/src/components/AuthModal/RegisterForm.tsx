import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    const submissionData = new FormData();
    submissionData.append('username', formData.username);
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    submissionData.append('firstName', formData.firstName);
    submissionData.append('lastName', formData.lastName);
    
    if (profileImage) {
      submissionData.append('profileImage', profileImage);
    }

    // [เพิ่มล่าสุด] ดึงรหัสผู้แนะนำจาก localStorage แล้วแนบไปกับข้อมูล
    const referralCode = localStorage.getItem('referralCode');
    if (referralCode) {
        submissionData.append('referralCode', referralCode);
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        body: submissionData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      setSuccess('สมัครสมาชิกสำเร็จ! คุณสามารถสลับไปหน้าเข้าสู่ระบบได้แล้ว');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="form-group">
        <label htmlFor="reg-username">ชื่อผู้ใช้</label>
        <input type="text" id="reg-username" name="username" placeholder="ตั้งชื่อที่ไม่ซ้ำใคร" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-email">อีเมล</label>
        <input type="email" id="reg-email" name="email" placeholder="กรอกอีเมลของคุณ" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-password">รหัสผ่าน</label>
        <input type="password" id="reg-password" name="password" placeholder="อย่างน้อย 6 ตัวอักษร" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-confirmPassword">ยืนยันรหัสผ่าน</label>
        <input type="password" id="reg-confirmPassword" name="confirmPassword" placeholder="กรอกรหัสผ่านอีกครั้ง" onChange={handleChange} required />
      </div>
      
      <div className="form-group terms-and-conditions">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
        />
        <label htmlFor="terms">
          ข้าพเจ้ายอมรับ <Link to="/terms-of-service" target="_blank">เงื่อนไขและข้อตกลง</Link> ในการให้บริการ
        </label>
      </div>

      <button 
        type="submit" 
        className="submit-button" 
        disabled={!agreedToTerms}
      >
        สร้างบัญชี
      </button>
    </form>
  );
};

export default RegisterForm;