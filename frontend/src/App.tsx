import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';

// --- Page Imports ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/Dashboard/DashboardOverviewPage';
// import MyWorksPage from './pages/Dashboard/MyWorksPage';

// --- Component Imports ---
import Navbar from './components/Navbar/Navbar';
import SearchModal from './components/SearchModal/SearchModal';
import ProtectedRoute from './utils/ProtectedRoute';

// --- Context Imports ---
import { useTheme } from './context/ThemeContext';

// --- Type Definitions ---
type User = {
  user_id: number;
  username: string;
  profile_image_url?: string;
  balance_safe?: number;
  is_writer?: boolean;
};

declare global {
  interface Window { login: (user: User) => void; logout: () => void; }
}

const MainLayout: React.FC = () => {
  return (
    <main className="main-content">
      <Outlet />
    </main>
  );
};


function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { theme } = useTheme();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageClass = () => {
    if (location.pathname.startsWith('/dashboard') || location.pathname === '/login') {
      return 'login-layout';
    }
    return 'default-layout';
  };

  const handleLoginSuccess = (userData: User) => {
    setCurrentUser(userData);
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch('http://localhost:3000/api/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn) {
            setCurrentUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    checkCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
        await fetch('http://localhost:3000/api/logout', { 
            method: 'POST',
            credentials: 'include' 
        });
        setCurrentUser(null);
        navigate('/');
    } catch(error) {
        console.error('Logout failed:', error);
    }
  };

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`app-container ${theme} ${getPageClass()}`}>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSearchClick={() => setIsSearchModalOpen(true)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute currentUser={currentUser} />}>
          <Route path="/dashboard" element={<DashboardLayout currentUser={currentUser} />}>
            <Route index element={<DashboardOverviewPage />} />
            {/* <Route path="my-works" element={<MyWorksPage />} /> */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;