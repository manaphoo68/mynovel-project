// === src/components/AuthModal/AuthModal.tsx (เวอร์ชันใหม่) ===
import React, { useState } from 'react';
import './AuthModal.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
};

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="tab-buttons">
          <button onClick={() => setView('login')} className={view === 'login' ? 'active' : ''}>เข้าสู่ระบบ</button>
          <button onClick={() => setView('register')} className={view === 'register' ? 'active' : ''}>สมัครสมาชิก</button>
        </div>
        {view === 'login' ? (
          <LoginForm onLoginSuccess={onLoginSuccess} />
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>
  );
};

export default AuthModal;