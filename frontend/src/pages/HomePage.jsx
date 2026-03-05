import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { fetchUser, getBuildings } from '../services/api.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [cityCount, setCityCount] = useState(0);

  useEffect(() => {
    getBuildings()
      .then((data) => {
        const buildings = data.buildings || [];
        setCityCount(buildings.length);
        setRecentUsers(buildings.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (username) => {
    setLoading(true);
    setError('');
    try {
      await fetchUser(username);
      navigate('/city');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user. Please check the username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] relative overflow-hidden">
      <Navbar />

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#6c5ce7' }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: '#e17055' }} />
      </div>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="text-center max-w-3xl mx-auto animate-[slide-up_0.6s_ease-out]">

          {/* City counter */}
          {cityCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 retro-border text-xs pixel-font text-[var(--color-text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-easy)] animate-pulse" />
              A city of {cityCount} LeetCode developers
            </div>
          )}

          {/* Title */}
          <h1 className="pixel-font text-4xl md:text-6xl leading-tight mb-6">
            <span className="text-[var(--color-text-primary)]">Leet</span>
            <span className="gradient-text">City</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-md mx-auto mb-10 leading-relaxed">
            Your LeetCode profile as a 3D pixel art building in an interactive city. Find yourself.
          </p>

          {/* Search card */}
          <div className="retro-border p-6 bg-[var(--color-bg-card)] max-w-lg mx-auto mb-4">
            <p className="pixel-font text-xs text-[var(--color-text-muted)] mb-4">Find your building in the city</p>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Error */}
          {error && (
            <p className="pixel-font text-xs text-[var(--color-hard)] mt-2 animate-[fade-in_0.2s_ease-out]">
              {error}
            </p>
          )}

          {/* Explore button */}
          <button
            onClick={() => navigate('/city')}
            className="btn-primary mt-6 px-8 py-3"
          >
            Explore City
          </button>

          {/* Controls hint */}
          <p className="text-[10px] text-[var(--color-text-muted)] mt-4 pixel-font">
            WASD to move · Scroll to zoom · Drag to rotate
          </p>
        </div>

        {/* Recent users */}
        {recentUsers.length > 0 && (
          <div className="mt-12 w-full max-w-3xl animate-[slide-up_0.8s_ease-out]">
            <h3 className="pixel-font text-[10px] text-[var(--color-text-muted)] mb-3 text-center">
              Recent Citizens
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {recentUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => navigate('/city')}
                  className="flex items-center gap-2 px-3 py-1.5 retro-border bg-[var(--color-bg-card)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card-hover)] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded overflow-hidden bg-[var(--color-bg-secondary)]">
                    {u.profile?.avatar ? (
                      <img src={u.profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center pixel-font text-[8px] text-[var(--color-accent)]">
                        {u.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="pixel-font text-[10px] text-[var(--color-text-primary)]">@{u.username}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">{u.solvedStats?.total}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
