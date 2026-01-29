import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import StatusOverlay from '@/components/StatusOverlay';
import { cubeComponents } from '@/components/InteractiveCube';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading 3D Environment...</p>
    </div>
  </div>
);

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Initialize wear levels for all components
  const [componentWear, setComponentWear] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    cubeComponents.forEach(c => { initial[c.id] = 0; });
    // Set some initial wear for demo
    initial['left-bearing'] = 0.65;
    initial['right-bearing'] = 0.35;
    return initial;
  });

  // Initialize visibility for all components
  const [visibleComponents, setVisibleComponents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    cubeComponents.forEach(c => { initial[c.id] = true; });
    return initial;
  });

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
            autoRotate={autoRotate}
          />
        </Suspense>
      </motion.div>

      {/* Status Overlay */}
      <StatusOverlay
        selectedComponent={selectedComponent}
        componentWear={componentWear}
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
