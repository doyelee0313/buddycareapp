import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Puppy3DProps {
  mood: 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love';
}

// Cute golden retriever puppy body
function PuppyBody({ mood }: Puppy3DProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  const tongueRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Golden retriever colors - matching the cute 2D style
  const colors = useMemo(() => ({
    furMain: '#F5D89A',      // Golden cream fur
    furLight: '#FFF2CC',     // Lighter accents
    furDark: '#E8C878',      // Darker shading areas
    nose: '#3D2817',         // Dark brown nose
    eyeWhite: '#FFFFFF',
    eyeIris: '#8B4513',      // Warm brown eyes
    eyePupil: '#1a1a1a',
    eyeShine: '#FFFFFF',
    tongue: '#FF9CAD',       // Pink tongue
    cheek: '#FFCAB0',        // Rosy cheeks
    innerEar: '#FFDFCC',     // Inner ear pink
    eyebrow: '#C9A65C',      // Eyebrow color
  }), []);

  // Animation based on mood
  useFrame((state) => {
    if (!bodyRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Body bounce animation - more bouncy and cute
    switch (mood) {
      case 'sleeping':
        bodyRef.current.rotation.z = Math.sin(time * 0.5) * 0.03;
        bodyRef.current.position.y = Math.sin(time * 0.4) * 0.015;
        break;
      case 'awake':
        bodyRef.current.position.y = Math.sin(time * 2.5) * 0.04;
        bodyRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
        break;
      case 'smiling':
        bodyRef.current.position.y = Math.sin(time * 3) * 0.06;
        bodyRef.current.rotation.z = Math.sin(time * 2) * 0.04;
        break;
      case 'excited':
        bodyRef.current.position.y = Math.abs(Math.sin(time * 6)) * 0.12;
        bodyRef.current.rotation.z = Math.sin(time * 10) * 0.08;
        break;
      case 'love':
        bodyRef.current.position.y = Math.sin(time * 3.5) * 0.08;
        bodyRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.03);
        break;
    }

    // Tail wag - more enthusiastic
    if (tailRef.current) {
      const wagSpeed = mood === 'excited' ? 15 : mood === 'love' ? 10 : mood === 'sleeping' ? 0.5 : 6;
      const wagAmount = mood === 'excited' ? 1.0 : mood === 'love' ? 0.7 : mood === 'sleeping' ? 0.05 : 0.4;
      tailRef.current.rotation.z = Math.sin(time * wagSpeed) * wagAmount;
      tailRef.current.rotation.x = 0.3 + Math.sin(time * wagSpeed * 0.5) * 0.1;
    }

    // Ear movement - floppy and cute
    if (earLeftRef.current && earRightRef.current) {
      const earMove = mood === 'sleeping' ? 0.01 : mood === 'excited' ? 0.12 : 0.05;
      const earBounce = mood === 'excited' ? Math.abs(Math.sin(time * 6)) * 0.1 : 0;
      earLeftRef.current.rotation.z = -0.4 + Math.sin(time * 2 + 1) * earMove;
      earLeftRef.current.position.y = 0.15 + earBounce;
      earRightRef.current.rotation.z = 0.4 + Math.sin(time * 2) * earMove;
      earRightRef.current.position.y = 0.15 + earBounce;
    }

    // Tongue movement for happy moods
    if (tongueRef.current && (mood === 'smiling' || mood === 'excited')) {
      tongueRef.current.position.y = -0.12 + Math.sin(time * 4) * 0.02;
      tongueRef.current.scale.y = 1 + Math.sin(time * 3) * 0.1;
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
      {/* Main body - chubby and round */}
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <MeshDistortMaterial
          color={colors.furMain}
          roughness={0.9}
          distort={hovered ? 0.08 : 0.02}
          speed={2}
        />
      </mesh>

      {/* Chest fluff - lighter color */}
      <mesh position={[0, -0.25, 0.25]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>

      {/* Head - big and round for cuteness */}
      <mesh position={[0, 0.25, 0.05]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={colors.furMain} roughness={0.85} />
      </mesh>

      {/* Cheek puffs - make face rounder */}
      <mesh position={[-0.28, 0.12, 0.25]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={colors.furMain} roughness={0.85} />
      </mesh>
      <mesh position={[0.28, 0.12, 0.25]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={colors.furMain} roughness={0.85} />
      </mesh>

      {/* Snout - short and cute */}
      <mesh position={[0, 0.08, 0.38]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.85} />
      </mesh>

      {/* Nose - big shiny nose */}
      <mesh position={[0, 0.12, 0.52]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={colors.nose} roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Eyebrows - expressive */}
      <mesh position={[-0.18, 0.48, 0.3]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
        <meshStandardMaterial color={colors.eyebrow} roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.48, 0.3]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
        <meshStandardMaterial color={colors.eyebrow} roughness={0.8} />
      </mesh>

      {/* Eyes - BIG adorable eyes */}
      <group>
        {/* Left eye */}
        <group position={[-0.16, 0.32, 0.35]}>
          {/* Eye white */}
          <mesh>
            <sphereGeometry args={[isAsleep ? 0.02 : 0.12, 32, 32]} />
            <meshStandardMaterial color={colors.eyeWhite} roughness={0.3} />
          </mesh>
          {!isAsleep && (
            <>
              {/* Iris */}
              <mesh position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial color={colors.eyeIris} roughness={0.4} />
              </mesh>
              {/* Pupil */}
              <mesh position={[0, 0, 0.1]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color={colors.eyePupil} />
              </mesh>
              {/* Shine - big sparkle */}
              <mesh position={[0.03, 0.04, 0.11]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={colors.eyeShine} emissive={colors.eyeShine} emissiveIntensity={0.8} />
              </mesh>
              {/* Small shine */}
              <mesh position={[-0.02, -0.02, 0.11]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color={colors.eyeShine} emissive={colors.eyeShine} emissiveIntensity={0.5} />
              </mesh>
            </>
          )}
        </group>

        {/* Right eye */}
        <group position={[0.16, 0.32, 0.35]}>
          {/* Eye white */}
          <mesh>
            <sphereGeometry args={[isAsleep ? 0.02 : 0.12, 32, 32]} />
            <meshStandardMaterial color={colors.eyeWhite} roughness={0.3} />
          </mesh>
          {!isAsleep && (
            <>
              {/* Iris */}
              <mesh position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial color={colors.eyeIris} roughness={0.4} />
              </mesh>
              {/* Pupil */}
              <mesh position={[0, 0, 0.1]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color={colors.eyePupil} />
              </mesh>
              {/* Shine - big sparkle */}
              <mesh position={[0.03, 0.04, 0.11]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={colors.eyeShine} emissive={colors.eyeShine} emissiveIntensity={0.8} />
              </mesh>
              {/* Small shine */}
              <mesh position={[-0.02, -0.02, 0.11]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color={colors.eyeShine} emissive={colors.eyeShine} emissiveIntensity={0.5} />
              </mesh>
            </>
          )}
        </group>
      </group>

      {/* Rosy cheeks for happy moods */}
      {isHappy && (
        <>
          <mesh position={[-0.3, 0.18, 0.32]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={colors.cheek} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.3, 0.18, 0.32]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={colors.cheek} transparent opacity={0.7} />
          </mesh>
        </>
      )}

      {/* Mouth / Smile line */}
      {!isAsleep && (
        <mesh position={[0, 0.02, 0.48]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color={colors.nose} />
        </mesh>
      )}

      {/* Tongue - sticking out for happy moods */}
      {isHappy && (
        <mesh ref={tongueRef} position={[0, -0.05, 0.5]} rotation={[0.4, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.08, 8, 16]} />
          <meshStandardMaterial color={colors.tongue} roughness={0.5} />
        </mesh>
      )}

      {/* Ears - big floppy golden retriever ears */}
      <group>
        {/* Left ear */}
        <mesh ref={earLeftRef} position={[-0.38, 0.15, -0.05]} rotation={[0.3, 0.2, -0.4]}>
          <capsuleGeometry args={[0.12, 0.25, 8, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.9} />
        </mesh>
        {/* Left ear inner */}
        <mesh position={[-0.35, 0.1, 0.02]} rotation={[0.3, 0.2, -0.4]}>
          <capsuleGeometry args={[0.06, 0.12, 8, 16]} />
          <meshStandardMaterial color={colors.innerEar} roughness={0.9} />
        </mesh>

        {/* Right ear */}
        <mesh ref={earRightRef} position={[0.38, 0.15, -0.05]} rotation={[0.3, -0.2, 0.4]}>
          <capsuleGeometry args={[0.12, 0.25, 8, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.9} />
        </mesh>
        {/* Right ear inner */}
        <mesh position={[0.35, 0.1, 0.02]} rotation={[0.3, -0.2, 0.4]}>
          <capsuleGeometry args={[0.06, 0.12, 8, 16]} />
          <meshStandardMaterial color={colors.innerEar} roughness={0.9} />
        </mesh>
      </group>

      {/* Tail - fluffy golden retriever tail */}
      <group position={[0, -0.35, -0.4]}>
        <mesh ref={tailRef} rotation={[-0.3, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.25, 8, 16]} />
          <meshStandardMaterial color={colors.furDark} roughness={0.9} />
        </mesh>
        {/* Tail fluff */}
        <mesh position={[0, 0.15, -0.08]} rotation={[-0.5, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={colors.furMain} roughness={0.9} />
        </mesh>
      </group>

      {/* Front paws - chubby and cute */}
      <mesh position={[-0.18, -0.65, 0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>
      <mesh position={[0.18, -0.65, 0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>
      {/* Paw pads hint */}
      <mesh position={[-0.18, -0.7, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.innerEar} roughness={0.7} />
      </mesh>
      <mesh position={[0.18, -0.7, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.innerEar} roughness={0.7} />
      </mesh>

      {/* Back paws */}
      <mesh position={[-0.22, -0.65, -0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>
      <mesh position={[0.22, -0.65, -0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={colors.furLight} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Floating hearts for love mood
function FloatingHearts() {
  const heartsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (heartsRef.current) {
      heartsRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={heartsRef}>
      {[0, 1, 2, 3].map((i) => (
        <Float
          key={i}
          speed={2 + i * 0.5}
          rotationIntensity={0.3}
          floatIntensity={1.5}
          position={[
            Math.sin((i * Math.PI * 2) / 4) * 0.7,
            0.6 + i * 0.15,
            Math.cos((i * Math.PI * 2) / 4) * 0.7
          ]}
        >
          <mesh scale={0.06 + i * 0.015}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial 
              color="#FF6B8A" 
              emissive="#FF6B8A"
              emissiveIntensity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Sparkles for excited mood
function Sparkles() {
  const sparklesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (sparklesRef.current) {
      sparklesRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group ref={sparklesRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Float
          key={i}
          speed={4 + i}
          rotationIntensity={3}
          floatIntensity={2}
          position={[
            Math.sin((i * Math.PI * 2) / 6) * 0.9,
            0.4 + (i % 3) * 0.25,
            Math.cos((i * Math.PI * 2) / 6) * 0.9
          ]}
        >
          <mesh scale={0.04}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#FFD700' : '#FFF4B8'}
              emissive={i % 2 === 0 ? '#FFD700' : '#FFF4B8'}
              emissiveIntensity={1.2}
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
    <>
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.8} position={[0.5, 0.6, 0.2]}>
        <mesh scale={0.08}>
          <boxGeometry args={[1, 0.2, 0.1]} />
          <meshStandardMaterial 
            color="#A0AEC0" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      </Float>
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.6} position={[0.65, 0.8, 0.15]}>
        <mesh scale={0.06}>
          <boxGeometry args={[1, 0.2, 0.1]} />
          <meshStandardMaterial 
            color="#A0AEC0" 
            transparent 
            opacity={0.5}
          />
        </mesh>
      </Float>
    </>
  );
}

// Main scene component
function Scene({ mood }: Puppy3DProps) {
  return (
    <>
      {/* Warm, soft lighting for cute aesthetic */}
      <ambientLight intensity={0.8} color="#FFF8E7" />
      <directionalLight position={[3, 5, 5]} intensity={1} color="#FFFFFF" castShadow />
      <pointLight position={[-3, 2, 4]} intensity={0.5} color="#FFE4C4" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#FFF0DB" />
      
      <Float
        speed={mood === 'sleeping' ? 0.3 : mood === 'excited' ? 2.5 : 1.2}
        rotationIntensity={mood === 'sleeping' ? 0.05 : 0.15}
        floatIntensity={mood === 'excited' ? 0.4 : 0.15}
      >
        <PuppyBody mood={mood} />
      </Float>

      {mood === 'love' && <FloatingHearts />}
      {mood === 'excited' && <Sparkles />}
      {mood === 'sleeping' && <SleepingZs />}

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={mood === 'excited' ? 3 : mood === 'sleeping' ? 0.3 : 0.8}
      />
      <Environment preset="apartment" />
    </>
  );
}

export function Puppy3DModel({ mood }: Puppy3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.5], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene mood={mood} />
    </Canvas>
  );
}
