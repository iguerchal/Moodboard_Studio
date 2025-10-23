import { motion } from "motion/react";
import { Square, Circle, Triangle, Star, Heart, MoveRight } from "lucide-react";

interface ShapeItemProps {
  type: "square" | "circle" | "triangle" | "star" | "heart" | "arrow";
  selected?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, shapeType: string) => void;
}

const shapeIcons = {
  square: Square,
  circle: Circle,
  triangle: Triangle,
  star: Star,
  heart: Heart,
  arrow: MoveRight,
};

export function ShapeItem({ type, selected = false, onClick, onDragStart }: ShapeItemProps) {
  const Icon = shapeIcons[type];

  return (
    <motion.button
      onClick={onClick}
      draggable
      onDragStart={(e: any) => onDragStart?.(e, type)}
      className={`relative w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 cursor-grab active:cursor-grabbing ${
        selected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-white dark:bg-card border border-border hover:border-primary/50"
      }`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Add ${type} shape`}
      aria-pressed={selected}
    >
      <Icon
        className={`w-6 h-6 ${
          selected ? "text-primary" : "text-muted-foreground"
        }`}
      />
      {selected && (
        <motion.div
          layoutId="shape-selected"
          className="absolute inset-0 rounded-lg bg-primary/5"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
