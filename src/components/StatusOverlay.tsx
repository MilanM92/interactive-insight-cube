import { motion } from 'framer-motion';
import { machineComponents } from './CarModel';
import { Car, DoorOpen, Gauge, Thermometer } from 'lucide-react';

interface StatusOverlayProps {
  selectedComponent: string | null;
  openParts: Record<string, boolean>;
  movingComponent?: string | null;
}

const StatusOverlay = ({ selectedComponent, openParts, movingComponent }: StatusOverlayProps) => {
  const selectedData = machineComponents.find(c => c.id === selectedComponent);
  
  // Count open doors/hatches
  const openableComponents = machineComponents.filter(c => c.type === 'door' || c.type === 'hatch');
  const openCount = openableComponents.filter(c => openParts[c.id]).length;

  return (
    <>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <h1 className="text-2xl font-bold text-foreground text-glow mb-1">
          Car Assembly
        </h1>
        <p className="text-sm text-muted-foreground">
          Interactive 3D Explorer
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
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="dashboard-label">Parts</p>
              <p className="dashboard-value">{machineComponents.length}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="dashboard-label">Open Parts</p>
              <p className="dashboard-value text-emerald-400">
                {openCount}/{openableComponents.length}
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="dashboard-label">Engine</p>
              <p className="dashboard-value text-foreground">Ready</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="dashboard-label">Speed</p>
              <p className="dashboard-value text-foreground">0 km/h</p>
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
              {selectedData.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{selectedData.description}</p>
        </motion.div>
      )}

      {/* Interactive Hint */}
      {!movingComponent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="interactive-hint glass-panel px-4 py-2">
            <span className="animate-pulse text-primary">●</span>
            <span>Drag to rotate • Scroll to zoom • Click to inspect • Double-click to move • Open doors/trunk</span>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default StatusOverlay;
