import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

type Props = {
  currentUser: any | null;
};

const ProtectedRoute: React.FC<Props> = ({ currentUser }) => {
  if (!currentUser) {
    // ถ้าไม่มี user ที่ล็อกอินอยู่ ให้เด้งกลับไปหน้า login
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี user ล็อกอินอยู่ ให้แสดงผลหน้าที่อยู่ข้างใน (ผ่าน Outlet)
  return <Outlet />;
};

export default ProtectedRoute;