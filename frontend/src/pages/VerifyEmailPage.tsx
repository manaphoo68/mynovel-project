import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './VerifyEmailPage.css'; // เราจะสร้างไฟล์ CSS นี้ต่อไป

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('กำลังตรวจสอบข้อมูลการยืนยัน...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('ลิงก์ยืนยันไม่ถูกต้องหรือไม่สมบูรณ์');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'เกิดข้อผิดพลาด');
        }

        setStatus('success');
        setMessage(data.message);

      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="verification-page">
      <div className="verification-card">
        {status === 'loading' && (
          <>
            <FaSpinner className="icon loading" />
            <h2>กำลังดำเนินการ...</h2>
            <p>{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle className="icon success" />
            <h2>ยืนยันสำเร็จ!</h2>
            <p>{message}</p>
            <Link to="/login" className="login-link-button">ไปที่หน้าเข้าสู่ระบบ</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="icon error" />
            <h2>เกิดข้อผิดพลาด</h2>
            <p>{message}</p>
            {/* ในอนาคตอาจจะมีปุ่มให้ส่งอีเมลยืนยันอีกครั้ง */}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;