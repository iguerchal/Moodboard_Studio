import { motion } from "motion/react";
import { Sun, Moon, Plus, Download, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onNewProject: () => void;
  onExport: () => void;
  isMobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

export function Header({
  theme,
  onThemeToggle,
  onNewProject,
  onExport,
  isMobileSidebarOpen,
  onMobileSidebarToggle,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[60px] border-b border-border bg-white/80 dark:bg-card/80 backdrop-blur-lg sticky top-0 z-50"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          {onMobileSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileSidebarToggle}
              className="lg:hidden"
              aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={!!isMobileSidebarOpen}
            >
              {isMobileSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white">M</span>
            </div>
            <h1 className="hidden sm:block">MoodBoard Studio</h1>
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            onClick={onNewProject}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          <Button
            onClick={onNewProject}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md sm:hidden"
            aria-label="New project"
          >
            <Plus className="w-4 h-4" />
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            className="hover:bg-accent/10 hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label="Export"
          >
            <Download className="w-4 h-4" />
          </Button>

          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            <Button
              onClick={onThemeToggle}
              variant="ghost"
              size="icon"
              className="hover:bg-accent/10"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
