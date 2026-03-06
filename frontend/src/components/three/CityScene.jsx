import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import CameraControls from './CameraControls.jsx';
import Ground from './Ground.jsx';
import CityGrid from './CityGrid.jsx';

// Colony configuration (must match backend)
const COLONY_CONFIG = {
  'contest-elites':    { center: { x: 0, z: 0 },     color: '#ffd700', label: '🏆 CONTEST ELITES' },
  'hard-grinders':     { center: { x: 50, z: -50 },  color: '#e17055', label: '🔥 HARD GRINDERS' },
  'speed-runners':     { center: { x: -50, z: -50 }, color: '#74b9ff', label: '⚡ SPEED RUNNERS' },
  'balanced-warriors': { center: { x: 50, z: 50 },   color: '#55efc4', label: '⚖️ BALANCED' },
  'easy-builders':     { center: { x: -50, z: 50 },  color: '#a29bfe', label: '🌱 EASY BUILDERS' },
};

// Colony ground markers
function ColonyMarkers({ nightMode }) {
  return (
    <group>
      {Object.entries(COLONY_CONFIG).map(([id, cfg]) => (
        <group key={id} position={[cfg.center.x, 0.05, cfg.center.z]}>
          {/* Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[16, 17, 32]} />
            <meshStandardMaterial
              color={cfg.color}
              emissive={cfg.color}
              emissiveIntensity={nightMode ? 0.8 : 0.2}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Label */}
          <Html
            position={[0, 0.5, -18]}
            center
            distanceFactor={40}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                fontFamily: '"Silkscreen", monospace',
                fontSize: '9px',
                color: cfg.color,
                textShadow: `0 0 10px ${cfg.color}40`,
                whiteSpace: 'nowrap',
                opacity: 0.8,
                letterSpacing: '0.1em',
              }}
            >
              {cfg.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function CityScene({ buildings, onBuildingClick, nightMode, focusedUsername, flyToTarget }) {
  return (
    <Canvas
      shadows
      camera={{ position: [40, 30, 40], fov: 50, near: 0.1, far: 500 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: 2 }}
    >
      {/* Dark background */}
      <color attach="background" args={[nightMode ? '#050510' : '#0c0c1e']} />

      {/* Stars */}
      {nightMode && (
        <Stars radius={100} depth={50} count={2000} factor={3} fade speed={0.5} />
      )}

      {/* Fog */}
      <fog attach="fog" args={[nightMode ? '#050510' : '#0c0c1e', 40, 200]} />

      {/* Lighting */}
      <ambientLight intensity={nightMode ? 0.1 : 0.3} />
      <directionalLight
        position={[30, 50, 20]}
        intensity={nightMode ? 0.2 : 0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* Accent lights */}
      {nightMode && (
        <>
          <pointLight position={[0, 15, 0]} color="#6c5ce7" intensity={1.5} distance={40} />
          <pointLight position={[50, 10, -50]} color="#e17055" intensity={1.0} distance={35} />
          <pointLight position={[-50, 10, -50]} color="#74b9ff" intensity={1.0} distance={35} />
          <pointLight position={[50, 10, 50]} color="#55efc4" intensity={1.0} distance={35} />
          <pointLight position={[-50, 10, 50]} color="#a29bfe" intensity={1.0} distance={35} />
        </>
      )}

      {/* Ground + particles */}
      <Ground nightMode={nightMode} />

      {/* Colony district markers */}
      <ColonyMarkers nightMode={nightMode} />

      {/* Buildings */}
      <CityGrid
        buildings={buildings}
        onBuildingClick={onBuildingClick}
        nightMode={nightMode}
        focusedUsername={focusedUsername}
      />

      {/* Controls with fly-to */}
      <CameraControls flyToTarget={flyToTarget} />
    </Canvas>
  );
}
