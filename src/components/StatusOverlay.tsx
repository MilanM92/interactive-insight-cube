import { motion } from 'framer-motion';
import { cubeComponents } from './InteractiveCube';
import { Box, Activity, ThermometerSun, Gauge } from 'lucide-react';

interface StatusOverlayProps {
  selectedComponent: string | null;
  componentWear: Record<string, number>;
}

const StatusOverlay = ({ selectedComponent, componentWear }: StatusOverlayProps) => {
  const selectedData = cubeComponents.find(c => c.id === selectedComponent);
  
  // Calculate overall system health
  const totalWear = Object.values(componentWear).reduce((sum, w) => sum + w, 0);
  const avgWear = totalWear / Math.max(Object.keys(componentWear).length, 1);
  const systemHealth = Math.max(0, 100 - avgWear * 100);

  const getHealthColor = (health: number) => {
    if (health < 30) return 'text-red-400';
    if (health < 60) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <h1 className="text-2xl font-bold text-foreground text-glow mb-1">
          Interactive 3D Assembly
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore • Interact • Simulate
        </p>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-6 right-[340px] z-10 glass-panel p-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="dashboard-label">Components</p>
              <p className="dashboard-value">{cubeComponents.length}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="dashboard-label">System Health</p>
              <p className={`dashboard-value ${getHealthColor(systemHealth)}`}>
                {systemHealth.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ThermometerSun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="dashboard-label">Temperature</p>
              <p className="dashboard-value text-foreground">42°C</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="dashboard-label">RPM</p>
              <p className="dashboard-value text-foreground">1,450</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Component Info */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute bottom-6 left-6 z-10 glass-panel p-4 max-w-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: selectedData.color }}
            />
            <span className="font-semibold text-foreground">{selectedData.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{selectedData.description}</p>
        </motion.div>
      )}

      {/* Interactive Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="interactive-hint glass-panel px-4 py-2">
          <span className="animate-pulse">●</span>
          <span>Drag to rotate • Scroll to zoom • Click to inspect</span>
        </div>
      </motion.div>
    </>
  );
};

export default StatusOverlay;
