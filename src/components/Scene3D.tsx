import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import PlantModel from './PlantModel';

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
      camera={{ position: [3, 2, 3], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#22d3ee" />
      <pointLight position={[5, 2, 5]} intensity={0.2} color="#3b82f6" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Environment for reflections */}
      <Environment preset="apartment" />

      {/* Plant Model with float animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.02}
        floatIntensity={0.1}
        floatingRange={[-0.02, 0.02]}
      >
        <PlantModel
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
        opacity={0.4}
        scale={8}
        blur={2}
        far={3}
        color="#228b22"
      />

      {/* Grid helper */}
      <gridHelper args={[15, 15, '#1e3a5f', '#0f172a']} position={[0, -0.5, 0]} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        makeDefault
      />
    </Canvas>
  );
};

export default Scene3D;
