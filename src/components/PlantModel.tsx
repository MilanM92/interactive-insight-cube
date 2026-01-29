import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export interface ComponentData {
  id: string;
  name: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  color: string;
  description: string;
  type: 'pot' | 'ground' | 'leaves' | 'root' | 'plant';
}

// Define plant components based on the MTL materials
export const machineComponents: ComponentData[] = [
  {
    id: 'plant-pot',
    name: 'Plant Pot',
    position: [0, 0, 0],
    explodedPosition: [0, -0.8, 0],
    color: '#8b7355',
    description: 'Ceramic pot with drainage system',
    type: 'pot',
  },
  {
    id: 'plant-ground',
    name: 'Soil',
    position: [0, 0, 0],
    explodedPosition: [0, -0.3, 0],
    color: '#3d2817',
    description: 'Nutrient-rich potting soil',
    type: 'ground',
  },
  {
    id: 'plant-leaves',
    name: 'Leaves',
    position: [0, 0, 0],
    explodedPosition: [0, 0.8, 0],
    color: '#228b22',
    description: 'Healthy green foliage',
    type: 'leaves',
  },
  {
    id: 'plant-roots',
    name: 'Root System',
    position: [0, 0, 0],
    explodedPosition: [0, 0.3, 0],
    color: '#654321',
    description: 'Extensive root network',
    type: 'root',
  },
];

interface PlantModelProps {
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

const PlantModel = ({
  isExploded,
  selectedComponent,
  onSelectComponent,
  visibleComponents,
  movingComponent,
  onDoubleClick,
  componentOffsets,
  componentRotations,
}: PlantModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentExplodeOffset = useRef(0);
  
  // Load the OBJ model
  const obj = useLoader(OBJLoader, '/models/indoor_plant_02.obj');
  
  // Clone and prepare the model with realistic colors
  const model = useMemo(() => {
    const cloned = obj.clone();
    
    // Scale the model to fit the scene
    cloned.scale.set(0.3, 0.3, 0.3);
    
    // Center the model
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    cloned.position.y = 0;
    
    // Apply realistic materials based on material names from MTL
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materialName = (child.material as THREE.Material).name || '';
        const meshName = child.name?.toLowerCase() || '';
        
        // Determine material properties based on material/mesh name
        let color = '#4a7c59'; // Default natural green
        let metalness = 0.05;
        let roughness = 0.8;
        let transparent = false;
        let opacity = 1.0;
        
        // Pot - terracotta/ceramic look
        if (materialName.includes('Pot') || materialName.includes('IDP_Pot') || meshName.includes('pot')) {
          color = '#c4836e'; // Terracotta orange-brown
          metalness = 0.1;
          roughness = 0.7;
        } 
        // Soil/Ground - dark rich soil
        else if (materialName.includes('ground') || materialName.includes('IDP_ground') || meshName.includes('ground') || meshName.includes('soil')) {
          color = '#3d2314'; // Dark rich soil brown
          metalness = 0.0;
          roughness = 1.0;
        } 
        // Leaves - vibrant green with slight variation
        else if (materialName.includes('leaves') || materialName.includes('IDP_leaves') || meshName.includes('leaf') || meshName.includes('leaves')) {
          // Vary green slightly for natural look
          const greens = ['#2d5a27', '#3a6b35', '#4a7c45', '#327a2e', '#458b3c'];
          color = greens[Math.floor(Math.random() * greens.length)];
          metalness = 0.05;
          roughness = 0.6;
          // Slight translucency for leaves
          transparent = true;
          opacity = 0.95;
        } 
        // Roots/Stems - woody brown
        else if (materialName.includes('root') || materialName.includes('IDP_root') || meshName.includes('root') || meshName.includes('stem') || meshName.includes('trunk')) {
          color = '#5c4033'; // Warm woody brown
          metalness = 0.05;
          roughness = 0.85;
        }
        // Material.006 - likely decorative element
        else if (materialName.includes('Material.006')) {
          color = '#8b7355'; // Neutral brown
          metalness = 0.1;
          roughness = 0.75;
        }
        
        // Create a new PBR material with realistic properties
        child.material = new THREE.MeshStandardMaterial({
          color,
          metalness,
          roughness,
          side: THREE.DoubleSide,
          transparent,
          opacity,
          flatShading: false,
        });
        
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return cloned;
  }, [obj]);

  // Handle selection highlighting
  useEffect(() => {
    if (!model) return;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const isSelected = selectedComponent === 'plant-full';
        const isMoving = movingComponent === 'plant-full';
        
        if (isMoving) {
          mat.emissive = new THREE.Color('#22d3ee');
          mat.emissiveIntensity = 0.3;
        } else if (isSelected) {
          mat.emissive = new THREE.Color(mat.color);
          mat.emissiveIntensity = 0.15;
        } else {
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0;
        }
      }
    });
  }, [model, selectedComponent, movingComponent]);

  // Animation frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Smooth explode animation
    const targetOffset = isExploded ? 1 : 0;
    currentExplodeOffset.current += (targetOffset - currentExplodeOffset.current) * delta * 3;
    
    // Apply custom offsets and rotations
    const offset = componentOffsets['plant-full'] || [0, 0, 0];
    const rotation = componentRotations['plant-full'] || [0, 0, 0];
    
    groupRef.current.position.set(offset[0], offset[1], offset[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    
    // Scale pulsing for selected/moving state
    const isSelected = selectedComponent === 'plant-full';
    const isMoving = movingComponent === 'plant-full';
    
    if (isMoving) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.03;
      groupRef.current.scale.setScalar(scale);
    } else if (isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.02;
      groupRef.current.scale.setScalar(scale);
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
    }
  });

  // Check visibility
  if (visibleComponents['plant-full'] === false) return null;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelectComponent(selectedComponent === 'plant-full' ? null : 'plant-full');
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick('plant-full');
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={model} />
    </group>
  );
};

export default PlantModel;
