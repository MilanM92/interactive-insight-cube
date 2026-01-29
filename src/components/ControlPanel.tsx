import { motion } from 'framer-motion';
import { machineComponents, type ComponentData } from './PlantModel';
import { Leaf, Eye, EyeOff, RotateCcw, Layers, Droplets, Sun } from 'lucide-react';

interface ControlPanelProps {
  isExploded: boolean;
  setIsExploded: (value: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  visibleComponents: Record<string, boolean>;
  setVisibleComponents: (visible: Record<string, boolean>) => void;
  openParts: Record<string, boolean>;
  setOpenParts: (open: Record<string, boolean>) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pot': return <Droplets className="w-3 h-3" />;
    case 'ground': return <div className="w-3 h-3 rounded-sm bg-amber-800" />;
    case 'leaves': return <Leaf className="w-3 h-3" />;
    case 'root': return <div className="w-3 h-3 rounded-full border-2 border-current" />;
    default: return <Leaf className="w-3 h-3" />;
  }
};

const ControlPanel = ({
  isExploded,
  setIsExploded,
  autoRotate,
  setAutoRotate,
  selectedComponent,
  onSelectComponent,
  visibleComponents,
  setVisibleComponents,
}: ControlPanelProps) => {
  // For the plant, we have a single interactive component
  const plantComponent = {
    id: 'plant-full',
    name: 'Indoor Plant',
    color: '#228b22',
    description: 'Beautiful indoor plant with pot, soil, and foliage',
    type: 'plant' as const,
  };

  const isSelected = selectedComponent === 'plant-full';
  const isVisible = visibleComponents['plant-full'] !== false;

  const handleVisibilityToggle = () => {
    setVisibleComponents({
      ...visibleComponents,
      ['plant-full']: visibleComponents['plant-full'] === false ? true : false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel p-5 w-80 max-h-[calc(100vh-4rem)] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Plant Explorer</h2>
          <p className="text-xs text-muted-foreground">Interactive 3D Model</p>
        </div>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <p className="dashboard-label mb-3">View Controls</p>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`control-btn flex-1 flex items-center justify-center gap-2 ${isExploded ? 'active' : ''}`}
          >
            <Layers className="w-4 h-4" />
            {isExploded ? 'Assemble' : 'Explode'}
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`control-btn flex-1 flex items-center justify-center gap-2 ${autoRotate ? 'active' : ''}`}
          >
            <RotateCcw className="w-4 h-4" />
            {autoRotate ? 'Stop' : 'Rotate'}
          </button>
        </div>
      </div>

      {/* Plant Component */}
      <div className="mb-6">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <Leaf className="w-3 h-3" /> Plant Model
        </p>
        <motion.div
          layout
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'bg-emerald-500/20 border border-emerald-500/30' 
              : 'bg-secondary/50 hover:bg-secondary'
          }`}
          onClick={() => onSelectComponent(isSelected ? null : 'plant-full')}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: plantComponent.color }}
              />
              <span className="text-sm font-medium">{plantComponent.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVisibilityToggle();
              }}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              {isVisible ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground/50" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{plantComponent.description}</p>
        </motion.div>
      </div>

      {/* Component Parts Info */}
      <div className="mb-6">
        <p className="dashboard-label mb-3">Components</p>
        <div className="space-y-2">
          {machineComponents.map((component) => (
            <div
              key={component.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
            >
              {getTypeIcon(component.type)}
              <div>
                <p className="text-sm font-medium">{component.name}</p>
                <p className="text-xs text-muted-foreground">{component.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Component Details */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="dashboard-label mb-3">Selected</p>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: plantComponent.color }}
              />
              <span className="font-medium">{plantComponent.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {plantComponent.description}
            </p>

            {/* Plant care tips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-muted-foreground">Indirect sunlight</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-muted-foreground">Water weekly</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="dashboard-label mb-2">Instructions</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag to rotate the view</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Click plant to inspect</li>
          <li>• <strong>Double-click</strong> to move with arrows</li>
          <li>• Use Q/E/W/S/A/D to rotate</li>
          <li>• Press R to reset position</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
