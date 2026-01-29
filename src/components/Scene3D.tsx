import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import InteractiveCube from './InteractiveCube';

interface Scene3DProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  visibleComponents: Record<string, boolean>;
  autoRotate: boolean;
}

const Scene3D = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  componentWear,
  visibleComponents,
  autoRotate,
}: Scene3DProps) => {
  return (
    <Canvas
      camera={{ position: [5, 4, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#8b5cf6" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Interactive Cube with float animation */}
      <Float
        speed={2}
        rotationIntensity={0.1}
        floatIntensity={0.3}
        floatingRange={[-0.1, 0.1]}
      >
        <InteractiveCube
          isExploded={isExploded}
          selectedComponent={selectedComponent}
          onSelectComponent={onSelectComponent}
          componentWear={componentWear}
          visibleComponents={visibleComponents}
        />
      </Float>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
        color="#22d3ee"
      />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={15}
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        makeDefault
      />
    </Canvas>
  );
};

export default Scene3D;
