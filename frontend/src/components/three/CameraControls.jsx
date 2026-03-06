import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const CameraControls = forwardRef(function CameraControls({ flyToTarget }, ref) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.5;

  // Fly-to animation state
  const flyState = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
    duration: 2.0,
  });

  // Expose flyTo method via ref
  const flyTo = useCallback((targetPos) => {
    if (!controlsRef.current) return;
    const state = flyState.current;
    state.active = true;
    state.progress = 0;
    state.startPos.copy(camera.position);
    state.startTarget.copy(controlsRef.current.target);

    // End position: above and behind the target
    state.endTarget.set(targetPos.x, targetPos.y || 0, targetPos.z);
    state.endPos.set(
      targetPos.x + 15,
      (targetPos.y || 0) + 18,
      targetPos.z + 15
    );
  }, [camera]);

  useImperativeHandle(ref, () => ({ flyTo }), [flyTo]);

  // React to flyToTarget prop changes
  useEffect(() => {
    if (flyToTarget) {
      flyTo(flyToTarget);
    }
  }, [flyToTarget, flyTo]);

  // Keyboard controls
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

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const state = flyState.current;

    // Fly-to animation
    if (state.active) {
      state.progress = Math.min(1, state.progress + delta / state.duration);
      // Smooth ease-in-out
      const t = state.progress < 0.5
        ? 4 * state.progress * state.progress * state.progress
        : 1 - Math.pow(-2 * state.progress + 2, 3) / 2;

      camera.position.lerpVectors(state.startPos, state.endPos, t);
      controlsRef.current.target.lerpVectors(state.startTarget, state.endTarget, t);
      controlsRef.current.update();

      if (state.progress >= 1) {
        state.active = false;
      }
      return; // Skip manual movement during fly-to
    }

    // WASD movement
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
});

export default CameraControls;
