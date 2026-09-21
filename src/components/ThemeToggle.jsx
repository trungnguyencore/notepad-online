import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-apple-bg-tertiary active:scale-90"
      aria-label={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {darkMode ? (
        <Sun size={18} className="text-apple-accent" />
      ) : (
        <Moon size={18} className="text-apple-text-secondary" />
      )}
    </button>
  );
}
