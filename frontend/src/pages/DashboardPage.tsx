// === frontend/src/pages/DashboardPage.tsx (เวอร์ชันควบคุม Sidebar) ===
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css'; // Import CSS ใหม่

const DashboardPage = () => {
  // สร้าง State เพื่อควบคุมการพับ/ขยาย
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    // ส่ง State และฟังก์ชันไปให้ Sidebar และใช้กับ Layout หลัก
    <div className="dashboard-layout">
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};
export default DashboardPage;