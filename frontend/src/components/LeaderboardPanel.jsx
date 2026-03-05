import React from 'react';

export default function LeaderboardPanel({ users, onSelectUser }) {
  if (!users || users.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="absolute top-14 right-3 z-30 w-64 retro-border bg-[var(--color-bg-secondary)] overflow-hidden animate-[fade-in_0.5s_ease-out]">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-[var(--color-border)]">
        <h3 className="pixel-font text-[10px] text-[var(--color-text-primary)] flex items-center gap-1.5">
          🏆 Leaderboard
        </h3>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {users.map((user, index) => (
          <button
            key={user._id || user.username}
            onClick={() => onSelectUser(user)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-card-hover)] transition-colors cursor-pointer bg-transparent border-none border-b border-[var(--color-border)] last:border-b-0 text-left"
          >
            {/* Rank */}
            <span className="text-xs w-5 text-center flex-shrink-0">
              {index < 3 ? medals[index] : (
                <span className="pixel-font text-[9px] text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
              )}
            </span>

            {/* Avatar */}
            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-[var(--color-bg-card)]">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center pixel-font text-[7px] text-[var(--color-accent)]">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="pixel-font text-[9px] text-[var(--color-text-primary)] truncate">@{user.username}</p>
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right">
              <span className="pixel-font text-[9px] text-[var(--color-accent-light)]">
                {user.solvedStats?.total || 0}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
