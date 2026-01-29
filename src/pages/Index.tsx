import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import StatusOverlay from '@/components/StatusOverlay';
import { machineComponents } from '@/components/CarModel';
import { Loader2, Car, Move } from 'lucide-react';

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Car className="w-12 h-12 text-primary animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground">Loading 3D Car Model...</p>
    </div>
  </div>
);

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [movingComponent, setMovingComponent] = useState<string | null>(null);
  
  // Custom position offsets for components
  const [componentOffsets, setComponentOffsets] = useState<Record<string, [number, number, number]>>({});
  
  // Custom rotation offsets for components
  const [componentRotations, setComponentRotations] = useState<Record<string, [number, number, number]>>({});
  
  // Open/closed state for doors and hatches
  const [openParts, setOpenParts] = useState<Record<string, boolean>>({});
  
  // Initialize wear levels (keeping for compatibility, though car doesn't use wear)
  const [componentWear, setComponentWear] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    machineComponents.forEach(c => { initial[c.id] = 0; });
    return initial;
  });

  // Initialize visibility for all components
  const [visibleComponents, setVisibleComponents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    machineComponents.forEach(c => { initial[c.id] = true; });
    return initial;
  });

  // Handle double-click to enable moving mode
  const handleDoubleClick = useCallback((id: string) => {
    setMovingComponent(prev => prev === id ? null : id);
    setSelectedComponent(id);
  }, []);

  // Handle keyboard movement and rotation
  useEffect(() => {
    if (!movingComponent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const moveStep = e.shiftKey ? 0.5 : 0.1;
      const rotateStep = e.shiftKey ? 0.3 : 0.1;
      const currentOffset = componentOffsets[movingComponent] || [0, 0, 0];
      const currentRotation = componentRotations[movingComponent] || [0, 0, 0];
      let newOffset: [number, number, number] = [...currentOffset];
      let newRotation: [number, number, number] = [...currentRotation];
      let changed = false;

      switch (e.key) {
        // Position controls (Arrow keys)
        case 'ArrowLeft':
          newOffset[0] -= moveStep;
          changed = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
          newOffset[0] += moveStep;
          changed = true;
          e.preventDefault();
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            newOffset[2] -= moveStep;
          } else {
            newOffset[1] += moveStep;
          }
          changed = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            newOffset[2] += moveStep;
          } else {
            newOffset[1] -= moveStep;
          }
          changed = true;
          e.preventDefault();
          break;
        
        // Rotation controls (Q/E for Z, W/S for X, A/D for Y)
        case 'q':
        case 'Q':
          newRotation[2] -= rotateStep;
          changed = true;
          e.preventDefault();
          break;
        case 'e':
        case 'E':
          newRotation[2] += rotateStep;
          changed = true;
          e.preventDefault();
          break;
        case 'w':
        case 'W':
          newRotation[0] -= rotateStep;
          changed = true;
          e.preventDefault();
          break;
        case 's':
        case 'S':
          newRotation[0] += rotateStep;
          changed = true;
          e.preventDefault();
          break;
        case 'a':
        case 'A':
          newRotation[1] -= rotateStep;
          changed = true;
          e.preventDefault();
          break;
        case 'd':
        case 'D':
          newRotation[1] += rotateStep;
          changed = true;
          e.preventDefault();
          break;
          
        case 'Escape':
          setMovingComponent(null);
          break;
        case 'r':
        case 'R':
          // Reset position and rotation
          newOffset = [0, 0, 0];
          newRotation = [0, 0, 0];
          changed = true;
          break;
        default:
          return;
      }

      if (changed) {
        setComponentOffsets(prev => ({
          ...prev,
          [movingComponent]: newOffset
        }));
        setComponentRotations(prev => ({
          ...prev,
          [movingComponent]: newRotation
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movingComponent, componentOffsets, componentRotations]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background grid-pattern">
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      
      {/* 3D Scene */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene3D
            isExploded={isExploded}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            componentWear={componentWear}
            visibleComponents={visibleComponents}
            autoRotate={autoRotate && !movingComponent}
            movingComponent={movingComponent}
            onDoubleClick={handleDoubleClick}
            componentOffsets={componentOffsets}
            componentRotations={componentRotations}
            openParts={openParts}
          />
        </Suspense>
      </motion.div>

      {/* Moving Mode Indicator */}
      {movingComponent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-1/2 left-6 -translate-y-1/2 z-20 glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse">
              <Move className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Moving Mode</p>
              <p className="text-xs text-muted-foreground">
                {machineComponents.find(c => c.id === movingComponent)?.name}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground mb-2">Position:</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">←→</kbd> Move X axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↑↓</kbd> Move Y axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Ctrl+↑↓</kbd> Move Z axis</p>
            <p className="font-medium text-foreground mt-3 mb-2">Rotation:</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Q/E</kbd> Rotate Z axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">W/S</kbd> Rotate X axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">A/D</kbd> Rotate Y axis</p>
            <p className="font-medium text-foreground mt-3 mb-2">Other:</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Shift</kbd> Faster movement</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">R</kbd> Reset position & rotation</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Esc</kbd> Exit moving mode</p>
          </div>
        </motion.div>
      )}

      {/* Status Overlay */}
      <StatusOverlay
        selectedComponent={selectedComponent}
        openParts={openParts}
        movingComponent={movingComponent}
      />

      {/* Control Panel */}
      <div className="absolute top-6 right-6 z-10">
        <ControlPanel
          isExploded={isExploded}
          setIsExploded={setIsExploded}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          selectedComponent={selectedComponent}
          onSelectComponent={setSelectedComponent}
          visibleComponents={visibleComponents}
          setVisibleComponents={setVisibleComponents}
          openParts={openParts}
          setOpenParts={setOpenParts}
        />
      </div>
    </div>
  );
};

export default Index;
