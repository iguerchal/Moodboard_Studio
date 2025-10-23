import { motion } from "motion/react";
import { Check } from "lucide-react";

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ColorSwatch({ color, selected = false, onClick }: ColorSwatchProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-10 h-10 rounded-full transition-all duration-200 cursor-pointer"
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Select color ${color}`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className="w-5 h-5 text-white drop-shadow-md" />
        </motion.div>
      )}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-200 ${
          selected ? "ring-2 ring-primary ring-offset-2 ring-offset-sidebar" : ""
        }`}
      />
    </motion.button>
  );
}
