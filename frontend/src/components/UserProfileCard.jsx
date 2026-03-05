import React from 'react';

export default function UserProfileCard({ user, onClose }) {
  if (!user) return null;

  const { username, profile, solvedStats, contestRating, badges, streak, activeDays, buildingConfig } = user;

  const statItems = [
    { label: 'Total', value: solvedStats.total, color: 'var(--color-accent-light)' },
    { label: 'Easy', value: solvedStats.easy, color: 'var(--color-easy)' },
    { label: 'Medium', value: solvedStats.medium, color: 'var(--color-medium)' },
    { label: 'Hard', value: solvedStats.hard, color: 'var(--color-hard)' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="relative w-full max-w-sm mx-4 mb-0 sm:mb-0 overflow-hidden animate-[slide-up_0.3s_ease-out] retro-border"
        style={{ background: 'var(--color-bg-secondary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-[var(--color-border)] flex items-center gap-3">
          <div className="w-12 h-12 rounded overflow-hidden retro-border flex-shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--color-bg-card)] flex items-center justify-center pixel-font text-lg text-[var(--color-accent)]">
                {username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="pixel-font text-sm text-[var(--color-text-primary)] truncate">
              {profile?.realName || username}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">@{username}</p>
          </div>
          <button
            onClick={onClose}
            className="pixel-font text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer bg-transparent border-none"
          >
            ESC
          </button>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[var(--color-border)] text-xs">
          <div className="retro-border px-2 py-1 bg-[var(--color-bg-card)]">
            <span className="text-[var(--color-text-muted)]">Rank </span>
            <span className="pixel-font text-[var(--color-text-primary)]">#{profile?.ranking?.toLocaleString() || '—'}</span>
          </div>
          <div className="retro-border px-2 py-1 bg-[var(--color-bg-card)]">
            <span className="text-[var(--color-text-muted)]">Rating </span>
            <span className="pixel-font text-[var(--color-text-primary)]">{contestRating || '—'}</span>
          </div>
          <div className="retro-border px-2 py-1 bg-[var(--color-bg-card)]">
            <span className="text-[var(--color-text-muted)]">🔥 </span>
            <span className="pixel-font text-[var(--color-text-primary)]">{streak}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 border-b-2 border-[var(--color-border)]">
          {statItems.map((s) => (
            <div key={s.label} className="p-3 text-center border-r-2 border-[var(--color-border)] last:border-r-0">
              <div className="pixel-font text-base" style={{ color: s.color }}>{s.value}</div>
              <div className="pixel-font text-[8px] text-[var(--color-text-muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Building info */}
        <div className="p-4 border-b-2 border-[var(--color-border)]">
          <h4 className="pixel-font text-[9px] text-[var(--color-text-muted)] mb-2">Building Config</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[var(--color-text-muted)]">Height</span>
              <p className="pixel-font text-[var(--color-text-primary)]">{buildingConfig?.height}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Width</span>
              <p className="pixel-font text-[var(--color-text-primary)]">{buildingConfig?.width?.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Windows</span>
              <p className="pixel-font text-[var(--color-text-primary)]">{Math.round((buildingConfig?.litPercentage || 0) * 100)}%</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Badges</span>
              <p className="pixel-font text-[var(--color-text-primary)]">{badges?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="p-4 border-b-2 border-[var(--color-border)]">
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b, i) => (
                <span key={i} className="retro-border px-2 py-0.5 pixel-font text-[8px] text-[var(--color-medium)] bg-[var(--color-bg-card)]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active days */}
        <div className="p-4 border-b-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="pixel-font text-[9px] text-[var(--color-text-muted)]">Active Days</span>
            <span className="pixel-font text-xs text-[var(--color-easy)]">{activeDays || 0}</span>
          </div>
        </div>

        {/* LeetCode link */}
        <div className="p-4">
          <a
            href={`https://leetcode.com/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full no-underline text-center"
          >
            View on LeetCode ↗
          </a>
        </div>
      </div>
    </div>
  );
}
