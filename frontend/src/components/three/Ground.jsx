import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating pixel particles (Git City style)
function FloatingParticles({ count = 200, nightMode }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const palette = [
      new THREE.Color('#6c5ce7'),
      new THREE.Color('#74b9ff'),
      new THREE.Color('#55efc4'),
      new THREE.Color('#ffeaa7'),
      new THREE.Color('#fab1a0'),
      new THREE.Color('#a29bfe'),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 60 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      speeds[i] = 0.2 + Math.random() * 0.5;
    }

    return { positions, colors, speeds };
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += particles.speeds[i] * delta;
      if (pos.array[i * 3 + 1] > 70) {
        pos.array[i * 3 + 1] = 2;
      }
    }
    pos.needsUpdate = true;
  });

  if (!nightMode) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function Ground({ nightMode }) {
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={nightMode ? '#060610' : '#0e0e1e'}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle grid */}
      <gridHelper
        args={[200, 40, nightMode ? '#12122a' : '#1e1e3a', nightMode ? '#0a0a18' : '#141428']}
        position={[0, 0.01, 0]}
      />

      {/* Center platform ring (Leaderboard District) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[14.5, 15.5, 64]} />
        <meshStandardMaterial
          color="#6c5ce7"
          emissive="#6c5ce7"
          emissiveIntensity={nightMode ? 1.0 : 0.3}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Floating particles */}
      <FloatingParticles count={150} nightMode={nightMode} />
    </group>
  );
}
