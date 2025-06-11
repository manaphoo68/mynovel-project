import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Type สำหรับข้อมูล User ที่จะใช้ทั่วทั้งแอป
type User = {
    user_id: number;
    username: string;
    email: string;
    profile_image_url?: string | null;
};

// Type สำหรับค่าทั้งหมดที่จะถูกส่งผ่าน Context
type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

// สร้าง Context ขึ้นมา
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// สร้าง Provider Component (ตัวจัดการ Logic ทั้งหมด)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // ฟังก์ชันตรวจสอบสถานะล็อกอินเมื่อเปิดแอปครั้งแรก
    useEffect(() => {
        const checkLoginStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/me', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.isLoggedIn) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                     setUser(null);
                }
            } catch (error) {
                console.error("Could not fetch login status:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    // ฟังก์ชันสำหรับ Login
    const login = async (identifier: string, password: string) => {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            navigate('/');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
    };
    
    // ฟังก์ชันสำหรับ Logout
    const logout = async () => {
        await fetch('http://localhost:3000/api/logout', { method: 'POST', credentials: 'include' });
        setUser(null);
        navigate('/login');
    };

    const value = { user, isLoading, login, logout };

    // จะยังไม่แสดงผลแอป จนกว่าจะเช็คสถานะล็อกอินเสร็จ
    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Application...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// สร้าง Custom Hook เพื่อให้เรียกใช้ Context ได้ง่าย
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};