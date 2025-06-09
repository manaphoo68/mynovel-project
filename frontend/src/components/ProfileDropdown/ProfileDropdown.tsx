import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import './ProfileDropdown.css';
// [อัปเดต] import ไอคอนทั้งหมดที่ต้องการใช้
import { 
  FaBook, 
  FaPencilAlt, 
  FaChartLine, 
  FaUserFriends, 
  FaGem, 
  FaWallet 
} from 'react-icons/fa';

type User = { username: string; profile_image_url?: string; };
type Props = { currentUser: User; onLogout?: () => void; };

const ProfileDropdown: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const DropdownMenu = () => (
    <div 
      className="profile-dropdown-content"
      style={{ top: `${position.top}px`, right: `${position.right}px`, position: 'fixed' }}
    >
      <div className="dropdown-header">
        <strong>{currentUser.username}</strong>
      </div>

      {/* [อัปเดต] จัดกลุ่มเมนูใหม่ทั้งหมด */}
      
      {/* หมวดหมู่: การจัดการเนื้อหา */}
      <Link to="/my/bookshelf" className="dropdown-item" onClick={() => setIsOpen(false)}>
        <FaBook className="dropdown-icon" />
        <span>ชั้นหนังสือ</span>
      </Link>
      <Link to="/author/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
        <FaPencilAlt className="dropdown-icon" />
        <span>แต่ง/แก้ไขนิยาย</span>
      </Link>
      <hr className="dropdown-divider" />

      {/* หมวดหมู่: การเงิน */}
      <Link to="/author/income" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <FaChartLine className="dropdown-icon" />
          <span>รายได้นักเขียน</span>
      </Link>
      <Link to="/affiliate/income" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <FaUserFriends className="dropdown-icon" />
          <span>รายได้แนะนำเพื่อน</span>
      </Link>
      <Link to="/author/withdraw" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <FaWallet className="dropdown-icon" />
          <span>ถอนรายได้</span>
      </Link>
      <Link to="/top-up" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <FaGem className="dropdown-icon" />
          <span>เติมเพชร</span>
      </Link>
      <hr className="dropdown-divider" />

      {/* หมวดหมู่: บัญชี */}
      <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>โปรไฟล์ของฉัน</Link>
      <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>ตั้งค่าบัญชี</Link>
      <hr className="dropdown-divider" />

      {/* ออกจากระบบ */}
      {onLogout && <button className="dropdown-item logout" onClick={onLogout}>ออกจากระบบ</button>}
    </div>
  );

  return (
    <div className="profile-dropdown">
      <button ref={buttonRef} className="avatar-button" onClick={handleToggle}>
        <img 
          src={currentUser.profile_image_url || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} 
          alt={currentUser.username} 
        />
      </button>

      {isOpen && ReactDOM.createPortal(<DropdownMenu />, document.body)}
    </div>
  );
};

export default ProfileDropdown;