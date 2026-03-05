import React, { useState } from 'react';

export default function SearchBar({ onSearch, loading, placeholder = 'Enter LeetCode username...' }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !loading) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full pl-4 pr-36 py-3.5 bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] font-mono text-sm outline-none transition-all duration-300 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-glow)] disabled:opacity-50 rounded"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="btn-primary absolute right-1.5 px-4 py-2 text-xs"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Building...
            </span>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </form>
  );
}
