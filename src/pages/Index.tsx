import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import StatusOverlay from '@/components/StatusOverlay';
import { machineComponents } from '@/components/GearMachine';
import { Loader2, Cog, Move } from 'lucide-react';

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Cog className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        <Cog className="w-8 h-8 text-accent absolute -right-4 top-6 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-sm text-muted-foreground">Loading 3D Gearbox...</p>
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
  
  // Initialize wear levels for gear components
  const [componentWear, setComponentWear] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    machineComponents.forEach(c => { initial[c.id] = 0; });
    // Set some initial wear for demo
    initial['drive-gear'] = 0.55;
    initial['driven-gear'] = 0.25;
    initial['idler-gear'] = 0.72;
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

  // Handle keyboard movement
  useEffect(() => {
    if (!movingComponent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.5 : 0.1; // Larger steps with shift
      const currentOffset = componentOffsets[movingComponent] || [0, 0, 0];
      let newOffset: [number, number, number] = [...currentOffset];

      switch (e.key) {
        case 'ArrowLeft':
          newOffset[0] -= step;
          e.preventDefault();
          break;
        case 'ArrowRight':
          newOffset[0] += step;
          e.preventDefault();
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            // Move in Z axis with Ctrl/Cmd
            newOffset[2] -= step;
          } else {
            // Move in Y axis
            newOffset[1] += step;
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            // Move in Z axis with Ctrl/Cmd
            newOffset[2] += step;
          } else {
            // Move in Y axis
            newOffset[1] -= step;
          }
          e.preventDefault();
          break;
        case 'Escape':
          setMovingComponent(null);
          break;
        case 'r':
        case 'R':
          // Reset position
          newOffset = [0, 0, 0];
          break;
        default:
          return;
      }

      setComponentOffsets(prev => ({
        ...prev,
        [movingComponent]: newOffset
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movingComponent, componentOffsets]);

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
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">←→</kbd> Move X axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↑↓</kbd> Move Y axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Ctrl+↑↓</kbd> Move Z axis</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Shift</kbd> Faster movement</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">R</kbd> Reset position</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Esc</kbd> Exit moving mode</p>
          </div>
        </motion.div>
      )}

      {/* Status Overlay */}
      <StatusOverlay
        selectedComponent={selectedComponent}
        componentWear={componentWear}
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
          componentWear={componentWear}
          setComponentWear={setComponentWear}
          visibleComponents={visibleComponents}
          setVisibleComponents={setVisibleComponents}
        />
      </div>
    </div>
  );
};

export default Index;
