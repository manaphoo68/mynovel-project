import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';
import {
    FaBook, FaPencilAlt, FaChartLine, FaUserFriends,
    FaGem, FaWallet, FaSignOutAlt, FaUser, FaCog
} from 'react-icons/fa';
import defaultAvatar from '../../assets/logo.png';

type ImageWithFallbackProps = { src?: string | null; fallback: string; alt: string; className?: string; };
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallback, alt, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); setCurrentSrc(src || fallback); }, [src, fallback]);
  const handleError = () => { if (!error) { setCurrentSrc(fallback); setError(true); } };
  return <img src={currentSrc} onError={handleError} alt={alt} {...props} />;
};

type User = { username: string; profile_image_url?: string; };
type Props = {
  currentUser: User;
  onLogout?: () => void;
};

const ProfileDropdown: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ตรวจสอบว่าไม่ได้คลิกที่ปุ่ม และ dropdown เปิดอยู่
      if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // ส่วนนี้อาจต้องซับซ้อนขึ้นถ้า dropdown ไม่ได้อยู่ข้างใน button
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const DropdownMenu = () => (
    // ในอนาคตเราจะใช้ Popper.js หรือ floating-ui เพื่อจัดการตำแหน่งที่ซับซ้อน
    // แต่ตอนนี้ใช้การคำนวณแบบง่ายๆ ไปก่อน
    <div
      className="profile-dropdown-content"
      style={{
          position: 'absolute',
          top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 0,
          right: 0,
      }}
    >
      <div className="dropdown-header"> <strong>{currentUser.username}</strong> </div>
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard/bookshelf')}> <FaBook className="dropdown-icon" /> <span>ชั้นหนังสือ</span> </button>
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard')}> <FaPencilAlt className="dropdown-icon" /> <span>แดชบอร์ดนักเขียน</span> </button>
      <hr className="dropdown-divider" />
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard/income')}><FaChartLine className="dropdown-icon" /><span>รายได้</span></button>
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard/wallet')}><FaGem className="dropdown-icon" /><span>เติมเพชร</span></button>
      <hr className="dropdown-divider" />
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard/profile')}><FaUser className="dropdown-icon"/><span>โปรไฟล์ของฉัน</span></button>
      <button className="dropdown-item" onClick={() => handleNavigate('/dashboard/settings')}><FaCog className="dropdown-icon"/><span>ตั้งค่าบัญชี</span></button>
      <hr className="dropdown-divider" />

      {onLogout && <button className="dropdown-item logout" onClick={handleLogoutClick}><FaSignOutAlt className="dropdown-icon"/><span>ออกจากระบบ</span></button>}
    </div>
  );

  return (
    <div className="profile-dropdown" ref={buttonRef}>
      <button className="avatar-button" onClick={handleToggle}>
        <ImageWithFallback src={currentUser.profile_image_url} fallback={defaultAvatar} alt={currentUser.username} />
      </button>
      {/* แก้ไข: ทำให้ DropdownMenu เป็นส่วนหนึ่งของ ProfileDropdown โดยตรง */}
      {isOpen && <DropdownMenu />}
    </div>
  );
};

export default ProfileDropdown;