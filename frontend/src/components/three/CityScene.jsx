import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import CameraControls from './CameraControls.jsx';
import Ground from './Ground.jsx';
import CityGrid from './CityGrid.jsx';

export default function CityScene({ buildings, onBuildingClick, nightMode, focusedUsername }) {
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

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={[nightMode ? '#050510' : '#0c0c1e', 30, 150]} />

      {/* Lighting — moody */}
      <ambientLight intensity={nightMode ? 0.1 : 0.3} />
      <directionalLight
        position={[30, 50, 20]}
        intensity={nightMode ? 0.2 : 0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Colored accent lights */}
      {nightMode && (
        <>
          <pointLight position={[0, 15, 0]} color="#6c5ce7" intensity={1.5} distance={40} />
          <pointLight position={[30, 8, -30]} color="#e17055" intensity={0.8} distance={25} />
          <pointLight position={[-30, 8, 30]} color="#00b894" intensity={0.8} distance={25} />
          <pointLight position={[20, 8, 20]} color="#74b9ff" intensity={0.6} distance={20} />
        </>
      )}

      {/* Ground + particles */}
      <Ground nightMode={nightMode} />

      {/* Buildings */}
      <CityGrid
        buildings={buildings}
        onBuildingClick={onBuildingClick}
        nightMode={nightMode}
        focusedUsername={focusedUsername}
      />

      {/* Controls */}
      <CameraControls />
    </Canvas>
  );
}
