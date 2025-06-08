// === src/components/AuthModal/LoginForm.tsx ===
import React, { useState } from 'react';

type Props = {
  onLoginSuccess: () => void;
};

const LoginForm: React.FC<Props> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      onLoginSuccess(); // ถ้าล็อกอินสำเร็จ ให้เรียกฟังก์ชันนี้
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <input 
        type="text" 
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="ชื่อผู้ใช้ หรือ อีเมล" 
        required 
        style={{ padding: '10px', marginBottom: '10px' }}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="รหัสผ่าน" 
        required 
        style={{ padding: '10px', marginBottom: '10px' }}
      />
      <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>ล็อกอิน</button>
    </form>
  );
};

export default LoginForm;