import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import StatusOverlay from '@/components/StatusOverlay';
import { machineComponents } from '@/components/GearMachine';
import { Loader2, Cog } from 'lucide-react';

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
