import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import CarModel from './CarModel';

interface Scene3DProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  visibleComponents: Record<string, boolean>;
  autoRotate: boolean;
  movingComponent: string | null;
  onDoubleClick: (id: string) => void;
  componentOffsets: Record<string, [number, number, number]>;
  componentRotations: Record<string, [number, number, number]>;
  openParts: Record<string, boolean>;
}

const Scene3D = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  componentWear,
  visibleComponents,
  autoRotate,
  movingComponent,
  onDoubleClick,
  componentOffsets,
  componentRotations,
  openParts,
}: Scene3DProps) => {
  return (
    <Canvas
      camera={{ position: [5, 3, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#22d3ee" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#3b82f6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Car Model with float animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.03}
        floatIntensity={0.15}
        floatingRange={[-0.03, 0.03]}
      >
        <CarModel
          isExploded={isExploded}
          selectedComponent={selectedComponent}
          onSelectComponent={onSelectComponent}
          componentWear={componentWear}
          visibleComponents={visibleComponents}
          movingComponent={movingComponent}
          onDoubleClick={onDoubleClick}
          componentOffsets={componentOffsets}
          componentRotations={componentRotations}
          openParts={openParts}
        />
      </Float>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.5}
        scale={12}
        blur={2.5}
        far={4}
        color="#22d3ee"
      />

      {/* Grid helper for industrial feel */}
      <gridHelper args={[20, 20, '#1e3a5f', '#0f172a']} position={[0, -0.5, 0]} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        makeDefault
      />
    </Canvas>
  );
};

export default Scene3D;
