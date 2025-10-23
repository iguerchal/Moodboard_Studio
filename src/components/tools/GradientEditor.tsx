import { useState } from "react";
import { motion } from "motion/react";
import { X, Plus, Trash2, Pipette } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";

interface GradientStop {
  color: string;
  position: number;
}

interface GradientEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (gradient: string) => void;
}

const presets = [
  { name: "Sunset", stops: [{ color: "#FF6B35", position: 0 }, { color: "#F7931E", position: 50 }, { color: "#FDC830", position: 100 }] },
  { name: "Aurora", stops: [{ color: "#00F5A0", position: 0 }, { color: "#00D9F5", position: 100 }] },
  { name: "Ocean", stops: [{ color: "#3B82F6", position: 0 }, { color: "#1E40AF", position: 100 }] },
  { name: "Purple Haze", stops: [{ color: "#6366F1", position: 0 }, { color: "#A855F7", position: 50 }, { color: "#EC4899", position: 100 }] },
  { name: "Forest", stops: [{ color: "#10B981", position: 0 }, { color: "#059669", position: 100 }] },
];

export function GradientEditor({ isOpen, onClose, onApply }: GradientEditorProps) {
  const [stops, setStops] = useState<GradientStop[]>([
    { color: "#6366F1", position: 0 },
    { color: "#EC4899", position: 100 },
  ]);
  const [angle, setAngle] = useState(90);
  const [noise, setNoise] = useState(0);

  const generateGradient = () => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopStrings = sortedStops.map(
      (stop) => `${stop.color} ${stop.position}%`
    );
    return `linear-gradient(${angle}deg, ${stopStrings.join(", ")})`;
  };

  const handleAddStop = () => {
    if (stops.length < 5) {
      setStops([...stops, { color: "#6366F1", position: 50 }]);
    }
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStop = (index: number, updates: Partial<GradientStop>) => {
    setStops(stops.map((stop, i) => (i === index ? { ...stop, ...updates } : stop)));
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setStops(preset.stops);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-card border-l border-border shadow-2xl z-[101] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-border bg-white/80 dark:bg-card/80 backdrop-blur-lg flex items-center justify-between">
          <div>
            <h3>Gradient Editor</h3>
            <p className="text-muted-foreground">Create custom gradients</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close gradient editor">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="space-y-3">
            <label>Preview</label>
            <motion.div
              className="w-full h-32 rounded-lg shadow-lg"
              style={{
                background: generateGradient(),
                filter: noise > 0 ? `url(#noise-${noise})` : undefined,
              }}
              animate={{ backgroundImage: generateGradient() }}
            />
          </div>

          {/* Presets */}
          <div className="space-y-3">
            <label>Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <motion.button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="relative h-16 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${preset.stops
                        .map((s) => `${s.color} ${s.position}%`)
                        .join(", ")})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white">{preset.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color Stops */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label>Color Stops</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddStop}
                disabled={stops.length >= 5}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Stop
              </Button>
            </div>

            {stops.map((stop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <div className="relative">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) =>
                      handleUpdateStop(idx, { color: e.target.value })
                    }
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={stop.color}
                    onChange={(e) =>
                      handleUpdateStop(idx, { color: e.target.value })
                    }
                    className="text-xs"
                  />
                  <Slider
                    value={[stop.position]}
                    onValueChange={([value]) =>
                      handleUpdateStop(idx, { position: value })
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">{stop.position}%</span>
                </div>
                {stops.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveStop(idx)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Angle */}
          <div className="space-y-3">
            <label>Angle: {angle}°</label>
            <Slider
              value={[angle]}
              onValueChange={([value]) => setAngle(value)}
              min={0}
              max={360}
              step={1}
            />
          </div>

          {/* Noise */}
          <div className="space-y-3">
            <label>Noise: {noise}%</label>
            <Slider
              value={[noise]}
              onValueChange={([value]) => setNoise(value)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-border bg-white/80 dark:bg-card/80 backdrop-blur-lg flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply(generateGradient());
              onClose();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Apply Gradient
          </Button>
        </div>
      </motion.div>
    </>
  );
}
