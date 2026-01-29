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
      {/* Main body base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 0.6, 1.6]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
          emissiveIntensity={isMoving ? 0.4 : isSelected ? 0.2 : 0}
        />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2, 0.5, 1.5]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
          emissiveIntensity={isMoving ? 0.4 : isSelected ? 0.2 : 0}
        />
      </mesh>
      {/* Front windshield area */}
      <mesh position={[0.8, 0.55, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.6, 0.5, 1.4]} />
        <meshStandardMaterial
          color="#1e3a5f"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Rear windshield area */}
      <mesh position={[-0.8, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.6, 0.5, 1.4]} />
        <meshStandardMaterial
          color="#1e3a5f"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

// Door Component with opening animation
interface DoorProps extends CarPartProps {
  side: 'left' | 'right';
  doorPosition: 'front' | 'rear';
}

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
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentOpenAngle = useRef(0);

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  const targetOpenAngle = isOpen ? (side === 'left' ? -Math.PI / 3 : Math.PI / 3) : 0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Smooth door opening animation
    currentOpenAngle.current += (targetOpenAngle - currentOpenAngle.current) * delta * 5;
    
    // Apply rotation based on side
    const zOffset = side === 'left' ? 0.75 : -0.75;
    meshRef.current.rotation.set(
      rotationOffset[0],
      currentOpenAngle.current + rotationOffset[1],
      rotationOffset[2]
    );

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

  const hingeOffset = side === 'left' ? -0.4 : 0.4;

  return (
    <group
      ref={meshRef}
      position={position}
    >
      {/* Pivot point for door hinge */}
      <group position={[hingeOffset, 0, 0]}>
        <mesh
          position={[-hingeOffset, 0, 0]}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[0.8, 0.55, 0.08]} />
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
            emissiveIntensity={isMoving ? 0.5 : isSelected ? 0.3 : 0}
          />
        </mesh>
        {/* Door window */}
        <mesh position={[-hingeOffset, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.35, 0.06]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>
        {/* Door handle */}
        <mesh position={[-hingeOffset + 0.2, 0, side === 'left' ? -0.06 : 0.06]}>
          <boxGeometry args={[0.12, 0.04, 0.03]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

// Trunk/Hood Component with opening animation
interface HatchProps extends CarPartProps {
  type: 'trunk' | 'hood';
}

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
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentOpenAngle = useRef(0);

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
    if (!meshRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Smooth opening animation
    currentOpenAngle.current += (targetOpenAngle - currentOpenAngle.current) * delta * 5;
    
    meshRef.current.rotation.set(
      rotationOffset[0],
      rotationOffset[1],
      currentOpenAngle.current + rotationOffset[2]
    );

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

  const hingeOffset = type === 'hood' ? -0.4 : 0.4;

  return (
    <group ref={meshRef} position={position}>
      <group position={[hingeOffset, 0, 0]}>
        <mesh
          position={[-hingeOffset, 0, 0]}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[0.8, 0.1, 1.4]} />
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
            emissiveIntensity={isMoving ? 0.5 : isSelected ? 0.3 : 0}
          />
        </mesh>
      </group>
    </group>
  );
};

// Wheel Component with rotation
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
  rotationSpeed = 1,
}: WheelProps) => {
  const meshRef = useRef<THREE.Group>(null);
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
    if (!meshRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Rotate wheel when not exploded
    if (!isExploded) {
      meshRef.current.rotation.z += rotationSpeed * delta;
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
      rotation={[Math.PI / 2 + rotationOffset[0], rotationOffset[1], rotationOffset[2]]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Tire */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.8}
          emissive={isMoving ? '#22d3ee' : isSelected ? '#333' : '#000000'}
          emissiveIntensity={isMoving ? 0.3 : isSelected ? 0.2 : 0}
        />
      </mesh>
      {/* Rim */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.27, 12]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
          emissiveIntensity={isMoving ? 0.5 : isSelected ? 0.3 : 0}
        />
      </mesh>
      {/* Hub cap */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
      </mesh>
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
    position: [0, 0.3, 0],
    explodedPosition: [0, 0.3, 0],
    color: '#3b82f6',
    description: 'Main unibody chassis with integrated cabin structure',
    type: 'body',
  },
  {
    id: 'door-front-left',
    name: 'Front Left Door',
    position: [0.3, 0.25, 0.8],
    explodedPosition: [0.3, 0.25, 2.5],
    color: '#3b82f6',
    description: 'Driver side front door with power window',
    type: 'door',
    props: { side: 'left', doorPosition: 'front' },
  },
  {
    id: 'door-front-right',
    name: 'Front Right Door',
    position: [0.3, 0.25, -0.8],
    explodedPosition: [0.3, 0.25, -2.5],
    color: '#3b82f6',
    description: 'Passenger side front door with power window',
    type: 'door',
    props: { side: 'right', doorPosition: 'front' },
  },
  {
    id: 'door-rear-left',
    name: 'Rear Left Door',
    position: [-0.5, 0.25, 0.8],
    explodedPosition: [-0.5, 0.25, 2.5],
    color: '#3b82f6',
    description: 'Rear passenger left door',
    type: 'door',
    props: { side: 'left', doorPosition: 'rear' },
  },
  {
    id: 'door-rear-right',
    name: 'Rear Right Door',
    position: [-0.5, 0.25, -0.8],
    explodedPosition: [-0.5, 0.25, -2.5],
    color: '#3b82f6',
    description: 'Rear passenger right door',
    type: 'door',
    props: { side: 'right', doorPosition: 'rear' },
  },
  {
    id: 'hood',
    name: 'Hood',
    position: [1.35, 0.35, 0],
    explodedPosition: [2.8, 1.2, 0],
    color: '#3b82f6',
    description: 'Engine compartment hood with hydraulic struts',
    type: 'hatch',
    props: { type: 'hood' },
  },
  {
    id: 'trunk',
    name: 'Trunk',
    position: [-1.35, 0.35, 0],
    explodedPosition: [-2.8, 1.2, 0],
    color: '#3b82f6',
    description: 'Rear cargo trunk with power liftgate',
    type: 'hatch',
    props: { type: 'trunk' },
  },
  {
    id: 'wheel-front-left',
    name: 'Front Left Wheel',
    position: [1.1, -0.05, 0.85],
    explodedPosition: [2, -0.05, 2],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-front-right',
    name: 'Front Right Wheel',
    position: [1.1, -0.05, -0.85],
    explodedPosition: [2, -0.05, -2],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-rear-left',
    name: 'Rear Left Wheel',
    position: [-1.1, -0.05, 0.85],
    explodedPosition: [-2, -0.05, 2],
    color: '#94a3b8',
    description: '18" alloy wheel with performance tire',
    type: 'wheel',
  },
  {
    id: 'wheel-rear-right',
    name: 'Rear Right Wheel',
    position: [-1.1, -0.05, -0.85],
    explodedPosition: [-2, -0.05, -2],
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
