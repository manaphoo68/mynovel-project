// === frontend/src/components/Sidebar.tsx (เวอร์ชันพับได้) ===
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
// Import ไอคอนมาใช้งาน
import { FaTachometerAlt, FaBook, FaUser, FaWallet, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

type Props = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
};

const Sidebar: React.FC<Props> = ({ isCollapsed, toggleCollapse }) => {
  return (
    // เพิ่ม class 'collapsed' เมื่อ isCollapsed เป็น true
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {/* ถ้าไม่พับ ให้แสดงผลเต็ม */}
        {!isCollapsed && <span>Creator Dashboard</span>}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard/overview" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaTachometerAlt /> <span>ภาพรวม</span>
        </NavLink>
        <NavLink to="/dashboard/works" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBook /> <span>ผลงาน</span>
        </NavLink>
        <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUser /> <span>ข้อมูลผู้ใช้</span>
        </NavLink>
        <NavLink to="/dashboard/earnings" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaWallet /> <span>รายได้</span>
        </NavLink>
      </nav>
      {/* ปุ่มสำหรับพับ/ขยาย */}
      <button onClick={toggleCollapse} className="collapse-btn">
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </button>
    </aside>
  );
};

export default Sidebar;