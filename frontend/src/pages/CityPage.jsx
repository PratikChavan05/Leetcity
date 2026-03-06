import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityScene from '../components/three/CityScene.jsx';
import SearchBar from '../components/SearchBar.jsx';
import UserProfileCard from '../components/UserProfileCard.jsx';
import LeaderboardPanel from '../components/LeaderboardPanel.jsx';
import { getBuildings, getLeaderboard, fetchUser } from '../services/api.js';

export default function CityPage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nightMode, setNightMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [activityLog, setActivityLog] = useState([]);
  const [flyToTarget, setFlyToTarget] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [bData, lData] = await Promise.all([getBuildings(), getLeaderboard()]);
      setBuildings(bData.buildings || []);
      setLeaderboard(lData.leaderboard || []);
    } catch (err) {
      console.error('Failed to load city data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (username) => {
    setLoading(true);
    setSearchError('');
    setFlyToTarget(null);

    try {
      const result = await fetchUser(username);
      const user = result.user;

      // If user already existed, fly to their building
      if (result.isExisting) {
        setActivityLog((prev) => [`📍 Flying to @${username}'s building`, ...prev].slice(0, 10));
      } else {
        setActivityLog((prev) => [`@${username} joined the city`, ...prev].slice(0, 10));
      }

      await loadData();

      // Fly camera to the building position
      if (user.gridPosition) {
        // Small delay so buildings re-render first
        setTimeout(() => {
          setFlyToTarget({
            x: user.gridPosition.x,
            y: user.buildingConfig?.height / 2 || 5,
            z: user.gridPosition.z,
          });
          setSelectedUser(user);
        }, 300);
      }
    } catch (err) {
      setSearchError(err.response?.data?.error || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingClick = (user) => {
    setSelectedUser(user);
    // Also fly to clicked building
    if (user.gridPosition) {
      setFlyToTarget({
        x: user.gridPosition.x,
        y: user.buildingConfig?.height / 2 || 5,
        z: user.gridPosition.z,
      });
    }
  };

  return (
    <div className="w-full h-screen relative bg-[var(--color-bg-primary)]">
      {/* 3D Scene */}
      <CityScene
        buildings={buildings}
        onBuildingClick={handleBuildingClick}
        nightMode={nightMode}
        focusedUsername={selectedUser?.username || null}
        flyToTarget={flyToTarget}
      />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between pointer-events-none">
        {/* Left: Logo + search */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[var(--color-accent)] to-[#fd79a8] flex items-center justify-center text-white pixel-font text-[10px] font-bold">
              LC
            </div>
            <span className="pixel-font text-sm gradient-text">LeetCity</span>
          </button>

          <div className="w-72">
            <SearchBar onSearch={handleSearch} loading={loading} placeholder="Add user to city..." />
            {searchError && (
              <p className="pixel-font text-[9px] text-[var(--color-hard)] mt-1">{searchError}</p>
            )}
          </div>
        </div>

        {/* Right: toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setNightMode((p) => !p)}
            className="glass px-3 py-1.5 rounded pixel-font text-[10px] cursor-pointer border-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
          >
            {nightMode ? '☀ Day' : '🌙 Night'}
          </button>
          <button
            onClick={() => setShowControls((p) => !p)}
            className="glass w-8 h-8 rounded pixel-font text-xs cursor-pointer border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
          >
            ?
          </button>
        </div>
      </div>

      {/* Controls tooltip */}
      {showControls && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 glass px-4 py-2 rounded animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center gap-4 pixel-font text-[9px] text-[var(--color-text-secondary)]">
            <span><kbd className="px-1 py-0.5 retro-border text-[8px] text-[var(--color-text-primary)] bg-[var(--color-bg-card)]">WASD</kbd> Move</span>
            <span><kbd className="px-1 py-0.5 retro-border text-[8px] text-[var(--color-text-primary)] bg-[var(--color-bg-card)]">Drag</kbd> Rotate</span>
            <span><kbd className="px-1 py-0.5 retro-border text-[8px] text-[var(--color-text-primary)] bg-[var(--color-bg-card)]">Scroll</kbd> Zoom</span>
          </div>
        </div>
      )}

      {/* City stats */}
      <div className="absolute bottom-3 left-3 z-20 glass px-3 py-1.5 rounded">
        <span className="pixel-font text-[9px] text-[var(--color-text-muted)]">
          {buildings.length} building{buildings.length !== 1 ? 's' : ''} in city
        </span>
      </div>

      {/* Activity ticker */}
      {activityLog.length > 0 && (
        <div className="absolute bottom-3 right-3 z-20 glass px-3 py-1.5 rounded max-w-xs overflow-hidden">
          <p className="pixel-font text-[8px] text-[var(--color-easy)] whitespace-nowrap animate-[fade-in_0.3s_ease-out]">
            {activityLog[0]}
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <LeaderboardPanel users={leaderboard} onSelectUser={handleBuildingClick} />

      {/* Profile card modal */}
      {selectedUser && (
        <UserProfileCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
