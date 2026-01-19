import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Puppy3DProps {
  mood: 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love';
}

// Main puppy body mesh
function PuppyBody({ mood }: Puppy3DProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Colors based on mood
  const colors = useMemo(() => {
    const baseColor = '#D4A574'; // Warm brown for puppy
    const noseColor = '#2D2D2D';
    const eyeColor = '#1a1a1a';
    const tongueColor = '#FF6B8A';
    const cheekColor = '#FFAA80';
    return { baseColor, noseColor, eyeColor, tongueColor, cheekColor };
  }, []);

  // Animation based on mood
  useFrame((state) => {
    if (!bodyRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Body bounce animation
    switch (mood) {
      case 'sleeping':
        bodyRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
        bodyRef.current.position.y = Math.sin(time * 0.3) * 0.02;
        break;
      case 'awake':
        bodyRef.current.position.y = Math.sin(time * 2) * 0.05;
        break;
      case 'smiling':
        bodyRef.current.position.y = Math.sin(time * 2.5) * 0.08;
        bodyRef.current.rotation.z = Math.sin(time * 2) * 0.03;
        break;
      case 'excited':
        bodyRef.current.position.y = Math.abs(Math.sin(time * 5)) * 0.15;
        bodyRef.current.rotation.z = Math.sin(time * 8) * 0.1;
        break;
      case 'love':
        bodyRef.current.position.y = Math.sin(time * 3) * 0.1;
        bodyRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.02);
        break;
    }

    // Tail wag
    if (tailRef.current) {
      const wagSpeed = mood === 'excited' ? 12 : mood === 'love' ? 8 : mood === 'sleeping' ? 1 : 4;
      const wagAmount = mood === 'excited' ? 0.8 : mood === 'love' ? 0.5 : mood === 'sleeping' ? 0.1 : 0.3;
      tailRef.current.rotation.z = Math.sin(time * wagSpeed) * wagAmount;
    }

    // Ear movement
    if (earLeftRef.current && earRightRef.current) {
      const earMove = mood === 'sleeping' ? 0.02 : mood === 'excited' ? 0.15 : 0.05;
      earLeftRef.current.rotation.z = Math.sin(time * 2 + 1) * earMove - 0.3;
      earRightRef.current.rotation.z = Math.sin(time * 2) * earMove + 0.3;
    }
  });

  return (
    <group 
      ref={bodyRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main body */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial
          color={colors.baseColor}
          roughness={0.8}
          distort={hovered ? 0.15 : 0.05}
          speed={2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.2, 0.4]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.22, 0.58]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={colors.noseColor} roughness={0.3} />
      </mesh>

      {/* Eyes */}
      <group>
        {/* Left eye */}
        <mesh position={[-0.15, 0.45, 0.38]}>
          <sphereGeometry args={[mood === 'sleeping' ? 0.02 : 0.08, 16, 16]} />
          <meshStandardMaterial color={colors.eyeColor} />
        </mesh>
        {mood !== 'sleeping' && (
          <mesh position={[-0.14, 0.47, 0.44]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
        )}

        {/* Right eye */}
        <mesh position={[0.15, 0.45, 0.38]}>
          <sphereGeometry args={[mood === 'sleeping' ? 0.02 : 0.08, 16, 16]} />
          <meshStandardMaterial color={colors.eyeColor} />
        </mesh>
        {mood !== 'sleeping' && (
          <mesh position={[0.16, 0.47, 0.44]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
        )}
      </group>

      {/* Cheeks */}
      {(mood === 'smiling' || mood === 'love' || mood === 'excited') && (
        <>
          <mesh position={[-0.25, 0.3, 0.35]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={colors.cheekColor} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.25, 0.3, 0.35]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={colors.cheekColor} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Tongue (for smiling/excited) */}
      {(mood === 'smiling' || mood === 'excited') && (
        <mesh position={[0, 0.1, 0.55]} rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.1, 8, 16]} />
          <meshStandardMaterial color={colors.tongueColor} roughness={0.5} />
        </mesh>
      )}

      {/* Ears */}
      <mesh ref={earLeftRef} position={[-0.35, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>
      <mesh ref={earRightRef} position={[0.35, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, -0.4, -0.5]} rotation={[0.5, 0, 0]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>

      {/* Front paws */}
      <mesh position={[-0.25, -0.75, 0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.25, -0.75, 0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>

      {/* Back paws */}
      <mesh position={[-0.3, -0.75, -0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.3, -0.75, -0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={colors.baseColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Floating hearts for love mood
function FloatingHearts() {
  const heartsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (heartsRef.current) {
      heartsRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={heartsRef}>
      {[0, 1, 2].map((i) => (
        <Float
          key={i}
          speed={2 + i}
          rotationIntensity={0.5}
          floatIntensity={1}
          position={[
            Math.sin((i * Math.PI * 2) / 3) * 0.8,
            0.8 + i * 0.2,
            Math.cos((i * Math.PI * 2) / 3) * 0.8
          ]}
        >
          <mesh scale={0.1 + i * 0.02}>
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
  const sparklesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (sparklesRef.current) {
      sparklesRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={sparklesRef}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Float
          key={i}
          speed={3 + i}
          rotationIntensity={2}
          floatIntensity={2}
          position={[
            Math.sin((i * Math.PI * 2) / 5) * 1,
            0.5 + Math.random() * 0.5,
            Math.cos((i * Math.PI * 2) / 5) * 1
          ]}
        >
          <mesh scale={0.05}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
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
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0.6, 0.8, 0]}>
      <mesh scale={0.15}>
        <torusGeometry args={[1, 0.3, 8, 16]} />
        <meshStandardMaterial 
          color="#9CA3AF" 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// Main scene component
function Scene({ mood }: Puppy3DProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 3, 5]} intensity={0.4} color="#FFE4C4" />
      
      <Float
        speed={mood === 'sleeping' ? 0.5 : mood === 'excited' ? 3 : 1.5}
        rotationIntensity={mood === 'sleeping' ? 0.1 : 0.3}
        floatIntensity={mood === 'excited' ? 0.5 : 0.2}
      >
        <PuppyBody mood={mood} />
      </Float>

      {mood === 'love' && <FloatingHearts />}
      {mood === 'excited' && <Sparkles />}
      {mood === 'sleeping' && <SleepingZs />}

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={mood === 'excited' ? 4 : mood === 'sleeping' ? 0.5 : 1}
      />
      <Environment preset="sunset" />
    </>
  );
}

export function Puppy3DModel({ mood }: Puppy3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene mood={mood} />
    </Canvas>
  );
}
