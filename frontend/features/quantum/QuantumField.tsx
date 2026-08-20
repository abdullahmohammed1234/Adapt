"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function BlochMetaphor({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const marker = useRef<Mesh>(null);
  const points = useMemo(() => {
    const ring: [number, number, number][] = [];
    for (let i = 0; i < 48; i += 1) {
      const t = (i / 48) * Math.PI * 2;
      ring.push([Math.cos(t) * 1.35, 0, Math.sin(t) * 1.35]);
    }
    return ring;
  }, []);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.getElapsedTime();
    if (group.current) group.current.rotation.y = t * 0.18;
    if (marker.current) {
      marker.current.position.set(Math.sin(t) * 0.7, Math.cos(t * 0.7) * 0.7, Math.cos(t) * 0.4);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#5B4BD6" transparent opacity={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 32, 16]} />
        <meshBasicMaterial color="#c4b8ff" wireframe transparent opacity={0.35} />
      </mesh>
      {points.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#8b7dff" />
        </mesh>
      ))}
      <mesh ref={marker}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f4f1ea" emissive="#5B4BD6" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function QuantumField() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-72 overflow-hidden rounded-[var(--radius-card)] bg-[#120f24]">
      <Canvas camera={{ position: [0, 0.4, 3.2], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 2, 4]} intensity={18} color="#8b7dff" />
        <BlochMetaphor reduced={reduced} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={!reduced} autoRotateSpeed={0.4} />
      </Canvas>
      <p className="absolute bottom-3 left-4 right-4 text-xs text-white/70">
        A visual metaphor for a quantum state on a sphere — not a physics simulation.
      </p>
    </div>
  );
}
