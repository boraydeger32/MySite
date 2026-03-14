'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import type { Mesh } from 'three';

function GlowingIcosahedron() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#FF6B2B"
          emissive="#7C3AED"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>
      {/* Inner solid glow core */}
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#FF6B2B"
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.6}
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#FF6B2B" />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color="#7C3AED" />
      <pointLight position={[0, 3, -5]} intensity={0.5} color="#00D4FF" />
      <GlowingIcosahedron />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
