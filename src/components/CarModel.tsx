import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CarPartProps {
  position: [number, number, number];
  explodedPosition: [number, number, number];
  isExploded: boolean;
  color: string;
  isSelected: boolean;
  isMoving: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  positionOffset: [number, number, number];
  rotationOffset: [number, number, number];
  isVisible: boolean;
  isOpen?: boolean;
}

// Create smooth car body shape
const createCarBodyGeometry = () => {
  const shape = new THREE.Shape();
  
  // Car body profile (side view) - more realistic sedan shape
  shape.moveTo(-1.8, 0);
  shape.lineTo(-1.8, 0.25);
  shape.quadraticCurveTo(-1.75, 0.4, -1.5, 0.45);
  shape.lineTo(-0.8, 0.45);
  shape.quadraticCurveTo(-0.6, 0.45, -0.5, 0.7);
  shape.lineTo(-0.3, 0.9);
  shape.quadraticCurveTo(-0.2, 0.95, 0, 0.95);
  shape.lineTo(0.5, 0.95);
  shape.quadraticCurveTo(0.7, 0.95, 0.8, 0.85);
  shape.lineTo(1.0, 0.65);
  shape.quadraticCurveTo(1.1, 0.55, 1.3, 0.5);
  shape.lineTo(1.6, 0.45);
  shape.quadraticCurveTo(1.8, 0.4, 1.85, 0.25);
  shape.lineTo(1.85, 0);
  shape.lineTo(-1.8, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 1.4,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.translate(0, 0, -0.7);
  return geometry;
};

// Create window geometry
const createWindowGeometry = () => {
  const shape = new THREE.Shape();
  
  // Window profile
  shape.moveTo(-0.45, 0.5);
  shape.lineTo(-0.25, 0.85);
  shape.quadraticCurveTo(-0.15, 0.9, 0, 0.9);
  shape.lineTo(0.45, 0.9);
  shape.quadraticCurveTo(0.6, 0.9, 0.7, 0.8);
  shape.lineTo(0.9, 0.55);
  shape.lineTo(-0.45, 0.55);
  shape.lineTo(-0.45, 0.5);

  const extrudeSettings = {
    steps: 1,
    depth: 1.3,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.translate(0, 0, -0.65);
  return geometry;
};

// Car Body Component
const CarBodyComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  rotationOffset,
  isVisible,
}: CarPartProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  const bodyGeometry = useMemo(() => createCarBodyGeometry(), []);
  const windowGeometry = useMemo(() => createWindowGeometry(), []);

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.03;
      meshRef.current.scale.setScalar(scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.02;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  if (!isVisible) return null;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={[rotationOffset[0], rotationOffset[1], rotationOffset[2]]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.15}
          emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
          emissiveIntensity={isMoving ? 0.3 : isSelected ? 0.15 : 0}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Windows */}
      <mesh geometry={windowGeometry} position={[0, 0.02, 0]}>
        <meshStandardMaterial
          color="#1a2a3a"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.85}
          envMapIntensity={2}
        />
      </mesh>

      {/* Front grille */}
      <mesh position={[1.82, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Headlights */}
      {[-0.45, 0.45].map((z, i) => (
        <group key={i} position={[1.8, 0.3, z]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16, 0, Math.PI]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffcc"
              emissiveIntensity={0.3}
              metalness={0.1}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Taillights */}
      {[-0.5, 0.5].map((z, i) => (
        <mesh key={i} position={[-1.78, 0.3, z]}>
          <boxGeometry args={[0.05, 0.12, 0.25]} />
          <meshStandardMaterial
            color="#ff2222"
            emissive="#ff0000"
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Side mirrors */}
      {[-0.78, 0.78].map((z, i) => (
        <group key={i} position={[0.6, 0.65, z]}>
          <mesh rotation={[0, z > 0 ? 0.3 : -0.3, 0]}>
            <boxGeometry args={[0.15, 0.08, 0.06]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Wheel wells - darker recesses */}
      {[[1.15, -0.7], [1.15, 0.7], [-1.15, -0.7], [-1.15, 0.7]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.15, pos[1]]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.15, 24, 1, true]} />
          <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// Door Component with opening animation
interface DoorProps extends CarPartProps {
  side: 'left' | 'right';
  doorPosition: 'front' | 'rear';
}

const createDoorGeometry = (isFront: boolean) => {
  const shape = new THREE.Shape();
  const length = isFront ? 0.55 : 0.5;
  
  // Door panel profile
  shape.moveTo(0, 0.08);
  shape.lineTo(0, 0.48);
  shape.quadraticCurveTo(0.02, 0.52, 0.08, 0.58);
  shape.lineTo(length - 0.08, isFront ? 0.65 : 0.6);
  shape.quadraticCurveTo(length, isFront ? 0.62 : 0.58, length, isFront ? 0.55 : 0.52);
  shape.lineTo(length, 0.08);
  shape.quadraticCurveTo(length, 0.02, length - 0.05, 0);
  shape.lineTo(0.05, 0);
  shape.quadraticCurveTo(0, 0.02, 0, 0.08);

  const extrudeSettings = {
    steps: 1,
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

const DoorComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  rotationOffset,
  isVisible,
  isOpen = false,
  side,
  doorPosition,
}: DoorProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentOpenAngle = useRef(0);

  const doorGeometry = useMemo(() => createDoorGeometry(doorPosition === 'front'), [doorPosition]);

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  const targetOpenAngle = isOpen ? (side === 'left' ? Math.PI / 2.5 : -Math.PI / 2.5) : 0;

  useFrame((_, delta) => {
    if (!meshRef.current || !pivotRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Smooth door opening animation
    currentOpenAngle.current += (targetOpenAngle - currentOpenAngle.current) * delta * 5;
    pivotRef.current.rotation.y = currentOpenAngle.current + rotationOffset[1];

    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.03;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  if (!isVisible) return null;

  const zPos = side === 'left' ? 0.72 : -0.72;
  const isFront = doorPosition === 'front';

  return (
    <group ref={meshRef} position={position}>
      {/* Pivot at door hinge */}
      <group 
        ref={pivotRef}
        position={[isFront ? 0.28 : -0.25, 0, zPos]}
        rotation={[rotationOffset[0], 0, rotationOffset[2]]}
      >
        <mesh
          geometry={doorGeometry}
          position={[0, 0, side === 'left' ? 0 : -0.04]}
          rotation={[side === 'left' ? -Math.PI / 2 : Math.PI / 2, 0, 0]}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.15}
            emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
            emissiveIntensity={isMoving ? 0.4 : isSelected ? 0.2 : 0}
          />
        </mesh>
        
        {/* Door window */}
        <mesh
          position={[isFront ? 0.25 : 0.22, 0.42, side === 'left' ? 0.01 : -0.05]}
          rotation={[side === 'left' ? -Math.PI / 2 : Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[isFront ? 0.38 : 0.35, 0.18]} />
          <meshStandardMaterial
            color="#1a2a3a"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Door handle */}
        <mesh position={[isFront ? 0.35 : 0.3, 0.28, side === 'left' ? 0.05 : -0.09]}>
          <boxGeometry args={[0.08, 0.025, 0.02]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

// Hood/Trunk Component
interface HatchProps extends CarPartProps {
  type: 'trunk' | 'hood';
}

const createHoodGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, 1.3);
  shape.quadraticCurveTo(0.1, 1.35, 0.2, 1.35);
  shape.lineTo(0.55, 1.3);
  shape.quadraticCurveTo(0.6, 1.25, 0.6, 1.15);
  shape.lineTo(0.65, 0.1);
  shape.quadraticCurveTo(0.65, 0.02, 0.58, 0);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

const createTrunkGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, 1.3);
  shape.quadraticCurveTo(0.1, 1.35, 0.2, 1.35);
  shape.lineTo(0.4, 1.3);
  shape.quadraticCurveTo(0.45, 1.25, 0.45, 1.15);
  shape.lineTo(0.5, 0.1);
  shape.quadraticCurveTo(0.5, 0.02, 0.43, 0);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

const HatchComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  rotationOffset,
  isVisible,
  isOpen = false,
  type,
}: HatchProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentOpenAngle = useRef(0);

  const geometry = useMemo(() => 
    type === 'hood' ? createHoodGeometry() : createTrunkGeometry(), 
  [type]);

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  const targetOpenAngle = isOpen ? (type === 'hood' ? -Math.PI / 4 : Math.PI / 3) : 0;

  useFrame((_, delta) => {
    if (!meshRef.current || !pivotRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    currentOpenAngle.current += (targetOpenAngle - currentOpenAngle.current) * delta * 5;
    pivotRef.current.rotation.z = currentOpenAngle.current + rotationOffset[2];

    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.03;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  if (!isVisible) return null;

  const hingeX = type === 'hood' ? 0.95 : -0.8;

  return (
    <group ref={meshRef} position={position}>
      <group 
        ref={pivotRef}
        position={[hingeX, 0.48, 0]}
        rotation={[rotationOffset[0], rotationOffset[1], 0]}
      >
        <mesh
          geometry={geometry}
          position={type === 'hood' ? [0, 0, -0.65] : [-0.45, 0, -0.65]}
          rotation={[0, 0, type === 'hood' ? -0.15 : 0.1]}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.15}
            emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
            emissiveIntensity={isMoving ? 0.4 : isSelected ? 0.2 : 0}
          />
        </mesh>
      </group>
    </group>
  );
};

// Wheel Component
interface WheelProps extends CarPartProps {
  rotationSpeed?: number;
}

const WheelComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  rotationOffset,
  isVisible,
  rotationSpeed = 2,
}: WheelProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  useFrame((_, delta) => {
    if (!meshRef.current || !wheelRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Rotate wheel when not exploded
    if (!isExploded) {
      wheelRef.current.rotation.x += rotationSpeed * delta;
    }

    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.03;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  if (!isVisible) return null;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={[rotationOffset[0], rotationOffset[1], rotationOffset[2]]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <group ref={wheelRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Tire */}
        <mesh>
          <torusGeometry args={[0.28, 0.1, 16, 32]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.1}
            roughness={0.9}
            emissive={isMoving ? '#22d3ee' : isSelected ? '#333' : '#000000'}
            emissiveIntensity={isMoving ? 0.2 : isSelected ? 0.1 : 0}
          />
        </mesh>
        
        {/* Rim */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 24]} />
          <meshStandardMaterial
            color={color}
            metalness={0.95}
            roughness={0.05}
            emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
            emissiveIntensity={isMoving ? 0.4 : isSelected ? 0.2 : 0}
          />
        </mesh>

        {/* Rim spokes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]} position={[0, 0.07, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.16]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}

        {/* Center cap */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#555555" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Brake disc visible through rim */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

export interface ComponentData {
  id: string;
  name: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  color: string;
  description: string;
  type: 'body' | 'door' | 'hatch' | 'wheel';
  props?: Record<string, number | string>;
}

export const machineComponents: ComponentData[] = [
  {
    id: 'car-body',
    name: 'Car Body',
    position: [0, 0.18, 0],
    explodedPosition: [0, 0.18, 0],
    color: '#2563eb',
    description: 'Unibody monocoque chassis with crumple zones',
    type: 'body',
  },
  {
    id: 'door-front-left',
    name: 'Front Left Door',
    position: [0, 0.18, 0],
    explodedPosition: [0, 0.18, 1.8],
    color: '#2563eb',
    description: 'Driver door with side impact protection',
    type: 'door',
    props: { side: 'left', doorPosition: 'front' },
  },
  {
    id: 'door-front-right',
    name: 'Front Right Door',
    position: [0, 0.18, 0],
    explodedPosition: [0, 0.18, -1.8],
    color: '#2563eb',
    description: 'Passenger door with power window',
    type: 'door',
    props: { side: 'right', doorPosition: 'front' },
  },
  {
    id: 'door-rear-left',
    name: 'Rear Left Door',
    position: [0, 0.18, 0],
    explodedPosition: [0, 0.18, 1.8],
    color: '#2563eb',
    description: 'Rear passenger door with child lock',
    type: 'door',
    props: { side: 'left', doorPosition: 'rear' },
  },
  {
    id: 'door-rear-right',
    name: 'Rear Right Door',
    position: [0, 0.18, 0],
    explodedPosition: [0, 0.18, -1.8],
    color: '#2563eb',
    description: 'Rear passenger door with child lock',
    type: 'door',
    props: { side: 'right', doorPosition: 'rear' },
  },
  {
    id: 'hood',
    name: 'Hood',
    position: [0, 0.18, 0],
    explodedPosition: [2.2, 1.0, 0],
    color: '#2563eb',
    description: 'Aluminum hood with hydraulic struts',
    type: 'hatch',
    props: { type: 'hood' },
  },
  {
    id: 'trunk',
    name: 'Trunk',
    position: [0, 0.18, 0],
    explodedPosition: [-2.2, 1.0, 0],
    color: '#2563eb',
    description: 'Rear trunk with power liftgate',
    type: 'hatch',
    props: { type: 'trunk' },
  },
  {
    id: 'wheel-front-left',
    name: 'Front Left Wheel',
    position: [1.15, 0.18, 0.78],
    explodedPosition: [1.8, 0.18, 1.8],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-front-right',
    name: 'Front Right Wheel',
    position: [1.15, 0.18, -0.78],
    explodedPosition: [1.8, 0.18, -1.8],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-rear-left',
    name: 'Rear Left Wheel',
    position: [-1.15, 0.18, 0.78],
    explodedPosition: [-1.8, 0.18, 1.8],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-rear-right',
    name: 'Rear Right Wheel',
    position: [-1.15, 0.18, -0.78],
    explodedPosition: [-1.8, 0.18, -1.8],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
];

interface CarModelProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  visibleComponents: Record<string, boolean>;
  movingComponent: string | null;
  onDoubleClick: (id: string) => void;
  componentOffsets: Record<string, [number, number, number]>;
  componentRotations: Record<string, [number, number, number]>;
  openParts: Record<string, boolean>;
}

const CarModel = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  visibleComponents,
  movingComponent,
  onDoubleClick,
  componentOffsets,
  componentRotations,
  openParts,
}: CarModelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {machineComponents.map((component) => {
        const commonProps = {
          key: component.id,
          position: component.position,
          explodedPosition: component.explodedPosition,
          isExploded,
          color: component.color,
          isSelected: selectedComponent === component.id,
          isMoving: movingComponent === component.id,
          onClick: () => onSelectComponent(selectedComponent === component.id ? null : component.id),
          onDoubleClick: () => onDoubleClick(component.id),
          positionOffset: componentOffsets[component.id] || [0, 0, 0] as [number, number, number],
          rotationOffset: componentRotations[component.id] || [0, 0, 0] as [number, number, number],
          isVisible: visibleComponents[component.id] !== false,
          isOpen: openParts[component.id] || false,
        };

        if (component.type === 'body') {
          return <CarBodyComponent {...commonProps} />;
        }

        if (component.type === 'door') {
          return (
            <DoorComponent
              {...commonProps}
              side={component.props?.side as 'left' | 'right'}
              doorPosition={component.props?.doorPosition as 'front' | 'rear'}
            />
          );
        }

        if (component.type === 'hatch') {
          return (
            <HatchComponent
              {...commonProps}
              type={component.props?.type as 'trunk' | 'hood'}
            />
          );
        }

        if (component.type === 'wheel') {
          return <WheelComponent {...commonProps} />;
        }

        return null;
      })}
    </group>
  );
};

export default CarModel;
