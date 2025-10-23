import { motion } from "motion/react";
import { Grid3x3, Columns, CircleDot, Layers, AlignJustify, Lock, Unlock } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

interface LayoutEngineSelectorProps {
  selectedLayout: string;
  onLayoutChange: (layout: string) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  onAutoArrange: () => void;
}

const layouts = [
  { id: "grid", name: "Grid", icon: Grid3x3, description: "Classic grid alignment" },
  { id: "masonry", name: "Masonry", icon: Columns, description: "Pinterest-style" },
  { id: "circle", name: "Circle Pack", icon: CircleDot, description: "Organic clustering" },
  { id: "stack", name: "Layered", icon: Layers, description: "Depth and overlap" },
  { id: "editorial", name: "Editorial", icon: AlignJustify, description: "Magazine layout" },
];

export function LayoutEngineSelector({
  selectedLayout,
  onLayoutChange,
  isLocked,
  onLockToggle,
  onAutoArrange,
}: LayoutEngineSelectorProps) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-[76px] left-1/2 -translate-x-1/2 z-30"
    >
      <div className="bg-white dark:bg-card border border-border rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        {/* Layout Options */}
        <div className="flex items-center gap-1">
          {layouts.map((layout) => {
            const Icon = layout.icon;
            const isSelected = selectedLayout === layout.id;
            
            return (
              <motion.button
                key={layout.id}
                onClick={() => {
                  if (isLocked) return;
                  onLayoutChange(layout.id);
                }}
                className={`relative px-3 py-2 rounded-lg transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/50 text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={layout.description}
                disabled={isLocked}
                aria-label={layout.name}
                aria-pressed={isSelected}
              >
                <Icon className="w-4 h-4" />
                {isSelected && (
                  <motion.div
                    layoutId="layout-selected"
                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Auto Arrange */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (isLocked) return;
            onAutoArrange();
          }}
          className="hover:bg-accent/50"
          disabled={isLocked}
        >
          Auto-arrange
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lock Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onLockToggle}
          className={`hover:bg-accent/50 ${isLocked ? "text-primary" : ""}`}
          aria-pressed={isLocked}
          aria-label={isLocked ? "Unlock layout" : "Lock layout"}
        >
          {isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
        </Button>

        {/* Selected Layout Name */}
        {selectedLayout && (
          <Badge variant="outline" className="ml-2">
            {layouts.find((l) => l.id === selectedLayout)?.name}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
