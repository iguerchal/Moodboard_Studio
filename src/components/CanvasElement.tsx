import React from "react";
import { motion } from "motion/react";
import { useState } from "react";
import { Trash2, Square, Circle, Triangle, Star, Heart, MoveRight, ArrowUp, ArrowDown } from "lucide-react";
import { ensureGoogleFont } from "@/utils/fonts";

export type ElementType = "image" | "text" | "color" | "shape";
export type ShapeType = "square" | "circle" | "triangle" | "star" | "heart" | "arrow";

export interface CanvasElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content?: string;
  color?: string;
  shapeType?: ShapeType;
  fontFamily?: string;
  fontSize?: number;
  imageUrl?: string;
  zIndex?: number;
}

interface CanvasElementProps {
  element: CanvasElementData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElementData>) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const shapeIcons = {
  square: Square,
  circle: Circle,
  triangle: Triangle,
  star: Star,
  heart: Heart,
  arrow: MoveRight,
};

function CanvasElementImpl({ element, onDelete, onUpdate, selected = false, onSelect }: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(element.content || "");
  const [grabOffset, setGrabOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function startResize(e: React.PointerEvent, baseSize: number) {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialSize = baseSize;
    const target = e.currentTarget as HTMLElement;
    try { (target as any).setPointerCapture?.(e.pointerId); } catch {}
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = 'nwse-resize';

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const delta = Math.max(dx, dy);
      const next = clamp(initialSize + delta, 64, 640);
      onUpdate(element.id, { fontSize: next });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      document.body.style.cursor = prevCursor;
      setIsResizing(false);
      try { (target as any).releasePointerCapture?.(e.pointerId); } catch {}
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  const handleDragEnd = (e: any, _info: any) => {
    const canvas = document.querySelector('[data-canvas-root]') as HTMLElement | null;
    const node = e?.currentTarget as HTMLElement | null;
    if (!canvas || !node) return;
    const cRect = canvas.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    const newX = Math.round(nRect.left - cRect.left);
    const newY = Math.round(nRect.top - cRect.top);
    onUpdate(element.id, { x: newX, y: newY });
  };

  return (
    <motion.div
      drag={!isResizing && !isEditing}
      dragMomentum={false}
      onDragStart={(e: any) => {
        setIsDragging(true);
        const target = e?.currentTarget as HTMLElement | null;
        if (target) {
          const tRect = target.getBoundingClientRect();
          const clientX = (e.clientX ?? (e.touches?.[0]?.clientX)) as number;
          const clientY = (e.clientY ?? (e.touches?.[0]?.clientY)) as number;
          if (typeof clientX === 'number' && typeof clientY === 'number') {
            setGrabOffset({ x: clientX - tRect.left, y: clientY - tRect.top });
          }
        }
      }}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        handleDragEnd(e, info);
      }}
      onHoverStart={() => setShowControls(true)}
      onHoverEnd={() => setShowControls(false)}
      className="absolute cursor-move group"
      style={{
        left: element.x,
        top: element.y,
        zIndex: element.zIndex ?? 1,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={(e) => { e.stopPropagation(); onSelect && onSelect(element.id); }}
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Canvas element ${element.type}`}
    >
      {/* Delete Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showControls ? 1 : 0, scale: showControls ? 1 : 0.8 }}
        onClick={() => onDelete(element.id)}
        className="absolute -top-3 -right-3 z-10 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Delete element"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </motion.button>

      {/* Z-Order Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: showControls ? 1 : 0, scale: showControls ? 1 : 0.95 }}
        className="absolute -top-6 left-0 flex gap-1 z-[60]"
      >
        <button
          onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
          onPointerDown={(ev) => { ev.stopPropagation(); }}
          onClick={() => onUpdate(element.id, { zIndex: (element.zIndex ?? 1) + 1 })}
          className="w-7 h-7 bg-white dark:bg-card border border-border rounded-full flex items-center justify-center shadow-sm"
          title="Bring forward"
          aria-label="Bring element forward"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
          onPointerDown={(ev) => { ev.stopPropagation(); }}
          onClick={() => onUpdate(element.id, { zIndex: Math.max(1, (element.zIndex ?? 1) - 1) })}
          className="w-7 h-7 bg-white dark:bg-card border border-border rounded-full flex items-center justify-center shadow-sm"
          title="Send backward"
          aria-label="Send element backward"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Border on hover */}
      {(showControls || selected) && !isDragging && (
        <div
          className={`absolute inset-0 rounded-lg pointer-events-none z-30 ${
            selected ? "border border-primary shadow-lg" : "border border-primary/60"
          }`}
          style={{ borderWidth: selected ? 2 : 2 }}
        />
      )}

      {/* Element Content */}
      <div className="relative">
        {element.type === "image" && element.imageUrl && (
          <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-visible">
            <img
              src={element.imageUrl}
              alt="Canvas element"
              className="object-cover"
              style={{ width: (element.fontSize || 256), height: (element.fontSize || 256) }}
              crossOrigin="anonymous"
              draggable={false}
            />
            {/* Size controls */}
            {showControls && !isDragging && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[9999] pointer-events-auto">
                {(["S","M","L"] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      const size = sz === 'S' ? 160 : sz === 'M' ? 256 : 320;
                      onUpdate(element.id, { /* store as fontSize for reuse */ fontSize: size });
                    }}
                    onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
                    onPointerDown={(ev) => { ev.stopPropagation(); }}
                    className="px-2 py-0.5 text-xs rounded bg-white/90 dark:bg-card/90 border border-border"
                    aria-label={`Set image size ${sz}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
            {(showControls || selected) && !isDragging && (
              <button
                onPointerDown={(ev) => startResize(ev, element.fontSize || 256)}
                onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
                className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rounded-sm border border-primary/80 shadow cursor-nwse-resize z-[9999]"
                aria-label="Resize image"
              />
            )}
          </div>
        )}

        {element.type === "text" && (
          <div
            data-canvas-text
            data-element-id={element.id}
            onDoubleClick={() => {
              setIsEditing(true);
              setEditingText(element.content || "");
            }}
            className="bg-white/90 dark:bg-card/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg min-w-[200px] max-w-[400px]"
            style={{
              fontFamily: element.fontFamily || "Inter",
              color: element.color || "#111827",
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                className="w-full bg-transparent outline-none"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  onUpdate(element.id, { content: editingText });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                onMouseDown={(e) => { e.stopPropagation(); }}
              />
            ) : (
              <p className="whitespace-pre-wrap">{element.content || "Your text here"}</p>
            )}
            {/* Font controls for text blocks */}
            {(showControls || selected) && !isDragging && (
              <div className="absolute top-0 left-1/2 -translate-y-full -translate-x-1/2 z-[9999] pointer-events-auto">
                <select
                  aria-label="Change font family"
                  className="h-7 border border-border dark:border-input rounded-md px-2 bg-input-background dark:bg-card text-foreground text-xs shadow-sm"
                  value={element.fontFamily || "Inter"}
                  onChange={(e) => {
                    const v = e.target.value;
                    ensureGoogleFont(v);
                    onUpdate(element.id, { fontFamily: v });
                  }}
                  onPointerDown={(ev) => { ev.stopPropagation(); }}
                  onMouseDown={(ev) => { ev.stopPropagation(); }}
                >
                  {[
                    "Inter",
                    "Manrope",
                    "Playfair Display",
                    "Space Grotesk",
                    "Roboto",
                    "Roboto Slab",
                    "Open Sans",
                    "Poppins",
                    "Montserrat",
                    "Lora",
                    "Merriweather"
                  ].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {element.type === "color" && (
          <div className="relative overflow-visible">
            <div
              className="rounded-lg shadow-lg"
              style={{ backgroundColor: element.color, width: (element.fontSize || 128), height: (element.fontSize || 128) }}
            />
            {showControls && !isDragging && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[9999] pointer-events-auto">
                {(["S","M","L"] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      const size = sz === 'S' ? 96 : sz === 'M' ? 128 : 160;
                      onUpdate(element.id, { fontSize: size });
                    }}
                    onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
                    onPointerDown={(ev) => { ev.stopPropagation(); }}
                    className="px-2 py-0.5 text-xs rounded bg-white/90 dark:bg-card/90 border border-border"
                    aria-label={`Set color block size ${sz}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
            {(showControls || selected) && !isDragging && (
              <button
                onPointerDown={(ev) => startResize(ev, element.fontSize || 128)}
                onMouseDown={(ev) => { ev.stopPropagation(); ev.preventDefault(); }}
                className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rounded-sm border border-primary/80 shadow cursor-nwse-resize z-[9999]"
                aria-label="Resize color block"
              />
            )}
          </div>
        )}

        {element.type === "shape" && element.shapeType && (
          <div
            className="w-24 h-24 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: element.color || "#6366F1" }}
          >
            {(() => {
              const Icon = shapeIcons[element.shapeType];
              return <Icon className="w-16 h-16 text-white" />;
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const CanvasElement = React.memo(CanvasElementImpl);
