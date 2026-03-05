import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── Window Texture Generator (Git City style) ─────────────────
// Creates a canvas texture with pixel-art windows (6×6px cells, NearestFilter)

const WINDOW_SIZE = 6;
const WINDOW_GAP = 2;
const WINDOW_PAD = 3;

// Lit window colors (warm palette)
const LIT_COLORS = ['#ffeaa7', '#fdcb6e', '#74b9ff', '#55efc4', '#a29bfe', '#fab1a0'];
const OFF_COLOR = '#0a0a15';

function createWindowTexture(rows, cols, litPct, seed, faceColor) {
  const w = WINDOW_PAD * 2 + cols * WINDOW_SIZE + Math.max(0, cols - 1) * WINDOW_GAP;
  const h = WINDOW_PAD * 2 + rows * WINDOW_SIZE + Math.max(0, rows - 1) * WINDOW_GAP;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Face background
  ctx.fillStyle = faceColor || '#0f1a2e';
  ctx.fillRect(0, 0, w, h);

  // Seeded random
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Draw pixel windows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = WINDOW_PAD + c * (WINDOW_SIZE + WINDOW_GAP);
      const y = WINDOW_PAD + r * (WINDOW_SIZE + WINDOW_GAP);

      if (rand() < litPct) {
        ctx.fillStyle = LIT_COLORS[Math.floor(rand() * LIT_COLORS.length)];
      } else {
        ctx.fillStyle = OFF_COLOR;
      }
      ctx.fillRect(x, y, WINDOW_SIZE, WINDOW_SIZE);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Username Label Sprite ──────────────────────────────────────

function createLabelTexture(username) {
  const W = 512;
  const H = 64;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const text = `@${username.toUpperCase()}`;
  ctx.font = 'bold 32px "Silkscreen", "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Background pill
  const textWidth = ctx.measureText(text).width;
  const padX = 16;
  const padY = 6;
  const bgW = textWidth + padX * 2;
  const bgH = 40 + padY * 2;
  const bgX = (W - bgW) / 2;
  const bgY = (H - bgH) / 2;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
  ctx.beginPath();
  ctx.roundRect(bgX, bgY, bgW, bgH, 4);
  ctx.fill();

  // Text
  ctx.fillStyle = '#e8dcc8';
  ctx.shadowColor = 'rgba(108, 92, 231, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Focus Beacon (sky beam + floating diamond) ─────────────────

function FocusBeacon({ height, width, depth, color }) {
  const markerRef = useRef();
  const BEAM_HEIGHT = 80;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (markerRef.current) {
      markerRef.current.position.y = height + 6 + Math.sin(t * 2) * 2;
      markerRef.current.rotation.y = t * 1.5;
    }
  });

  const coneRadius = Math.max(width, depth) * 1.2;

  return (
    <group>
      {/* Sky beam cone */}
      <mesh position={[0, BEAM_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0, coneRadius, BEAM_HEIGHT, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Core beam */}
      <mesh position={[0, BEAM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, BEAM_HEIGHT, 0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Floating diamond marker */}
      <group ref={markerRef} position={[0, height + 6, 0]}>
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh scale={[1.5, 1.5, 1.5]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Shared Geometry ────────────────────────────────────────────

const SHARED_BOX = new THREE.BoxGeometry(1, 1, 1);

// ─── Main Building Component ────────────────────────────────────

export default function Building({ userData, onClick, nightMode, focused }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const spriteRef = useRef();
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  const { buildingConfig, gridPosition, username, solvedStats } = userData;
  const {
    height, width, depth: bDepth,
    floors, color, faceColor,
    glowIntensity, decorations,
    windowsPerFloor, sideWindowsPerFloor, litPercentage,
  } = buildingConfig;

  const actualDepth = bDepth || width * 0.8;
  const totalFloors = (floors?.easy || 0) + (floors?.medium || 0) + (floors?.hard || 0) || Math.max(3, height);

  // Seed from username
  const seed = useMemo(
    () => username.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137,
    [username]
  );

  // Create window textures (front + side)
  const textures = useMemo(() => {
    const front = createWindowTexture(
      totalFloors,
      windowsPerFloor || 3,
      litPercentage || 0.3,
      seed,
      faceColor || '#0f1a2e'
    );
    const side = createWindowTexture(
      totalFloors,
      sideWindowsPerFloor || 2,
      litPercentage || 0.3,
      seed + 7919,
      faceColor || '#0f1a2e'
    );
    return { front, side };
  }, [totalFloors, windowsPerFloor, sideWindowsPerFloor, litPercentage, seed, faceColor]);

  // Dispose textures on unmount
  useEffect(() => {
    return () => {
      textures.front.dispose();
      textures.side.dispose();
    };
  }, [textures]);

  // Materials: [+x, -x, +y, -y, +z, -z] = [right, left, top, bottom, front, back]
  const materials = useMemo(() => {
    const emIntensity = nightMode ? 2.0 : 0.8;
    const WHITE = new THREE.Color('#ffffff');

    const makeFaceMat = (tex) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        emissive: WHITE,
        emissiveMap: tex,
        emissiveIntensity: emIntensity,
        roughness: 0.85,
        metalness: 0,
      });

    const roofMat = new THREE.MeshStandardMaterial({
      color: color || '#6c5ce7',
      emissive: new THREE.Color(color || '#6c5ce7'),
      emissiveIntensity: nightMode ? 1.5 : 0.5,
      roughness: 0.6,
    });

    const sideMat = makeFaceMat(textures.side);
    const frontMat = makeFaceMat(textures.front);

    // [right, left, top, bottom, front, back]
    return [sideMat, sideMat, roofMat, roofMat, frontMat, frontMat];
  }, [textures, color, nightMode]);

  // Dispose materials on unmount
  useEffect(() => {
    return () => {
      for (const mat of materials) mat.dispose();
    };
  }, [materials]);

  // Username label
  const labelTexture = useMemo(() => createLabelTexture(username), [username]);
  const labelMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        depthTest: true,
        sizeAttenuation: true,
        fog: true,
      }),
    [labelTexture]
  );

  useEffect(() => {
    return () => {
      labelTexture.dispose();
      labelMaterial.dispose();
    };
  }, [labelTexture, labelMaterial]);

  // Rise animation
  useFrame((_, delta) => {
    if (doneRef.current) return;

    progressRef.current = Math.min(1, progressRef.current + delta * 1.2);
    const t = 1 - Math.pow(1 - progressRef.current, 3); // ease-out cubic

    if (meshRef.current) {
      meshRef.current.scale.set(width, Math.max(0.001, t * height), actualDepth);
      meshRef.current.position.y = (height * t) / 2;
    }
    if (spriteRef.current) {
      spriteRef.current.position.y = height * t + 4;
    }

    if (progressRef.current >= 1) {
      doneRef.current = true;
    }
  });

  // Dim when another building is focused
  useEffect(() => {
    const dimmed = focused === false; // explicitly false = another building focused
    for (const mat of materials) {
      mat.transparent = dimmed;
      mat.opacity = dimmed ? 0.4 : 1;
      mat.emissiveIntensity = dimmed ? 0.3 : (nightMode ? 2.0 : 0.8);
    }
    if (labelMaterial) {
      labelMaterial.opacity = dimmed ? 0.2 : 1;
    }
  }, [focused, materials, labelMaterial, nightMode]);

  return (
    <group
      ref={groupRef}
      position={[gridPosition.x, 0, gridPosition.z]}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(userData);
      }}
    >
      {/* Main building box */}
      <mesh
        ref={meshRef}
        material={materials}
        geometry={SHARED_BOX}
        scale={[width, 0.001, actualDepth]}
        castShadow
        receiveShadow
      />

      {/* Username label sprite */}
      <sprite
        ref={spriteRef}
        material={labelMaterial}
        position={[0, height + 4, 0]}
        scale={[8, 1.2, 1]}
      />

      {/* Focus beacon */}
      {focused === true && (
        <FocusBeacon
          height={height}
          width={width}
          depth={actualDepth}
          color={color || '#6c5ce7'}
        />
      )}

      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[0, height + 7, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(10, 10, 20, 0.85)',
              border: '2px solid rgba(108, 92, 231, 0.5)',
              padding: '8px 14px',
              borderRadius: '4px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: '"Silkscreen", monospace',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#e8dcc8', margin: 0 }}>
              @{username}
            </p>
            <p style={{ fontSize: '10px', color: '#9595b0', margin: '3px 0 0' }}>
              {solvedStats.total} solved · Rating {userData.contestRating || '—'}
            </p>
            <p style={{ fontSize: '9px', color: '#5a5a78', margin: '2px 0 0' }}>
              🪟 {userData.activeDays || 0} active days
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
