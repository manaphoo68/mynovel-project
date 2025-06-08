// === frontend/src/components/ProfileDropdown/ProfileDropdown.tsx ===
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProfileDropdown.css';

type User = { username: string; profile_image_url?: string; };
type Props = { currentUser: User; onLogout: () => void; };

const ProfileDropdown: React.FC<Props> = ({ currentUser, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="avatar-button">
                <div className="profile-avatar">{currentUser.username.charAt(0).toUpperCase()}</div>
            </button>

            {isOpen && (
                <div className="profile-dropdown-content">
                    <div className="dropdown-header">
                        <strong>{currentUser.username}</strong>
                    </div>
                    <Link to="/dashboard/works" className="dropdown-item">ผลงานของฉัน</Link>
                    <Link to="/profile/bookshelf" className="dropdown-item">ชั้นหนังสือ</Link>
                    <Link to="/profile/following" className="dropdown-item">การติดตาม</Link>
                    <hr className="dropdown-divider" />
                    <button onClick={onLogout} className="dropdown-item logout">ออกจากระบบ</button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;