import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function CameraControls() {
  const controlsRef = useRef();
  const { camera } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.5;

  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;

    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    let moved = false;

    if (keys.current['w'] || keys.current['arrowup']) {
      camera.position.add(direction.clone().multiplyScalar(moveSpeed));
      controlsRef.current.target.add(direction.clone().multiplyScalar(moveSpeed));
      moved = true;
    }
    if (keys.current['s'] || keys.current['arrowdown']) {
      camera.position.add(direction.clone().multiplyScalar(-moveSpeed));
      controlsRef.current.target.add(direction.clone().multiplyScalar(-moveSpeed));
      moved = true;
    }
    if (keys.current['a'] || keys.current['arrowleft']) {
      camera.position.add(right.clone().multiplyScalar(-moveSpeed));
      controlsRef.current.target.add(right.clone().multiplyScalar(-moveSpeed));
      moved = true;
    }
    if (keys.current['d'] || keys.current['arrowright']) {
      camera.position.add(right.clone().multiplyScalar(moveSpeed));
      controlsRef.current.target.add(right.clone().multiplyScalar(moveSpeed));
      moved = true;
    }

    // Shift for up, Space for down
    if (keys.current['shift'] || keys.current[' ']) {
      const upDir = keys.current[' '] ? -1 : 1;
      camera.position.y += moveSpeed * upDir * 0.5;
      controlsRef.current.target.y += moveSpeed * upDir * 0.5;
      moved = true;
    }

    if (moved) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={5}
      maxDistance={150}
    />
  );
}
