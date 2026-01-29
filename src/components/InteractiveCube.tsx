import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Edges } from '@react-three/drei';
import * as THREE from 'three';

interface CubeComponentProps {
  position: [number, number, number];
  explodedPosition: [number, number, number];
  isExploded: boolean;
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  wearLevel?: number;
  isVisible: boolean;
}

const CubeComponent = ({
  position,
  explodedPosition,
  isExploded,
  color,
  name,
  isSelected,
  onClick,
  wearLevel = 0,
  isVisible,
}: CubeComponentProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  
  const targetPos = useMemo(() => {
    return isExploded ? explodedPosition : position;
  }, [isExploded, explodedPosition, position]);

  const displayColor = useMemo(() => {
    if (wearLevel > 0.7) return '#ef4444'; // Critical
    if (wearLevel > 0.4) return '#f59e0b'; // Warning
    return color;
  }, [color, wearLevel]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth position interpolation
    currentPos.current.lerp(
      new THREE.Vector3(...targetPos),
      delta * 5
    );
    meshRef.current.position.copy(currentPos.current);

    // Hover/selection pulse effect
    if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.02;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      <RoundedBox
        ref={meshRef}
        args={[0.9, 0.9, 0.9]}
        radius={0.08}
        smoothness={4}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
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
          metalness={0.6}
          roughness={0.2}
          emissive={isSelected ? displayColor : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
        <Edges
          threshold={15}
          color={isSelected ? '#22d3ee' : '#334155'}
          lineWidth={isSelected ? 2 : 1}
        />
      </RoundedBox>
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
}

interface InteractiveCubeProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  visibleComponents: Record<string, boolean>;
}

export const cubeComponents: ComponentData[] = [
  {
    id: 'core',
    name: 'Core Assembly',
    position: [0, 0, 0],
    explodedPosition: [0, 0, 0],
    color: '#3b82f6',
    description: 'Central processing unit housing',
  },
  {
    id: 'top-panel',
    name: 'Top Panel',
    position: [0, 1, 0],
    explodedPosition: [0, 2.5, 0],
    color: '#8b5cf6',
    description: 'Heat dissipation cover',
  },
  {
    id: 'bottom-panel',
    name: 'Bottom Panel',
    position: [0, -1, 0],
    explodedPosition: [0, -2.5, 0],
    color: '#8b5cf6',
    description: 'Mounting base plate',
  },
  {
    id: 'front-panel',
    name: 'Front Panel',
    position: [0, 0, 1],
    explodedPosition: [0, 0, 2.5],
    color: '#06b6d4',
    description: 'User interface panel',
  },
  {
    id: 'back-panel',
    name: 'Back Panel',
    position: [0, 0, -1],
    explodedPosition: [0, 0, -2.5],
    color: '#06b6d4',
    description: 'Connectivity module',
  },
  {
    id: 'left-bearing',
    name: 'Left Bearing',
    position: [-1, 0, 0],
    explodedPosition: [-2.5, 0, 0],
    color: '#10b981',
    description: 'Rotational bearing assembly',
  },
  {
    id: 'right-bearing',
    name: 'Right Bearing',
    position: [1, 0, 0],
    explodedPosition: [2.5, 0, 0],
    color: '#10b981',
    description: 'Rotational bearing assembly',
  },
];

const InteractiveCube = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  componentWear,
  visibleComponents,
}: InteractiveCubeProps) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {cubeComponents.map((component) => (
        <CubeComponent
          key={component.id}
          position={component.position}
          explodedPosition={component.explodedPosition}
          isExploded={isExploded}
          color={component.color}
          name={component.name}
          isSelected={selectedComponent === component.id}
          onClick={() => onSelectComponent(
            selectedComponent === component.id ? null : component.id
          )}
          wearLevel={componentWear[component.id] || 0}
          isVisible={visibleComponents[component.id] !== false}
        />
      ))}
    </group>
  );
};

export default InteractiveCube;
