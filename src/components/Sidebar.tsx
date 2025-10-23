import { motion } from "motion/react";
import { Upload, Plus, RotateCcw, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FONT_CATALOG } from "@/utils/fontCatalog";
import { Separator } from "./ui/separator";
import { ColorSwatch } from "./ColorSwatch";
import { ShapeItem } from "./ShapeItem";
import type { ShapeType } from "./CanvasElement";

interface SidebarProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedShape: ShapeType | null;
  onShapeSelect: (shape: ShapeType) => void;
  textContent: string;
  onTextChange: (text: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  onUploadImage: () => void;
  onAddColor: () => void;
  onReset: () => void;
  onExport: () => void;
  onShapeDragStart: (e: React.DragEvent, shapeType: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultColors = [
  "#6366F1", // Primary Purple
  "#EC4899", // Pink
  "#10B981", // Green
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
];

export function Sidebar({
  selectedColor,
  onColorSelect,
  selectedShape,
  onShapeSelect,
  textContent,
  onTextChange,
  fontFamily,
  onFontFamilyChange,
  onUploadImage,
  onAddColor,
  onReset,
  onExport,
  onShapeDragStart,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const sidebarContent = (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Section A: Upload Images */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Button
            onClick={onUploadImage}
            className="w-full bg-white dark:bg-card hover:bg-accent/10 text-foreground border border-border shadow-sm hover:shadow-md transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Separator />
        </motion.div>

        {/* Section B: Colors */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3>Colors</h3>
          <div className="grid grid-cols-6 gap-2">
            {defaultColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={selectedColor === color}
                onClick={() => onColorSelect(color)}
                draggable
                onDragStart={(e: any) => {
                  e.dataTransfer.setData("type", "color");
                  e.dataTransfer.setData("color", color);
                }}
              />
            ))}
          </div>
          <Button
            onClick={onAddColor}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Color
          </Button>
        </motion.div>

        {/* Section C: Text Tools */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3>Text</h3>
          <Textarea
            value={textContent}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Enter your quote or text..."
            className="min-h-[100px] resize-none bg-white dark:bg-card"
            draggable
            onDragStart={(e: any) => {
              e.dataTransfer.setData("type", "text");
            }}
          />
          <Select value={fontFamily} onValueChange={(v) => { onFontFamilyChange(v); try { const { ensureGoogleFont } = require('@/utils/fonts'); ensureGoogleFont(v); } catch {} }}>
            <SelectTrigger className="bg-white dark:bg-card">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_CATALOG.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Section D: Shapes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3>Shapes</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["square", "circle", "triangle", "star", "heart", "arrow"] as ShapeType[]).map(
              (shape) => (
                <ShapeItem
                  key={shape}
                  type={shape}
                  selected={selectedShape === shape}
                  onClick={() => onShapeSelect(shape)}
                  onDragStart={onShapeDragStart}
                />
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-sidebar-border space-y-2 bg-sidebar"
      >
        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Board
        </Button>
        <Button
          onClick={onExport}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Moodboard
        </Button>
      </motion.div>
    </div>
  );

  // Mobile: render as overlay
  if (window.innerWidth < 1024) {
    return (
      <>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: isOpen ? 0 : -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-[60px] bottom-0 w-[280px] z-50 lg:hidden"
          style={{ boxShadow: "4px 0 12px rgba(0, 0, 0, 0.08)" }}
        >
          {sidebarContent}
        </motion.aside>
      </>
    );
  }

  // Desktop: static sidebar
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:block w-[280px] h-full"
      style={{ boxShadow: "4px 0 12px rgba(0, 0, 0, 0.08)" }}
    >
      {sidebarContent}
    </motion.aside>
  );
}
