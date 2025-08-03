import { useState, useEffect } from 'react';

/**
 * テーマ（ライト/ダークモード）の状態管理を提供するカスタムフック
 * @returns 現在のテーマと切り替え関数
 * @example
 * const { theme, toggleTheme } = useTheme();
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    
    html.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme
  };
};