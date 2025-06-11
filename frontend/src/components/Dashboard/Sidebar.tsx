import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaTachometerAlt, FaBook, FaUserEdit, FaWallet, FaPenSquare, FaChartBar, FaUserCheck } from 'react-icons/fa';

const Sidebar: React.FC<{ currentUser: any | null }> = ({ currentUser }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img 
          src={currentUser?.profile_image_url || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=random`} 
          alt="User Avatar" 
          className="sidebar-avatar"
        />
        <span className="sidebar-username">{currentUser?.username}</span>
      </div>

      <nav className="sidebar-nav">
        <h3>เมนูทั่วไป</h3>
        <NavLink to="/dashboard" end><FaTachometerAlt /><span>ภาพรวม</span></NavLink>
        <NavLink to="/dashboard/bookshelf"><FaBook /><span>ชั้นหนังสือ</span></NavLink>
        <NavLink to="/dashboard/profile"><FaUserEdit /><span>แก้ไขโปรไฟล์</span></NavLink>
        <NavLink to="/dashboard/wallet"><FaWallet /><span>กระเป๋าเงิน/เติมเพชร</span></NavLink>
        
        <hr className="sidebar-divider"/>

        <h3>เมนูสำหรับนักเขียน</h3>
        <NavLink to="/dashboard/my-works"><FaPenSquare /><span>ผลงานของฉัน</span></NavLink>
        <NavLink to="/dashboard/income"><FaChartBar /><span>รายได้</span></NavLink>
        <NavLink to="/dashboard/kyc"><FaUserCheck /><span>ยืนยันตัวตน (KYC)</span></NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;