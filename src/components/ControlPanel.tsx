import { motion } from 'framer-motion';
import { machineComponents, type ComponentData } from './CarModel';
import { Car, Eye, EyeOff, RotateCcw, Layers, DoorOpen, DoorClosed, Settings } from 'lucide-react';

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
    case 'body': return <Car className="w-3 h-3" />;
    case 'door': return <DoorClosed className="w-3 h-3" />;
    case 'hatch': return <Settings className="w-3 h-3" />;
    case 'wheel': return <div className="w-3 h-3 rounded-full border-2 border-current" />;
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
  visibleComponents,
  setVisibleComponents,
  openParts,
  setOpenParts,
}: ControlPanelProps) => {
  const selectedData = machineComponents.find(c => c.id === selectedComponent);

  const handleVisibilityToggle = (componentId: string) => {
    setVisibleComponents({
      ...visibleComponents,
      [componentId]: visibleComponents[componentId] === false ? true : false,
    });
  };

  const handleOpenToggle = (componentId: string) => {
    setOpenParts({
      ...openParts,
      [componentId]: !openParts[componentId],
    });
  };

  const openAllDoors = () => {
    const newOpenParts = { ...openParts };
    machineComponents
      .filter(c => c.type === 'door' || c.type === 'hatch')
      .forEach(c => { newOpenParts[c.id] = true; });
    setOpenParts(newOpenParts);
  };

  const closeAllDoors = () => {
    const newOpenParts = { ...openParts };
    machineComponents
      .filter(c => c.type === 'door' || c.type === 'hatch')
      .forEach(c => { newOpenParts[c.id] = false; });
    setOpenParts(newOpenParts);
  };

  // Group components by type
  const body = machineComponents.filter(c => c.type === 'body');
  const doors = machineComponents.filter(c => c.type === 'door');
  const hatches = machineComponents.filter(c => c.type === 'hatch');
  const wheels = machineComponents.filter(c => c.type === 'wheel');

  const renderComponentItem = (component: ComponentData) => {
    const isSelected = selectedComponent === component.id;
    const isVisible = visibleComponents[component.id] !== false;
    const isOpen = openParts[component.id] || false;
    const canOpen = component.type === 'door' || component.type === 'hatch';

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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: component.color }}
            />
            <span className="text-sm font-medium truncate max-w-[120px]">{component.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {canOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenToggle(component.id);
                }}
                className={`p-1 rounded transition-colors ${isOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                title={isOpen ? 'Close' : 'Open'}
              >
                {isOpen ? (
                  <DoorOpen className="w-4 h-4" />
                ) : (
                  <DoorClosed className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
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
        </div>
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
          <Car className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Car Explorer</h2>
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
        <div className="flex gap-2">
          <button
            onClick={openAllDoors}
            className="control-btn flex-1 flex items-center justify-center gap-2"
          >
            <DoorOpen className="w-4 h-4" />
            Open All
          </button>
          <button
            onClick={closeAllDoors}
            className="control-btn flex-1 flex items-center justify-center gap-2"
          >
            <DoorClosed className="w-4 h-4" />
            Close All
          </button>
        </div>
      </div>

      {/* Body Section */}
      <div className="mb-4">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <Car className="w-3 h-3" /> Body
        </p>
        <div className="space-y-2">
          {body.map(renderComponentItem)}
        </div>
      </div>

      {/* Doors Section */}
      <div className="mb-4">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <DoorClosed className="w-3 h-3" /> Doors
        </p>
        <div className="space-y-2">
          {doors.map(renderComponentItem)}
        </div>
      </div>

      {/* Hatches Section */}
      <div className="mb-4">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <Settings className="w-3 h-3" /> Hood & Trunk
        </p>
        <div className="space-y-2">
          {hatches.map(renderComponentItem)}
        </div>
      </div>

      {/* Wheels Section */}
      <div className="mb-6">
        <p className="dashboard-label mb-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" /> Wheels
        </p>
        <div className="space-y-2">
          {wheels.map(renderComponentItem)}
        </div>
      </div>

      {/* Selected Component Details */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="dashboard-label mb-3">Part Details</p>
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

            {/* Open/Close for doors and hatches */}
            {(selectedData.type === 'door' || selectedData.type === 'hatch') && (
              <button
                onClick={() => handleOpenToggle(selectedData.id)}
                className={`w-full control-btn flex items-center justify-center gap-2 ${
                  openParts[selectedData.id] ? 'active' : ''
                }`}
              >
                {openParts[selectedData.id] ? (
                  <>
                    <DoorOpen className="w-4 h-4" />
                    Close {selectedData.type === 'door' ? 'Door' : selectedData.props?.type === 'hood' ? 'Hood' : 'Trunk'}
                  </>
                ) : (
                  <>
                    <DoorClosed className="w-4 h-4" />
                    Open {selectedData.type === 'door' ? 'Door' : selectedData.props?.type === 'hood' ? 'Hood' : 'Trunk'}
                  </>
                )}
              </button>
            )}

            {/* Type badge */}
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              {getTypeIcon(selectedData.type)}
              <span className="text-sm text-muted-foreground capitalize">{selectedData.type}</span>
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
          <li>• Click parts to inspect</li>
          <li>• <strong>Double-click</strong> to move with arrows</li>
          <li>• Click door icons to open/close</li>
          <li>• Click "Explode" for exploded view</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
