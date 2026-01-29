import { motion } from 'framer-motion';
import { machineComponents } from './PlantModel';
import { Leaf, Droplets, Sun, Thermometer } from 'lucide-react';

interface StatusOverlayProps {
  selectedComponent: string | null;
  openParts: Record<string, boolean>;
  movingComponent?: string | null;
}

const StatusOverlay = ({ selectedComponent, movingComponent }: StatusOverlayProps) => {
  const isSelected = selectedComponent === 'plant-full';

  return (
    <>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <h1 className="text-2xl font-bold text-foreground text-glow mb-1">
          Indoor Plant
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
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="dashboard-label">Parts</p>
              <p className="dashboard-value">{machineComponents.length}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="dashboard-label">Watering</p>
              <p className="dashboard-value text-blue-400">Weekly</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="dashboard-label">Light</p>
              <p className="dashboard-value text-amber-400">Indirect</p>
            </div>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="dashboard-label">Temp</p>
              <p className="dashboard-value text-foreground">18-24°C</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Component Info */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute bottom-6 left-6 z-10 glass-panel p-4 max-w-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="font-semibold text-foreground">Indoor Plant</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Full Model
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Beautiful indoor plant with ceramic pot, nutrient-rich soil, and healthy green foliage.
          </p>
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
            <span className="animate-pulse text-emerald-400">●</span>
            <span>Drag to rotate • Scroll to zoom • Click to inspect • Double-click to move</span>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default StatusOverlay;
