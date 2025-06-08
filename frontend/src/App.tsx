// === frontend/src/App.tsx (เวอร์ชันเต็ม สมบูรณ์ที่สุด) ===
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import Components
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal/AuthModal';

// Import Pages
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import CreateNovelPage from './pages/CreateNovelPage';
import DashboardPage from './pages/DashboardPage';
import MyWorksPage from './pages/MyWorksPage';
import ManageNovelPage from './pages/ManageNovelPage';
import AffiliateInfoPage from './pages/AffiliateInfoPage';
import BecomeAuthorPage from './pages/BecomeAuthorPage';

// กำหนด Type สำหรับข้อมูล User
type User = {
  user_id: number;
  username: string;
  profile_image_url?: string;
};

function App() {
  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Data Fetching & Side Effects ---
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/me', { credentials: 'include' });
      const data = await response.json();
      if (data.isLoggedIn) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Could not fetch login status:", error);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // --- Event Handlers ---
  const handleLogout = async () => {
    await fetch('http://localhost:3000/api/logout', { method: 'POST', credentials: 'include' });
    alert('ออกจากระบบสำเร็จ');
    checkLoginStatus();
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
    checkLoginStatus();
  };

  return (
    <div>
      <Navbar 
        currentUser={currentUser} 
        onAuthClick={() => setIsModalOpen(true)}
        onLogout={handleLogout}
      />
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/affiliate-info" element={<AffiliateInfoPage />} />
        <Route path="/become-author" element={<BecomeAuthorPage />} />

        <Route path="/create-novel" element={<CreateNovelPage />} />
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<MyWorksPage />} />
          <Route path="works" element={<MyWorksPage />} />
          <Route path="novels/:novelId" element={<ManageNovelPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;