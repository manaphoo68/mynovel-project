import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import { FaSearch, FaMoon, FaSun, FaBell, FaBars, FaTimes, FaPen } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import ProfileDropdown from './ProfileDropdown/ProfileDropdown';

type User = { username: string; profile_image_url?: string; };
type Props = { currentUser: User | null; onAuthClick: () => void; onLogout: () => void; };

const Navbar: React.FC<Partial<Props>> = ({ currentUser, onAuthClick, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleAuthClick = () => {
    if (onAuthClick) {
      closeMobileMenu();
      onAuthClick();
    }
  }

  return (
    <nav className="navbar">
      {/* ... โค้ดส่วน navbar-left และ navbar-right เหมือนเดิมทุกประการ ... */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <div className="logo">M</div>
        </Link>
        <div className="navbar-links desktop-only">
          <NavLink to="/novels/translated">นิยายแปล</NavLink>
          <NavLink to="/novels/original">นิยายแต่ง</NavLink>
          <NavLink to="/chat-novel">นิยายแชท</NavLink>
          <NavLink to="/anime">แอนนิเมะ</NavLink>
          <NavLink to="/manga">มังงะ</NavLink>
          <NavLink to="/top-up">เติมเพชร</NavLink>
          <NavLink to="/become-author" className="hide-on-medium">ลงนิยายฟรี</NavLink>
          <NavLink to="/affiliate-info" className="hide-on-large">แนะนำเพื่อนรับรายได้ฟรี</NavLink>
        </div>
      </div>
      <div className="navbar-right">
        <div className="search-container desktop-only">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="ค้นหานิยาย..." />
        </div>
        <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">{theme === 'dark' ? <FaSun color="yellow" /> : <FaMoon />}</button>
        <div className="notification-bell"><FaBell /><span className="notification-dot"></span></div>
        <div className="auth-section">
          {currentUser && onLogout ? <ProfileDropdown currentUser={currentUser} onLogout={onLogout} /> : <button className="login-button" onClick={onAuthClick}>เข้าสู่ระบบ</button>}
        </div>
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      
      {/* [แก้ไขล่าสุด] ปรับโครงสร้าง mobile-menu ทั้งหมด */}
      <div className={`mobile-menu slide-in ${isMobileMenuOpen ? 'open' : ''}`}>
        
        {/* ส่วนหัวของเมนู (โปรไฟล์) - จะไม่ถูก scroll */}
        <div className="mobile-menu-header">
          {currentUser && onLogout && (
            <div className="mobile-profile-section">
              <div className="auth-section-mobile">
                <ProfileDropdown currentUser={currentUser} onLogout={onLogout} />
              </div>
              <p className="mobile-username">{currentUser.username}</p>
              <Link to="/profile/edit" className="edit-profile-link" onClick={closeMobileMenu}>
                <FaPen />
                <span>แก้ไขโปรไฟล์</span>
              </Link>
            </div>
          )}

          {!currentUser && onAuthClick && (
            <div className="mobile-profile-section">
                 <div className="auth-section-mobile">
                    <button className="login-button" onClick={handleAuthClick}>เข้าสู่ระบบ</button>
                </div>
            </div>
          )}
        </div>
        
        <hr className="mobile-menu-divider" />

        {/* ส่วนของลิงก์ - จะมี scrollbar ของตัวเอง */}
        <div className="mobile-links-container">
          <NavLink to="/novels/translated" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแปล</NavLink>
          <NavLink to="/novels/original" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแต่ง</NavLink>
          <NavLink to="/chat-novel" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแชท</NavLink>
          <NavLink to="/anime" className="mobile-menu-item" onClick={closeMobileMenu}>แอนนิเมะ</NavLink>
          <NavLink to="/manga" className="mobile-menu-item" onClick={closeMobileMenu}>มังงะ</NavLink>
          <hr className="mobile-menu-divider" />
          <NavLink to="/top-up" className="mobile-menu-item" onClick={closeMobileMenu}>เติมเพชร</NavLink>
          <NavLink to="/become-author" className="mobile-menu-item" onClick={closeMobileMenu}>ลงนิยายฟรี</NavLink>
          <NavLink to="/affiliate-info" className="mobile-menu-item" onClick={closeMobileMenu}>แนะนำเพื่อนรับรายได้ฟรี</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;