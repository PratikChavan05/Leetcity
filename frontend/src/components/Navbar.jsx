import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--color-accent)] to-[#fd79a8] flex items-center justify-center text-white pixel-font text-xs font-bold">
            LC
          </div>
          <span className="pixel-font text-lg gradient-text">LeetCity</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded pixel-font text-xs no-underline transition-all duration-200 ${
              isActive('/')
                ? 'bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent-light)]'
                : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-card)] border-2 border-transparent'
            }`}
          >
            Home
          </Link>
          <Link
            to="/city"
            className={`px-4 py-2 rounded pixel-font text-xs no-underline transition-all duration-200 ${
              isActive('/city')
                ? 'bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent-light)]'
                : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-card)] border-2 border-transparent'
            }`}
          >
            Explore City
          </Link>
        </div>
      </div>
    </nav>
  );
}
