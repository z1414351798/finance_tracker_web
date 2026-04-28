import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  MeshDistortMaterial, 
  Text, 
  Float, 
  Stars, 
  PerspectiveCamera,
  Environment
} from '@react-three/drei';

// --- Component: Individual 3D Node ---
function CategoryNode({ name, value, color, position, isAnomalous }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  // Scale node based on transaction value
  const scale = useMemo(() => Math.max(0.6, Math.log10(value + 1) * 0.8), [value]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Rotation logic
    mesh.current.rotation.x = mesh.current.rotation.y += 0.005;
    
    // Anomaly "Heartbeat" logic
    if (isAnomalous) {
      const shake = Math.sin(t * 20) * 0.1;
      mesh.current.position.x = position[0] + shake;
    }
  });

  return (
    <group position={position}>
      <Float speed={isAnomalous ? 4 : 1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={mesh}
          scale={scale}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={isAnomalous ? '#ff3e3e' : hovered ? '#ffffff' : color}
            speed={isAnomalous ? 6 : 2}
            distort={isAnomalous ? 0.6 : 0.3}
            radius={1}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        <Text
          position={[0, scale + 1, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          maxWidth={10}
          // Removing custom font URL to prevent loading errors; uses default
        >
          {`${name}\n$${value.toLocaleString()}`}
        </Text>
      </Float>
    </group>
  );
}

// --- Main Scene ---
export default function SpendingNebula() {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transactions/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const combined = [
            ...data.incomeCategories.map(c => ({ ...c, type: 'INCOME' })),
            ...data.expenseCategories.map(c => ({ ...c, type: 'EXPENSE' }))
          ];
          setGraphData(combined);
        }
      } catch (err) {
        console.error("3D Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nodes = useMemo(() => {
    return graphData.map((data, i) => {
      // Create a random distribution in 3D space
      const phi = Math.acos(-1 + (2 * i) / graphData.length);
      const theta = Math.sqrt(graphData.length * Math.PI) * phi;
      const r = 25; 

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      const color = data.type === 'INCOME' ? '#10b981' : '#e80c0c';
      // Logic: If expenses in a category exceed a threshold, mark as anomaly
      const isAnomalous = data.type === 'EXPENSE' && data.value > 2000;

      return { ...data, color, position: [x, y, z], isAnomalous };
    });
  }, [graphData]);

  if (loading) return (
    <div className="h-[600px] flex items-center justify-center bg-slate-950 text-blue-400 font-mono">
      INITIALIZING NEURAL FINANCE MESH...
    </div>
  );

  return (
    <div className="h-[600px] w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800">
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-white text-2xl font-black tracking-tighter italic">AI NEBULA v1.0</h2>
        <p className="text-blue-400 text-xs font-mono uppercase tracking-widest">Real-time Transaction Clusters</p>
      </div>

      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 60]} />
        <OrbitControls 
          enableZoom={true} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxDistance={100} 
          minDistance={10}
        />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#10b981" />
        
        {/* Corrected Stars Component */}
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
        
        {/* Map Nodes */}
        <group>
          {nodes.map((node, i) => (
            <CategoryNode key={i} {...node} />
          ))}
        </group>

        {/* Global Environment Bloom Effect */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}