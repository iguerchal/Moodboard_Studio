import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  MoveRight,
  Sparkles,
  Palette,
  Type,
  Grid3x3,
  Share2,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: any;
  keywords: string[];
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
  onExport: () => void;
  onReset: () => void;
  onUploadImage: () => void;
  onAddShape: (shape: string) => void;
  theme: "light" | "dark";
  onAutoArrange?: () => void;
  onChangeLayout?: (layout: "grid" | "masonry" | "circle" | "editorial") => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onThemeToggle,
  onExport,
  onReset,
  onUploadImage,
  onAddShape,
  theme,
  onAutoArrange,
  onChangeLayout,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: "theme-toggle",
      label: theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode",
      icon: theme === "light" ? Moon : Sun,
      keywords: ["theme", "dark", "light", "mode"],
      action: onThemeToggle,
      category: "Preferences",
    },
    {
      id: "export",
      label: "Export Moodboard",
      icon: Download,
      keywords: ["export", "download", "save", "pdf"],
      action: onExport,
      category: "Actions",
    },
    {
      id: "upload",
      label: "Upload Image",
      icon: Upload,
      keywords: ["upload", "image", "photo", "add"],
      action: onUploadImage,
      category: "Actions",
    },
    {
      id: "auto-arrange",
      label: "Auto-arrange Layout",
      icon: Grid3x3,
      keywords: ["arrange", "layout", "auto"],
      action: () => onAutoArrange && onAutoArrange(),
      category: "Layout",
    },
    {
      id: "layout-grid",
      label: "Switch Layout: Grid",
      icon: Grid3x3,
      keywords: ["layout", "grid"],
      action: () => onChangeLayout && onChangeLayout("grid"),
      category: "Layout",
    },
    {
      id: "layout-masonry",
      label: "Switch Layout: Masonry",
      icon: Grid3x3,
      keywords: ["layout", "masonry"],
      action: () => onChangeLayout && onChangeLayout("masonry"),
      category: "Layout",
    },
    {
      id: "layout-circle",
      label: "Switch Layout: Circle Pack",
      icon: Grid3x3,
      keywords: ["layout", "circle"],
      action: () => onChangeLayout && onChangeLayout("circle"),
      category: "Layout",
    },
    {
      id: "layout-editorial",
      label: "Switch Layout: Editorial",
      icon: Grid3x3,
      keywords: ["layout", "editorial"],
      action: () => onChangeLayout && onChangeLayout("editorial"),
      category: "Layout",
    },
    {
      id: "reset",
      label: "Reset Board",
      icon: RotateCcw,
      keywords: ["reset", "clear", "delete", "remove"],
      action: onReset,
      category: "Actions",
    },
    {
      id: "add-square",
      label: "Add Square Shape",
      icon: Square,
      keywords: ["square", "shape", "add"],
      action: () => onAddShape("square"),
      category: "Shapes",
    },
    {
      id: "add-circle",
      label: "Add Circle Shape",
      icon: Circle,
      keywords: ["circle", "shape", "add"],
      action: () => onAddShape("circle"),
      category: "Shapes",
    },
    {
      id: "add-triangle",
      label: "Add Triangle Shape",
      icon: Triangle,
      keywords: ["triangle", "shape", "add"],
      action: () => onAddShape("triangle"),
      category: "Shapes",
    },
    {
      id: "add-star",
      label: "Add Star Shape",
      icon: Star,
      keywords: ["star", "shape", "add"],
      action: () => onAddShape("star"),
      category: "Shapes",
    },
    {
      id: "add-heart",
      label: "Add Heart Shape",
      icon: Heart,
      keywords: ["heart", "shape", "add"],
      action: () => onAddShape("heart"),
      category: "Shapes",
    },
    {
      id: "add-arrow",
      label: "Add Arrow Shape",
      icon: MoveRight,
      keywords: ["arrow", "shape", "add"],
      action: () => onAddShape("arrow"),
      category: "Shapes",
    },
  ];

  const filteredCommands = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.keywords.some((keyword) =>
            keyword.toLowerCase().includes(search.toLowerCase())
          )
      )
    : commands;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
          >
            <div className="mx-4 bg-white dark:bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-muted rounded text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[400px] overflow-y-auto">
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="py-2">
                    <div className="px-4 py-2 text-muted-foreground">{category}</div>
                    {cmds.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const Icon = cmd.icon;
                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            globalIndex === selectedIndex
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent/50"
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1 text-left">{cmd.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No commands found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-muted-foreground">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd> Select
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
