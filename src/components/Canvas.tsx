import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { CanvasElement, type CanvasElementData } from "./CanvasElement";

interface CanvasProps {
  elements: CanvasElementData[];
  onDeleteElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElementData>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  onClearSelection?: () => void;
}

function CanvasImpl({
  elements,
  onDeleteElement,
  onUpdateElement,
  onDrop,
  onDragOver,
  selectedElementId,
  onSelectElement,
  onClearSelection,
}: CanvasProps) {
  const isEmpty = elements.length === 0;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex-1 p-4 md:p-8 overflow-auto bg-muted"
    >
      <div
        data-canvas-root
        className="relative w-full min-h-[calc(100vh-60px-4rem)] md:min-h-[calc(100vh-60px-8rem)] bg-white dark:bg-card rounded-lg shadow-lg"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => onClearSelection && onClearSelection()}
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Empty State */}
        {isEmpty && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-16 h-16 mb-4 text-primary/40" />
            </motion.div>
            <p className="text-center px-4">
              Drag your images or elements here 🎨
            </p>
            <p className="text-center px-4 mt-2">
              Upload images, add text, colors, and shapes to create your moodboard
            </p>
          </motion.div>
        )}

        {/* Canvas Elements */}
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            onDelete={onDeleteElement}
            onUpdate={onUpdateElement}
            selected={selectedElementId === element.id}
            onSelect={(id) => onSelectElement && onSelectElement(id)}
          />
        ))}

        {/* Background Pattern (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366F1 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>
    </motion.main>
  );
}

export const Canvas = React.memo(CanvasImpl);
