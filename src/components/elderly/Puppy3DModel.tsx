import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Puppy3DProps {
  mood: 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love';
}

// Nintendogs-style golden retriever puppy
function PuppyBody({ mood }: Puppy3DProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Golden retriever/lab colors - warm and natural
  const colors = useMemo(() => ({
    furMain: '#D4A574',      // Golden tan fur
    furLight: '#E8C9A0',     // Lighter belly/chest
    furDark: '#B8956A',      // Darker back/ears
    furMuzzle: '#E5D4BE',    // Light muzzle
    nose: '#2D2320',         // Dark nose
    eyeWhite: '#FEFEFE',
    eyeIris: '#3D2817',      // Dark brown eyes
    eyePupil: '#0D0907',
    eyeShine: '#FFFFFF',
    tongue: '#E88A9A',       // Pink tongue
    innerMouth: '#8B4D5A',   // Inner mouth
    pawPad: '#4A3A35',       // Dark paw pads
    gums: '#C97080',
  }), []);

  // Subtle idle animations
  useFrame((state) => {
    if (!bodyRef.current || !headRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Breathing animation - subtle body rise
    const breathSpeed = mood === 'sleeping' ? 0.8 : mood === 'excited' ? 3 : 1.5;
    const breathAmount = mood === 'sleeping' ? 0.015 : mood === 'excited' ? 0.025 : 0.01;
    bodyRef.current.position.y = Math.sin(time * breathSpeed) * breathAmount;
    
    // Head bobbing - subtle and natural
    if (mood === 'excited') {
      headRef.current.rotation.z = Math.sin(time * 4) * 0.08;
      headRef.current.position.y = 0.55 + Math.abs(Math.sin(time * 5)) * 0.03;
    } else if (mood === 'sleeping') {
      headRef.current.rotation.x = 0.15 + Math.sin(time * 0.5) * 0.02;
      headRef.current.position.y = 0.5;
    } else {
      headRef.current.rotation.z = Math.sin(time * 1.5) * 0.03;
      headRef.current.position.y = 0.55;
    }

    // Tail wag
    if (tailRef.current) {
      const wagSpeed = mood === 'excited' ? 12 : mood === 'love' ? 8 : mood === 'sleeping' ? 0.5 : 4;
      const wagAmount = mood === 'excited' ? 0.8 : mood === 'love' ? 0.5 : mood === 'sleeping' ? 0.05 : 0.3;
      tailRef.current.rotation.z = Math.sin(time * wagSpeed) * wagAmount;
    }

    // Tongue panting for happy moods
    if (tongueRef.current && (mood === 'smiling' || mood === 'excited' || mood === 'love')) {
      tongueRef.current.scale.y = 1 + Math.sin(time * 6) * 0.15;
      tongueRef.current.position.y = -0.08 + Math.sin(time * 6) * 0.01;
    }
  });

  const isHappy = mood === 'smiling' || mood === 'excited' || mood === 'love';
  const isAsleep = mood === 'sleeping';

  return (
    <group 
      ref={bodyRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.02 : 1}
    >
      {/* === BODY === */}
      {/* Main body - elongated capsule */}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.28, 0.5, 16, 16]} />
        <meshStandardMaterial color={colors.furMain} roughness={0.9} />
      </mesh>
      
      {/* Belly - slightly lighter */}
      <mesh position={[0, 0.15, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.35, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>

      {/* Chest */}
      <mesh position={[0, 0.3, 0.22]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>

      {/* Back hump */}
      <mesh position={[0, 0.42, -0.05]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={colors.furDark} roughness={0.9} />
      </mesh>

      {/* === LEGS === */}
      {/* Front left leg */}
      <group position={[-0.15, 0, 0.18]}>
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.07, 0.18, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Paw */}
        <mesh position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={colors.furLight} roughness={0.9} />
        </mesh>
      </group>

      {/* Front right leg */}
      <group position={[0.15, 0, 0.18]}>
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.07, 0.18, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Paw */}
        <mesh position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={colors.furLight} roughness={0.9} />
        </mesh>
      </group>

      {/* Back left leg */}
      <group position={[-0.18, 0, -0.22]}>
        {/* Upper leg */}
        <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.16, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, 0.02, 0.04]}>
          <capsuleGeometry args={[0.065, 0.12, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Paw */}
        <mesh position={[0, -0.04, 0.06]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={colors.furLight} roughness={0.9} />
        </mesh>
      </group>

      {/* Back right leg */}
      <group position={[0.18, 0, -0.22]}>
        {/* Upper leg */}
        <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.16, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, 0.02, 0.04]}>
          <capsuleGeometry args={[0.065, 0.12, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
        {/* Paw */}
        <mesh position={[0, -0.04, 0.06]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={colors.furLight} roughness={0.9} />
        </mesh>
      </group>

      {/* === TAIL === */}
      <group ref={tailRef} position={[0, 0.35, -0.42]}>
        <mesh rotation={[-0.8, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 8, 8]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.9} />
        </mesh>
        {/* Tail tip - fluffier */}
        <mesh position={[0, 0.18, -0.12]} rotation={[-0.6, 0, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
      </group>

      {/* === HEAD === */}
      <group ref={headRef} position={[0, 0.55, 0.25]}>
        {/* Main head */}
        <mesh>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.85} />
        </mesh>

        {/* Forehead - slightly darker */}
        <mesh position={[0, 0.12, -0.02]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.85} />
        </mesh>

        {/* Snout/Muzzle */}
        <mesh position={[0, -0.06, 0.18]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={colors.furMuzzle} roughness={0.85} />
        </mesh>

        {/* Snout top */}
        <mesh position={[0, 0, 0.16]} rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.12, 8, 8]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.85} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.3]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={colors.nose} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Nostrils hint */}
        <mesh position={[-0.02, -0.03, 0.34]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
        <mesh position={[0.02, -0.03, 0.34]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>

        {/* === EYES === */}
        {/* Left eye socket area */}
        <mesh position={[-0.1, 0.04, 0.15]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.8} />
        </mesh>
        
        {/* Left eye */}
        <group position={[-0.1, 0.04, 0.2]}>
          <mesh>
            <sphereGeometry args={[isAsleep ? 0.01 : 0.045, 16, 16]} />
            <meshStandardMaterial color={colors.eyeWhite} roughness={0.3} />
          </mesh>
          {!isAsleep && (
            <>
              {/* Iris */}
              <mesh position={[0, 0, 0.02]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshStandardMaterial color={colors.eyeIris} roughness={0.4} />
              </mesh>
              {/* Pupil */}
              <mesh position={[0, 0, 0.038]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshStandardMaterial color={colors.eyePupil} />
              </mesh>
              {/* Highlight */}
              <mesh position={[0.015, 0.015, 0.042]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial 
                  color={colors.eyeShine} 
                  emissive={colors.eyeShine} 
                  emissiveIntensity={0.5} 
                />
              </mesh>
            </>
          )}
          {/* Closed eye line for sleeping */}
          {isAsleep && (
            <mesh position={[0, 0, 0.01]} rotation={[0, 0, 0.1]}>
              <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
              <meshStandardMaterial color={colors.furDark} />
            </mesh>
          )}
        </group>

        {/* Right eye socket area */}
        <mesh position={[0.1, 0.04, 0.15]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.8} />
        </mesh>

        {/* Right eye */}
        <group position={[0.1, 0.04, 0.2]}>
          <mesh>
            <sphereGeometry args={[isAsleep ? 0.01 : 0.045, 16, 16]} />
            <meshStandardMaterial color={colors.eyeWhite} roughness={0.3} />
          </mesh>
          {!isAsleep && (
            <>
              {/* Iris */}
              <mesh position={[0, 0, 0.02]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshStandardMaterial color={colors.eyeIris} roughness={0.4} />
              </mesh>
              {/* Pupil */}
              <mesh position={[0, 0, 0.038]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshStandardMaterial color={colors.eyePupil} />
              </mesh>
              {/* Highlight */}
              <mesh position={[0.015, 0.015, 0.042]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial 
                  color={colors.eyeShine} 
                  emissive={colors.eyeShine} 
                  emissiveIntensity={0.5} 
                />
              </mesh>
            </>
          )}
          {/* Closed eye line for sleeping */}
          {isAsleep && (
            <mesh position={[0, 0, 0.01]} rotation={[0, 0, -0.1]}>
              <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
              <meshStandardMaterial color={colors.furDark} />
            </mesh>
          )}
        </group>

        {/* === EARS === */}
        {/* Left ear */}
        <group position={[-0.2, 0.08, -0.08]} rotation={[0.2, 0.3, -0.5]}>
          <mesh>
            <capsuleGeometry args={[0.08, 0.18, 8, 12]} />
            <meshStandardMaterial color={colors.furDark} roughness={0.9} />
          </mesh>
        </group>

        {/* Right ear */}
        <group position={[0.2, 0.08, -0.08]} rotation={[0.2, -0.3, 0.5]}>
          <mesh>
            <capsuleGeometry args={[0.08, 0.18, 8, 12]} />
            <meshStandardMaterial color={colors.furDark} roughness={0.9} />
          </mesh>
        </group>

        {/* === MOUTH === */}
        {/* Mouth line */}
        {!isAsleep && (
          <mesh position={[0, -0.12, 0.24]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color={colors.nose} />
          </mesh>
        )}

        {/* Open mouth with tongue for happy moods */}
        {isHappy && (
          <group position={[0, -0.14, 0.22]}>
            {/* Mouth opening */}
            <mesh rotation={[0.4, 0, 0]}>
              <sphereGeometry args={[0.06, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={colors.innerMouth} side={THREE.DoubleSide} />
            </mesh>
            {/* Tongue */}
            <mesh ref={tongueRef} position={[0, -0.08, 0.03]} rotation={[0.6, 0, 0]}>
              <capsuleGeometry args={[0.035, 0.06, 8, 8]} />
              <meshStandardMaterial color={colors.tongue} roughness={0.6} />
            </mesh>
          </group>
        )}
      </group>

      {/* === GROUND SHADOW === */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.1, 0.9, 1]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Floating hearts for love mood
function FloatingHearts() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Float
          key={i}
          speed={2 + i * 0.3}
          rotationIntensity={0.2}
          floatIntensity={1}
          position={[
            (i - 1) * 0.4,
            1.1 + i * 0.1,
            0.3
          ]}
        >
          <mesh scale={0.04 + i * 0.01}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial 
              color="#FF6B8A" 
              emissive="#FF6B8A"
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Sparkles for excited mood
function Sparkles() {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <Float
          key={i}
          speed={3 + i}
          rotationIntensity={2}
          floatIntensity={1.5}
          position={[
            Math.sin((i * Math.PI * 2) / 4) * 0.5,
            0.9 + (i % 2) * 0.2,
            Math.cos((i * Math.PI * 2) / 4) * 0.3 + 0.2
          ]}
        >
          <mesh scale={0.03}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#FFD700' : '#FFF4B8'}
              emissive={i % 2 === 0 ? '#FFD700' : '#FFF4B8'}
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Z's for sleeping mood
function SleepingZs() {
  return (
    <group position={[0.3, 0.9, 0.2]}>
      <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh scale={0.06}>
          <boxGeometry args={[1, 0.2, 0.1]} />
          <meshStandardMaterial color="#94A3B8" transparent opacity={0.6} />
        </mesh>
      </Float>
      <Float speed={0.5} rotationIntensity={0.08} floatIntensity={0.4} position={[0.15, 0.2, 0]}>
        <mesh scale={0.045}>
          <boxGeometry args={[1, 0.2, 0.1]} />
          <meshStandardMaterial color="#94A3B8" transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

// Main scene component
function Scene({ mood }: Puppy3DProps) {
  return (
    <>
      {/* Natural lighting */}
      <ambientLight intensity={0.6} color="#FFF8F0" />
      <directionalLight 
        position={[2, 4, 3]} 
        intensity={1.2} 
        color="#FFFFFF" 
        castShadow 
      />
      <pointLight position={[-2, 2, 2]} intensity={0.4} color="#FFE4C4" />
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.3]} />
      
      {/* Puppy positioned on ground */}
      <group position={[0, -0.3, 0]}>
        <PuppyBody mood={mood} />
      </group>

      {/* Mood effects */}
      {mood === 'love' && <FloatingHearts />}
      {mood === 'excited' && <Sparkles />}
      {mood === 'sleeping' && <SleepingZs />}

      {/* Controls - no auto-rotate, limited movement */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        autoRotate={false}
      />
      <Environment preset="apartment" />
    </>
  );
}

export function Puppy3DModel({ mood }: Puppy3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 2], fov: 40 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene mood={mood} />
    </Canvas>
  );
}
