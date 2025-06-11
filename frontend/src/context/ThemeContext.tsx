import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// กำหนด Type สำหรับ Context
type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// สร้าง Context ขึ้นมาพร้อมค่าเริ่มต้น
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// สร้าง Provider Component
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ตรวจสอบธีมที่เคยบันทึกไว้ใน localStorage หรือใช้ 'light' เป็นค่าเริ่มต้น
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  // [สำคัญ] ส่วนที่ใช้ในการเพิ่ม/ลบ class ออกจาก <html>
  useEffect(() => {
    const root = window.document.documentElement; // documentElement คือแท็ก <html>
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

    // บันทึกธีมที่เลือกลงใน localStorage เพื่อให้จำค่าได้
    localStorage.setItem('theme', theme);
  }, [theme]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};