import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import { FaSearch, FaMoon, FaSun, FaBell, FaBars, FaTimes, FaPen, FaArrowLeft, FaGem } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

type User = {
  user_id: number;
  username: string;
  profile_image_url?: string;
  balance_safe?: number;
  is_writer?: boolean;
};

type Props = {
  currentUser: User | null;
  onLogout?: () => void;
  onSearchClick?: () => void;
};

const Navbar: React.FC<Props> = ({ currentUser, onLogout, onSearchClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`navbar ${isMobileSearchOpen ? 'mobile-search-active' : ''}`}>
      <div className="navbar-left">
        <div className="navbar-brand-section"> <Link to="/" className="navbar-brand"> <div className="logo">InK</div> </Link> <div className="navbar-links desktop-only"> <NavLink to="/novels/translated">นิยายแปล</NavLink><NavLink to="/novels/original">นิยายแต่ง</NavLink><NavLink to="/chat-novel">นิยายแชท</NavLink><NavLink to="/manga">มังงะ</NavLink><NavLink to="/top-up">เติมเพชร</NavLink><NavLink to="/become-author" className="hide-on-medium">ลงนิยายฟรี</NavLink><NavLink to="/affiliate-info" className="hide-on-large">รายได้แนะนำเพื่อน</NavLink> </div> </div> <div className="mobile-search-container"> <button className="mobile-search-back-btn" onClick={() => setIsMobileSearchOpen(false)}> <FaArrowLeft /> </button> <input type="text" placeholder="ค้นหานิยาย, นักเขียน..." autoFocus /> </div>
      </div>
      <div className="navbar-right">
        <button className="search-container-trigger desktop-only" onClick={onSearchClick}><FaSearch className="search-icon" /><span className="search-placeholder">ค้นหานิยาย...</span></button>
        <button className="mobile-search-trigger" onClick={() => setIsMobileSearchOpen(true)}> <FaSearch /> </button>
        <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">{theme === 'dark' ? <FaSun color="yellow" /> : <FaMoon />}</button>
        <div className="notification-bell"><FaBell /><span className="notification-dot"></span></div>
        {currentUser && ( <Link to="/top-up" className="diamond-balance"> <FaGem /> <span>{currentUser.balance_safe?.toLocaleString() || 0}</span> </Link> )}
        <div className="auth-section">
          {currentUser && onLogout ? <ProfileDropdown currentUser={currentUser} onLogout={onLogout} /> : <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>}
        </div>
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu slide-in ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
            {currentUser && onLogout && ( <div className="mobile-profile-section"> <div className="auth-section-mobile"> <ProfileDropdown currentUser={currentUser} onLogout={onLogout} /> </div> <p className="mobile-username">{currentUser.username}</p> <Link to="/profile/edit" className="edit-profile-link" onClick={closeMobileMenu}> <FaPen /> <span>แก้ไขโปรไฟล์</span> </Link> </div> )}
            {!currentUser && ( <div className="mobile-profile-section"> <div className="auth-section-mobile"> <Link to="/login" className="login-button" onClick={closeMobileMenu}>เข้าสู่ระบบ</Link> </div> </div> )}
        </div>
        <hr className="mobile-menu-divider" />
        <div className="mobile-links-container">
            <NavLink to="/novels/translated" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแปล</NavLink> <NavLink to="/novels/original" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแต่ง</NavLink> <NavLink to="/chat-novel" className="mobile-menu-item" onClick={closeMobileMenu}>นิยายแชท</NavLink> <NavLink to="/manga" className="mobile-menu-item" onClick={closeMobileMenu}>มังงะ</NavLink> <hr className="mobile-menu-divider" /> <NavLink to="/top-up" className="mobile-menu-item" onClick={closeMobileMenu}>เติมเพชร</NavLink> <NavLink to="/become-author" className="mobile-menu-item" onClick={closeMobileMenu}>ลงนิยายฟรี</NavLink> <NavLink to="/affiliate-info" className="mobile-menu-item" onClick={closeMobileMenu}>รายได้แนะนำเพื่อน</NavLink>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;