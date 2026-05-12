import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('notepad-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('notepad-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return { darkMode, toggleTheme };
}
