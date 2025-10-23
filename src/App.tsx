import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import { CommandPalette } from "./components/menus/CommandPalette";
import { PromptToBoard } from "./components/ai/PromptToBoard";
import { AIRecommendations } from "./components/ai/AIRecommendations";
import { LayoutEngineSelector } from "./components/layout/LayoutEngineSelector";
import { GradientEditor } from "./components/tools/GradientEditor";
import { ColorHarmonyTool } from "./components/tools/ColorHarmonyTool";
import { AdvancedExport } from "./components/share/AdvancedExport";
import { StoryModeTimeline } from "./components/story/StoryModeTimeline";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useRef } from "react";
import { arrangeElements } from "./utils/layout";
import type { CanvasElementData, ShapeType } from "./components/CanvasElement";
import { ensureGoogleFont } from "@/utils/fonts";

export default function App() {
  const loadedRef = useRef(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Advanced features state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isAIRecommendationsOpen, setIsAIRecommendationsOpen] = useState(false);
  const [isGradientEditorOpen, setIsGradientEditorOpen] = useState(false);
  const [isColorHarmonyOpen, setIsColorHarmonyOpen] = useState(false);
  const [isAdvancedExportOpen, setIsAdvancedExportOpen] = useState(false);
  const [isStoryModeOpen, setIsStoryModeOpen] = useState(false);
  
  // Layout state
  const [selectedLayout, setSelectedLayout] = useState("grid");
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);
  
  // Sidebar state
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
  const [textContent, setTextContent] = useState("");
  const [fontFamily, setFontFamily] = useState("Inter");
  
  // Canvas state
  const [canvasElements, setCanvasElements] = useState<CanvasElementData[]>([
    // Example elements for demonstration
    {
      id: "demo-text-1",
      type: "text",
      x: 100,
      y: 100,
      content: "Design is thinking made visual.",
      fontFamily: "Playfair Display",
      color: "#111827",
    },
    {
      id: "demo-color-1",
      type: "color",
      x: 500,
      y: 150,
      color: "#6366F1",
    },
    {
      id: "demo-color-2",
      type: "color",
      x: 650,
      y: 200,
      color: "#EC4899",
    },
    {
      id: "demo-shape-1",
      type: "shape",
      x: 300,
      y: 300,
      shapeType: "circle",
      color: "#10B981",
    },
    {
      id: "demo-image-1",
      type: "image",
      x: 800,
      y: 100,
      imageUrl: "https://images.unsplash.com/photo-1646038572816-04ab3ff22b1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwZ3JhZGllbnR8ZW58MXx8fHwxNzYwNTczMzYyfDA&ixlib=rb-4.1.0&q=80&w=400",
    },
    {
      id: "demo-image-2",
      type: "image",
      x: 150,
      y: 450,
      imageUrl: "https://images.unsplash.com/photo-1630283017751-76e1fbb14d91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2MDUxODE0Mnww&ixlib=rb-4.1.0&q=80&w=400",
    },
    {
      id: "demo-image-3",
      type: "image",
      x: 600,
      y: 450,
      imageUrl: "https://images.unsplash.com/photo-1758539197206-f66723e880a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbiUyMGluc3BpcmF0aW9ufGVufDF8fHx8MTc2MDU3Mzc1MHww&ixlib=rb-4.1.0&q=80&w=400",
    },
  ]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Load persisted state once
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const savedTheme = localStorage.getItem("mb/theme");
      const savedLayout = localStorage.getItem("mb/layout");
      const savedElements = localStorage.getItem("mb/elements");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
      if (savedLayout) setSelectedLayout(savedLayout);
      if (savedElements) {
        const parsed = JSON.parse(savedElements);
        if (Array.isArray(parsed)) {
          setCanvasElements(parsed);
          try { const { preloadFontsFromElements } = require('@/utils/fonts'); preloadFontsFromElements(parsed); } catch {}
        }
      }
    } catch {}
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Persist state (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("mb/theme", theme);
        localStorage.setItem("mb/layout", selectedLayout);
        localStorage.setItem("mb/elements", JSON.stringify(canvasElements));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [theme, selectedLayout, canvasElements]);

  // Command Palette keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleNewProject = () => {
    if (canvasElements.length > 0) {
      if (window.confirm("Are you sure you want to start a new project? This will clear your current moodboard.")) {
        setCanvasElements([]);
        toast.success("New project created!");
      }
    } else {
      toast.info("Canvas is already empty");
    }
  };

  const handleExport = () => {
    setIsAdvancedExportOpen(true);
  };

  const handleExportWithOptions = (options: any) => {
    console.log("Exporting with options:", options);
    toast.success(`Exporting as ${options.type}... 🎨`);
    setIsAdvancedExportOpen(false);
  };

  const handleUploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const newElement: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        imageUrl: url,
      };
      setCanvasElements((prev) => [...prev, newElement]);
      toast.success("Image added to canvas!");
    };
    input.click();
  };

  const handleAddColor = () => {
    // Generate random color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setSelectedColor(randomColor);
    toast.success("Color added to palette!");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the moodboard?")) {
      setCanvasElements([]);
      toast.success("Moodboard reset!");
    }
  };

  const handleDeleteElement = useCallback((id: string) => {
    setCanvasElements((prev: CanvasElementData[]) => prev.filter((el: CanvasElementData) => el.id !== id));
    toast.success("Element removed");
    setSelectedElementId((cur) => (cur === id ? null : cur));
  }, []);

  // Keyboard shortcuts: Delete/Backspace to remove selected (fallback last), Esc to close panels/clear selection, Cmd/Ctrl+S to persist immediately
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingTextActive()) {
        if (selectedElementId) {
          setCanvasElements((prev: CanvasElementData[]) => prev.filter((el) => el.id !== selectedElementId));
          toast.success('Deleted selected element');
          setSelectedElementId(null);
        } else {
          setCanvasElements((prev: CanvasElementData[]) => prev.slice(0, -1));
          toast.success('Deleted last element');
        }
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAIPromptOpen(false);
        setIsAIRecommendationsOpen(false);
        setIsGradientEditorOpen(false);
        setIsColorHarmonyOpen(false);
        setIsAdvancedExportOpen(false);
        
        setIsStoryModeOpen(false);
        setSelectedElementId(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        try {
          localStorage.setItem("mb/theme", theme);
          localStorage.setItem("mb/layout", selectedLayout);
          localStorage.setItem("mb/elements", JSON.stringify(canvasElements));
        } catch {}
        toast.success('Saved');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [theme, selectedLayout, canvasElements, selectedElementId]);

  function isEditingTextActive() {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElementData>) => {
    setCanvasElements((prev: CanvasElementData[]) => {
      const next = prev.map((el: CanvasElementData) => (el.id === id ? { ...el, ...updates } : el));
      try {
        localStorage.setItem("mb/elements", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dragType = e.dataTransfer.getData("type");
    const draggedColor = e.dataTransfer.getData("color");

    if (dragType === "text" && textContent.trim()) {
      const newElement: CanvasElementData = {
        id: `text-${Date.now()}`,
        type: "text",
        x,
        y,
        content: textContent,
        fontFamily,
        color: selectedColor,
      };
      setCanvasElements((prev: CanvasElementData[]) => [...prev, newElement]);
      toast.success("Text added to canvas!");
    } else if (dragType === "color") {
      const newElement: CanvasElementData = {
        id: `color-${Date.now()}`,
        type: "color",
        x,
        y,
        color: draggedColor || selectedColor,
      };
      setCanvasElements((prev: CanvasElementData[]) => [...prev, newElement]);
      toast.success("Color swatch added!");
    } else if (dragType?.startsWith("shape-")) {
      const shapeType = dragType.replace("shape-", "") as ShapeType;
      const newElement: CanvasElementData = {
        id: `shape-${Date.now()}`,
        type: "shape",
        x,
        y,
        shapeType,
        color: selectedColor,
      };
      setCanvasElements((prev: CanvasElementData[]) => [...prev, newElement]);
      toast.success("Shape added to canvas!");
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleShapeDragStart = (e: React.DragEvent, shapeType: string) => {
    e.dataTransfer.setData("type", `shape-${shapeType}`);
  };

  const handleAddShapeFromCommand = (shape: string) => {
    const newElement: CanvasElementData = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      shapeType: shape as ShapeType,
      color: selectedColor,
    };
    setCanvasElements((prev: CanvasElementData[]) => [...prev, newElement]);
    toast.success(`${shape} shape added!`);
  };

  const handleAIPromptApply = (result: any) => {
    const palette: string[] = result?.palette || [selectedColor];
    const fonts: string[] = result?.fonts || [fontFamily];
    const newEls: CanvasElementData[] = [];
    // 3 images placeholders
    const imgs = [
      "https://images.unsplash.com/photo-1646038572816-04ab3ff22b1f?w=600",
      "https://images.unsplash.com/photo-1630283017751-76e1fbb14d91?w=600",
      "https://images.unsplash.com/photo-1758539197206-f66723e880a2?w=600",
    ];
    imgs.forEach((url, i) => {
      newEls.push({
        id: `ai-image-${Date.now()}-${i}`,
        type: "image",
        x: 120 + i * 240,
        y: 140 + (i % 2) * 180,
        imageUrl: url,
      });
    });
    // 1 quote
    const appliedFont = fonts[0] || "Inter";
    newEls.push({
      id: `ai-text-${Date.now()}`,
      type: "text",
      x: 160,
      y: 420,
      content: "Design is thinking made visual.",
      fontFamily: appliedFont,
      color: "#111827",
    });
    // 2 color blocks
    (palette.slice(0, 2) as string[]).forEach((c, i) => {
      newEls.push({
        id: `ai-color-${Date.now()}-${i}`,
        type: "color",
        x: 520 + i * 160,
        y: 420,
        color: c,
      });
    });

    setSelectedColor(palette[0] || selectedColor);
    // Charger la police suggérée AVANT de monter les éléments
    if (appliedFont) ensureGoogleFont(appliedFont);
    setCanvasElements((prev: CanvasElementData[]) => [...prev, ...newEls]);
    toast.success("AI-generated moodboard applied! ✨");
  };

  const handleAIRecommendationInsert = (item: any) => {
    if (item?.type === "image" && item.url) {
      const el: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x: 180 + Math.random() * 240,
        y: 160 + Math.random() * 240,
        imageUrl: item.url,
      };
      setCanvasElements((p: CanvasElementData[]) => [...p, el]);
    } else if (item?.color) {
      const el: CanvasElementData = {
        id: `color-${Date.now()}`,
        type: "color",
        x: 180 + Math.random() * 240,
        y: 160 + Math.random() * 240,
        color: item.color,
      };
      setCanvasElements((p: CanvasElementData[]) => [...p, el]);
    } else if (item?.name && ["Grid","Masonry","Circle Pack","Editorial"].includes(item.name)) {
      const map: Record<string,string> = {"Grid":"grid","Masonry":"masonry","Circle Pack":"circle","Editorial":"editorial"};
      setSelectedLayout(map[item.name]);
      setCanvasElements((prev: CanvasElementData[]) => arrangeElements(prev, map[item.name] as any));
    }
    toast.success(`${item.type || item.name || "Item"} inserted!`);
  };

  const handleAIRecommendationReplace = (item: any) => {
    // Replace last element as a simple heuristic if none selected (selection to add later)
    setCanvasElements((prev: CanvasElementData[]) => {
      if (prev.length === 0) return prev;
      const idx = prev.length - 1;
      const target = prev[idx] as CanvasElementData;
      const updated: CanvasElementData = { ...target };
      if (item?.type === "image" && item.url) {
        updated.type = "image";
        updated.imageUrl = item.url;
      } else if (item?.color) {
        updated.type = "color";
        updated.color = item.color;
      }
      const copy: CanvasElementData[] = [...prev];
      copy[idx] = updated;
      return copy;
    });
    toast.success(`${item.type || item.name || "Item"} replaced!`);
  };

  const handleLayoutChange = (layout: string) => {
    setSelectedLayout(layout);
    toast.success(`Layout changed to ${layout}`);
  };

  const handleAutoArrange = () => {
    if (isLayoutLocked) {
      toast.info("Layout is locked");
      return;
    }
    setCanvasElements((prev: CanvasElementData[]) => arrangeElements(prev, selectedLayout as any));
    toast.success("Auto-arranged elements");
  };

  const handleGradientApply = (gradient: string) => {
    toast.success("Gradient applied!");
  };

  const handleColorHarmonyApply = (colors: string[]) => {
    toast.success(`Applied ${colors.length} colors from harmony!`);
  };

  

  const handleStoryPlay = () => {
    toast.success("Playing story mode...");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onNewProject={handleNewProject}
        onExport={handleExport}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      {/* Layout Engine Selector */}
      {canvasElements.length > 0 && (
        <LayoutEngineSelector
          selectedLayout={selectedLayout}
          onLayoutChange={handleLayoutChange}
          isLocked={isLayoutLocked}
          onLockToggle={() => setIsLayoutLocked(!isLayoutLocked)}
          onAutoArrange={handleAutoArrange}
        />
      )}
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
          textContent={textContent}
          onTextChange={setTextContent}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          onUploadImage={handleUploadImage}
          onAddColor={handleAddColor}
          onReset={handleReset}
          onExport={handleExport}
          onShapeDragStart={handleShapeDragStart}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        
        <Canvas
          elements={canvasElements}
          onDeleteElement={handleDeleteElement}
          onUpdateElement={handleUpdateElement}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onClearSelection={() => setSelectedElementId(null)}
        />

        {/* AI Recommendations Panel */}
        <AIRecommendations
          isOpen={isAIRecommendationsOpen}
          onClose={() => setIsAIRecommendationsOpen(false)}
          onInsert={handleAIRecommendationInsert}
          onReplace={handleAIRecommendationReplace}
        />
      </div>

      {/* Story Mode Timeline */}
      <StoryModeTimeline
        isOpen={isStoryModeOpen}
        onClose={() => setIsStoryModeOpen(false)}
        onPlay={handleStoryPlay}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onThemeToggle={handleThemeToggle}
        onExport={handleExport}
        onReset={handleReset}
        onUploadImage={handleUploadImage}
        onAddShape={handleAddShapeFromCommand}
        theme={theme}
        onAutoArrange={handleAutoArrange}
        onChangeLayout={(l) => {
          setSelectedLayout(l);
          setCanvasElements((prev: CanvasElementData[]) => arrangeElements(prev, l));
        }}
      />

      {/* AI Prompt to Board */}
      <PromptToBoard
        isOpen={isAIPromptOpen}
        onClose={() => setIsAIPromptOpen(false)}
        onApply={handleAIPromptApply}
      />

      {/* Gradient Editor */}
      <GradientEditor
        isOpen={isGradientEditorOpen}
        onClose={() => setIsGradientEditorOpen(false)}
        onApply={handleGradientApply}
      />

      {/* Color Harmony Tool */}
      <ColorHarmonyTool
        isOpen={isColorHarmonyOpen}
        onClose={() => setIsColorHarmonyOpen(false)}
        onApply={handleColorHarmonyApply}
        baseColor={selectedColor}
      />

      {/* Advanced Export */}
      <AdvancedExport
        isOpen={isAdvancedExportOpen}
        onClose={() => setIsAdvancedExportOpen(false)}
        onExport={handleExportWithOptions}
      />

      

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        <button
          onClick={() => setIsAIPromptOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          title="AI Generate"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">✨</span>
        </button>
        <button
          onClick={() => setIsAIRecommendationsOpen(!isAIRecommendationsOpen)}
          className="w-14 h-14 rounded-full bg-white dark:bg-card border-2 border-primary text-primary shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="AI Suggestions"
        >
          <span className="text-xl">💡</span>
        </button>
        <button
          onClick={() => setIsColorHarmonyOpen(true)}
          className="w-14 h-14 rounded-full bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="Color Harmony"
        >
          <span className="text-xl">🎨</span>
        </button>
        <button
          onClick={() => setIsGradientEditorOpen(true)}
          className="w-14 h-14 rounded-full bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="Gradient Editor"
        >
          <span className="text-xl">🌈</span>
        </button>
        
        <button
          onClick={() => setIsStoryModeOpen(!isStoryModeOpen)}
          className="w-14 h-14 rounded-full bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="Story Mode"
        >
          <span className="text-xl">🎬</span>
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-6 left-6 px-3 py-2 bg-black/80 dark:bg-white/10 backdrop-blur-md text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity z-30">
        Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded">⌘K</kbd> or{" "}
        <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Ctrl+K</kbd> for commands
      </div>
      <Toaster appTheme={theme} position="top-right" richColors />
    </div>
  );
}
