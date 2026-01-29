import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GearProps {
  position: [number, number, number];
  explodedPosition: [number, number, number];
  isExploded: boolean;
  color: string;
  isSelected: boolean;
  isMoving: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  positionOffset: [number, number, number];
  wearLevel?: number;
  isVisible: boolean;
  radius?: number;
  thickness?: number;
  teeth?: number;
  rotationSpeed?: number;
  rotationAxis?: 'x' | 'y' | 'z';
}

// Create gear geometry
const createGearGeometry = (
  innerRadius: number,
  outerRadius: number,
  teeth: number,
  thickness: number
): THREE.ExtrudeGeometry => {
  const shape = new THREE.Shape();
  const toothDepth = (outerRadius - innerRadius) * 0.4;
  const toothWidth = (Math.PI * 2) / teeth / 2;

  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
    
    // Base of tooth
    const baseAngle1 = angle;
    const baseAngle2 = angle + toothWidth * 0.3;
    // Top of tooth
    const topAngle1 = angle + toothWidth * 0.4;
    const topAngle2 = angle + toothWidth * 0.6;
    // Back to base
    const baseAngle3 = angle + toothWidth * 0.7;
    const baseAngle4 = nextAngle;

    if (i === 0) {
      shape.moveTo(
        Math.cos(baseAngle1) * innerRadius,
        Math.sin(baseAngle1) * innerRadius
      );
    }

    // Draw tooth profile
    shape.lineTo(
      Math.cos(baseAngle2) * innerRadius,
      Math.sin(baseAngle2) * innerRadius
    );
    shape.lineTo(
      Math.cos(topAngle1) * outerRadius,
      Math.sin(topAngle1) * outerRadius
    );
    shape.lineTo(
      Math.cos(topAngle2) * outerRadius,
      Math.sin(topAngle2) * outerRadius
    );
    shape.lineTo(
      Math.cos(baseAngle3) * innerRadius,
      Math.sin(baseAngle3) * innerRadius
    );
    shape.lineTo(
      Math.cos(baseAngle4) * innerRadius,
      Math.sin(baseAngle4) * innerRadius
    );
  }

  shape.closePath();

  // Add center hole
  const holePath = new THREE.Path();
  const holeRadius = innerRadius * 0.3;
  holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

const GearComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  wearLevel = 0,
  isVisible,
  radius = 1,
  thickness = 0.3,
  teeth = 12,
  rotationSpeed = 1,
  rotationAxis = 'z',
}: GearProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  const geometry = useMemo(() => {
    return createGearGeometry(radius * 0.7, radius, teeth, thickness);
  }, [radius, teeth, thickness]);

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  const displayColor = useMemo(() => {
    if (wearLevel > 0.7) return '#ef4444';
    if (wearLevel > 0.4) return '#f59e0b';
    return color;
  }, [color, wearLevel]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth position interpolation
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    // Rotate the gear when not exploded
    if (!isExploded) {
      const speed = rotationSpeed * delta * 0.5;
      if (rotationAxis === 'x') meshRef.current.rotation.x += speed;
      else if (rotationAxis === 'y') meshRef.current.rotation.y += speed;
      else meshRef.current.rotation.z += speed;
    }

    // Selection/Moving pulse effect
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
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <meshStandardMaterial
        color={displayColor}
        metalness={0.8}
        roughness={0.2}
        emissive={isMoving ? '#22d3ee' : isSelected ? displayColor : '#000000'}
        emissiveIntensity={isMoving ? 0.6 : isSelected ? 0.4 : 0}
      />
    </mesh>
  );
};

// Shaft component
interface ShaftProps {
  position: [number, number, number];
  explodedPosition: [number, number, number];
  isExploded: boolean;
  color: string;
  isSelected: boolean;
  isMoving: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  positionOffset: [number, number, number];
  isVisible: boolean;
  length?: number;
  radius?: number;
}

const ShaftComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  isVisible,
  length = 2,
  radius = 0.1,
}: ShaftProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  const targetPos = useMemo(() => {
    const base = isExploded ? explodedPosition : position;
    return [
      base[0] + positionOffset[0],
      base[1] + positionOffset[1],
      base[2] + positionOffset[2],
    ] as [number, number, number];
  }, [isExploded, explodedPosition, position, positionOffset]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    currentPos.current.lerp(new THREE.Vector3(...targetPos), delta * 5);
    meshRef.current.position.copy(currentPos.current);

    if (!isExploded) {
      meshRef.current.rotation.y += delta * 0.5;
    }

    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.05;
      meshRef.current.scale.set(scale, 1, scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.03;
      meshRef.current.scale.set(scale, 1, scale);
    }
  });

  if (!isVisible) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
        emissiveIntensity={isMoving ? 0.6 : isSelected ? 0.3 : 0}
      />
    </mesh>
  );
};

// Housing component
interface HousingProps {
  position: [number, number, number];
  explodedPosition: [number, number, number];
  isExploded: boolean;
  color: string;
  isSelected: boolean;
  isMoving: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  positionOffset: [number, number, number];
  isVisible: boolean;
}

const HousingComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  isSelected,
  isMoving,
  onClick,
  onDoubleClick,
  positionOffset,
  isVisible,
}: HousingProps) => {
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
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.04;
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Main housing box */}
      <mesh>
        <boxGeometry args={[4, 0.3, 2.5]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={isMoving ? '#22d3ee' : isSelected ? color : '#000000'}
          emissiveIntensity={isMoving ? 0.5 : isSelected ? 0.2 : 0}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Mounting holes */}
      {[[-1.5, 0, -0.8], [-1.5, 0, 0.8], [1.5, 0, -0.8], [1.5, 0, 0.8]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
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
  type: 'gear' | 'shaft' | 'housing';
  props?: Record<string, number | string>;
}

interface GearMachineProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  visibleComponents: Record<string, boolean>;
  movingComponent: string | null;
  onDoubleClick: (id: string) => void;
  componentOffsets: Record<string, [number, number, number]>;
}

export const machineComponents: ComponentData[] = [
  {
    id: 'housing-base',
    name: 'Housing Base',
    position: [0, -1.2, 0],
    explodedPosition: [0, -3, 0],
    color: '#334155',
    description: 'Main structural housing and mounting base',
    type: 'housing',
  },
  {
    id: 'housing-top',
    name: 'Housing Cover',
    position: [0, 1.2, 0],
    explodedPosition: [0, 3.5, 0],
    color: '#475569',
    description: 'Protective top cover with ventilation',
    type: 'housing',
  },
  {
    id: 'main-shaft',
    name: 'Main Drive Shaft',
    position: [0, 0, 0],
    explodedPosition: [0, 0, 3],
    color: '#94a3b8',
    description: 'Primary power transmission shaft',
    type: 'shaft',
    props: { length: 2.5, radius: 0.12 },
  },
  {
    id: 'drive-gear',
    name: 'Drive Gear',
    position: [-1, 0, 0],
    explodedPosition: [-3, 0, 0],
    color: '#3b82f6',
    description: 'Main power input gear - 16 teeth',
    type: 'gear',
    props: { radius: 0.8, teeth: 16, rotationSpeed: 1 },
  },
  {
    id: 'driven-gear',
    name: 'Driven Gear',
    position: [1.1, 0, 0],
    explodedPosition: [3.5, 0, 0],
    color: '#22d3ee',
    description: 'Output gear - 20 teeth, speed reduction',
    type: 'gear',
    props: { radius: 1, teeth: 20, rotationSpeed: -0.8 },
  },
  {
    id: 'idler-gear',
    name: 'Idler Gear',
    position: [0, 0.9, 0],
    explodedPosition: [0, 2.5, -2],
    color: '#10b981',
    description: 'Intermediate gear for direction change',
    type: 'gear',
    props: { radius: 0.5, teeth: 10, rotationSpeed: 1.5 },
  },
  {
    id: 'input-shaft',
    name: 'Input Shaft',
    position: [-1, 0, 0],
    explodedPosition: [-3, 0, 2.5],
    color: '#e2e8f0',
    description: 'Motor connection shaft with keyway',
    type: 'shaft',
    props: { length: 1.8, radius: 0.08 },
  },
  {
    id: 'output-shaft',
    name: 'Output Shaft',
    position: [1.1, 0, 0],
    explodedPosition: [3.5, 0, 2.5],
    color: '#e2e8f0',
    description: 'Load connection shaft',
    type: 'shaft',
    props: { length: 1.8, radius: 0.1 },
  },
];

const GearMachine = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  componentWear,
  visibleComponents,
  movingComponent,
  onDoubleClick,
  componentOffsets,
}: GearMachineProps) => {
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
          isVisible: visibleComponents[component.id] !== false,
        };

        if (component.type === 'gear') {
          return (
            <GearComponent
              {...commonProps}
              wearLevel={componentWear[component.id] || 0}
              radius={component.props?.radius as number}
              teeth={component.props?.teeth as number}
              rotationSpeed={component.props?.rotationSpeed as number}
            />
          );
        }

        if (component.type === 'shaft') {
          return (
            <ShaftComponent
              {...commonProps}
              length={component.props?.length as number}
              radius={component.props?.radius as number}
            />
          );
        }

        if (component.type === 'housing') {
          return <HousingComponent {...commonProps} />;
        }

        return null;
      })}
    </group>
  );
};

export default GearMachine;
