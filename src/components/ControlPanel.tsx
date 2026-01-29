import { motion } from 'framer-motion';
import { machineComponents, type ComponentData } from './GearMachine';
import { Cog, Eye, EyeOff, RotateCcw, Layers, Wrench, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface ControlPanelProps {
  isExploded: boolean;
  setIsExploded: (value: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  componentWear: Record<string, number>;
  setComponentWear: (wear: Record<string, number>) => void;
  visibleComponents: Record<string, boolean>;
  setVisibleComponents: (visible: Record<string, boolean>) => void;
}

const getWearStatus = (wear: number) => {
  if (wear > 0.7) return { label: 'Critical', className: 'wear-critical', color: 'bg-red-500' };
  if (wear > 0.4) return { label: 'Warning', className: 'wear-warning', color: 'bg-amber-500' };
  return { label: 'Healthy', className: 'wear-healthy', color: 'bg-emerald-500' };
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'gear': return <Cog className="w-3 h-3" />;
    case 'shaft': return <div className="w-3 h-0.5 bg-current rounded" />;
    case 'housing': return <Settings className="w-3 h-3" />;
    default: return null;
  }
};

const ControlPanel = ({
  isExploded,
  setIsExploded,
  autoRotate,
  setAutoRotate,
  selectedComponent,
  onSelectComponent,
  componentWear,
  setComponentWear,
  visibleComponents,
  setVisibleComponents,
}: ControlPanelProps) => {
  const selectedData = machineComponents.find(c => c.id === selectedComponent);

  const handleWearChange = (componentId: string, value: number) => {
    setComponentWear({ ...componentWear, [componentId]: value });
  };

  const handleVisibilityToggle = (componentId: string) => {
    setVisibleComponents({
      ...visibleComponents,
      [componentId]: visibleComponents[componentId] === false ? true : false,
    });
  };

  const resetWear = (componentId: string) => {
    setComponentWear({ ...componentWear, [componentId]: 0 });
  };

  const resetAllWear = () => {
    const resetWear: Record<string, number> = {};
    machineComponents.forEach(c => { resetWear[c.id] = 0; });
    setComponentWear(resetWear);
  };

  // Group components by type
  const gears = machineComponents.filter(c => c.type === 'gear');
  const shafts = machineComponents.filter(c => c.type === 'shaft');
  const housings = machineComponents.filter(c => c.type === 'housing');

  const renderComponentItem = (component: ComponentData) => {
    const isSelected = selectedComponent === component.id;
    const isVisible = visibleComponents[component.id] !== false;
    const wear = componentWear[component.id] || 0;
    const status = getWearStatus(wear);

    return (
      <motion.div
        key={component.id}
        layout
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'bg-primary/20 border border-primary/30' 
            : 'bg-secondary/50 hover:bg-secondary'
        }`}
        onClick={() => onSelectComponent(isSelected ? null : component.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: component.color }}
            />
            <span className="text-sm font-medium truncate max-w-[140px]">{component.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVisibilityToggle(component.id);
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
        
        {/* Wear indicator for gears only */}
        {component.type === 'gear' && (
          <div className="flex items-center gap-2">
            <div className="wear-progress flex-1">
              <div
                className={`wear-progress-fill ${status.color}`}
                style={{ width: `${wear * 100}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${status.className}`}>
              {Math.round(wear * 100)}%
            </span>
          </div>
        )}
      </motion.div>
    );
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
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Cog className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Gearbox Control</h2>
          <p className="text-xs text-muted-foreground">Interactive Simulation</p>
        </div>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <p className="dashboard-label mb-3">Assembly Controls</p>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`control-btn flex-1 flex items-center justify-center gap-2 ${isExploded ? 'active' : ''}`}
          >
            <Layers className="w-4 h-4" />
            {isExploded ? 'Assemble' : 'Disassemble'}
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

      {/* Gears Section */}
      <div className="mb-4">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <Cog className="w-3 h-3" /> Gears
        </p>
        <div className="space-y-2">
          {gears.map(renderComponentItem)}
        </div>
      </div>

      {/* Shafts Section */}
      <div className="mb-4">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <div className="w-3 h-0.5 bg-muted-foreground rounded" /> Shafts
        </p>
        <div className="space-y-2">
          {shafts.map(renderComponentItem)}
        </div>
      </div>

      {/* Housing Section */}
      <div className="mb-6">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <Settings className="w-3 h-3" /> Housing
        </p>
        <div className="space-y-2">
          {housings.map(renderComponentItem)}
        </div>
      </div>

      {/* Selected Component Details */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="dashboard-label mb-3">Component Details</p>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: selectedData.color }}
              />
              <span className="font-medium">{selectedData.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedData.description}
            </p>

            {/* Wear Simulation for gears */}
            {selectedData.type === 'gear' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Wear Level</span>
                  <span className={`text-sm font-mono ${getWearStatus(componentWear[selectedData.id] || 0).className}`}>
                    {Math.round((componentWear[selectedData.id] || 0) * 100)}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(componentWear[selectedData.id] || 0) * 100}
                  onChange={(e) => handleWearChange(selectedData.id, Number(e.target.value) / 100)}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => resetWear(selectedData.id)}
                    className="control-btn flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <Wrench className="w-4 h-4" />
                    Replace Gear
                  </button>
                </div>

                {/* Status indicator */}
                <div className={`flex items-center gap-2 p-2 rounded-lg ${
                  (componentWear[selectedData.id] || 0) > 0.7 
                    ? 'bg-red-500/10' 
                    : (componentWear[selectedData.id] || 0) > 0.4 
                      ? 'bg-amber-500/10' 
                      : 'bg-emerald-500/10'
                }`}>
                  {(componentWear[selectedData.id] || 0) > 0.7 ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (componentWear[selectedData.id] || 0) > 0.4 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={`text-sm ${getWearStatus(componentWear[selectedData.id] || 0).className}`}>
                    {getWearStatus(componentWear[selectedData.id] || 0).label}
                  </span>
                </div>
              </div>
            )}

            {/* Specs for shafts */}
            {selectedData.type === 'shaft' && selectedData.props && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/30 p-2 rounded">
                  <span className="text-muted-foreground">Length</span>
                  <p className="font-mono">{selectedData.props.length}m</p>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <span className="text-muted-foreground">Radius</span>
                  <p className="font-mono">{selectedData.props.radius}m</p>
                </div>
              </div>
            )}

            {/* Specs for gears */}
            {selectedData.type === 'gear' && selectedData.props && (
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="bg-muted/30 p-2 rounded">
                  <span className="text-muted-foreground">Teeth</span>
                  <p className="font-mono">{selectedData.props.teeth}</p>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <span className="text-muted-foreground">Radius</span>
                  <p className="font-mono">{selectedData.props.radius}m</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Reset All Button */}
      <button
        onClick={resetAllWear}
        className="w-full control-btn flex items-center justify-center gap-2"
      >
        <Wrench className="w-4 h-4" />
        Replace All Gears
      </button>

      {/* Instructions */}
      <div className="mt-6 p-3 rounded-lg bg-muted/30">
        <p className="dashboard-label mb-2">Instructions</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag to rotate the view</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Click components to inspect</li>
          <li>• Click "Disassemble" to explode</li>
          <li>• Adjust wear sliders to simulate</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
