import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Sky, 
  Environment, 
  Box, 
  ScrollControls, 
  useScroll, 
  PerspectiveCamera,
  AdaptiveEvents 
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- Component: A Single 3D Building ---
function Building({ date, netAmount, position, width }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  const height = useMemo(() => {
    const absVal = Math.abs(netAmount);
    if (absVal === 0) return 1.5;
    return 1.5 + Math.log10(absVal + 1) * 8; 
  }, [netAmount]);

  const color = netAmount >= 0 ? '#10b981' : '#ef4444';
  const yPos = netAmount >= 0 ? height / 2 : -height / 2;

  return (
    <group position={[position[0], yPos, position[1]]}>
      <Box
        ref={mesh}
        args={[width * 0.7, height, width * 0.7]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </Box>

      <Text
        position={[0, netAmount >= 0 ? height / 2 + 1.5 : height / 2 + 1, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
      >
        {`${date}\n$${netAmount.toLocaleString()}`}
      </Text>
    </group>
  );
}

// --- Component: Scene Logic ---
function SkylineScene({ data }) {
  const scroll = useScroll();
  const groupRef = useRef();

  const buildingData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const blockWidth = 8; 

    return sortedData.map((day, i) => {
      const dailyNet = (day.income || 0) - (day.expense || 0);
      return {
        date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        netAmount: dailyNet,
        position: [i * blockWidth, 0],
        width: blockWidth
      };
    });
  }, [data]);

  useFrame(() => {
    const offset = scroll.offset;
    const sceneLength = buildingData.length * 8;
    groupRef.current.position.x = -offset * (sceneLength - 30);
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[buildingData.length * 4, -0.1, 0]}>
        <planeGeometry args={[buildingData.length * 15, 300]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
      </mesh>
      <gridHelper 
        args={[buildingData.length * 15, 50, '#1e293b', '#0f172a']} 
        position={[buildingData.length * 4, 0, 0]} 
      />
      {buildingData.map((b, i) => (
        <Building key={i} {...b} />
      ))}
    </group>
  );
}

export default function FinancialSkylinePage() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transactions/daily-trends?days=30', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setTrends(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) return <div className="h-screen bg-black" />;

  return (
    <div className="relative w-full h-screen bg-neutral-950 overflow-hidden">
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <h1 className="text-white text-4xl font-black italic">SKYLINE_OS</h1>
        <p className="text-emerald-400 font-mono text-xs">
          Wheel: Zoom & Scroll City • Left Click: Rotate • Middle Click: Pan (Move View)
        </p>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 30, 60]} fov={50} />
        
        {/* OrbitControls Configuration */}
        <OrbitControls 
            makeDefault 
            enableZoom={true} 
            enablePan={true}
            // Maps the middle mouse button (scroll wheel press) to panning
            mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.PAN,
                RIGHT: THREE.MOUSE.PAN
            }}
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={5} 
            maxDistance={200} 
        />
        
        <AdaptiveEvents />
        <ambientLight intensity={0.4} />
        <pointLight position={[100, 100, 100]} intensity={1.5} />
        <Environment preset="city" />

        <ScrollControls pages={4} damping={0.1} horizontal={false}>
          <Sky sunPosition={[100, 20, 100]} />
          <SkylineScene data={trends} />
        </ScrollControls>

        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.8} intensity={0.8} mipmapBlur />
          <Noise opacity={0.02} />
          {/* Vignette has been removed for "Normal Sight" */}
        </EffectComposer>
      </Canvas>
    </div>
  );
}