import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Wand2, X, Loader2, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";

interface PromptToBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: any) => void;
}

const styleChips = [
  { id: "minimal", label: "Minimal", gradient: "from-gray-100 to-gray-200" },
  { id: "editorial", label: "Editorial", gradient: "from-purple-100 to-pink-100" },
  { id: "brutalist", label: "Brutalist", gradient: "from-yellow-100 to-orange-100" },
  { id: "retrofuture", label: "Retrofuture", gradient: "from-cyan-100 to-blue-100" },
  { id: "organic", label: "Organic", gradient: "from-green-100 to-emerald-100" },
];

export function PromptToBoard({ isOpen, onClose, onApply }: PromptToBoardProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    setState("loading");
    
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setResults({
      palette: ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"],
      fonts: ["Inter", "Playfair Display", "Space Grotesk"],
      mood: ["Modern", "Creative", "Bold", "Vibrant"],
      layout: "editorial",
    });
    
    setState("success");
  };

  const handleApply = () => {
    onApply(results);
    onClose();
    setPrompt("");
    setState("idle");
    setResults(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPrompt("");
      setState("idle");
      setResults(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-[100]"
            style={{ backdropFilter: "blur(12px)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-hidden z-[101]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-prompt-title"
          >
            <div className="mx-4 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 id="ai-prompt-title">AI Moodboard Generator</h2>
                      <p className="text-muted-foreground">
                        Describe your vision and let AI create a moodboard
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close AI generator">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    Describe your moodboard
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A modern tech startup brand with bold colors and clean typography, inspired by minimalism and futurism...'"
                    className="min-h-[120px] resize-none bg-muted/50 border-2 focus:border-primary transition-colors"
                  />
                </div>

                {/* Style Chips */}
                <div className="space-y-3">
                  <label>Style Direction</label>
                  <div className="flex flex-wrap gap-2">
                    {styleChips.map((style) => (
                      <motion.button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedStyle === style.id
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className={`w-full h-1 rounded-full mb-2 bg-gradient-to-r ${style.gradient}`}
                        />
                        {style.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                  {state === "loading" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="py-12 flex flex-col items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-12 h-12 text-primary mb-4" />
                      </motion.div>
                      <p className="text-muted-foreground">Generating your moodboard...</p>
                    </motion.div>
                  )}

                  {state === "success" && results && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Success Badge */}
                      <div className="flex items-center gap-2 text-success">
                        <Check className="w-5 h-5" />
                        <span>Moodboard generated successfully!</span>
                      </div>

                      {/* Color Palette */}
                      <div className="space-y-3">
                        <h4>Extracted Color Palette</h4>
                        <div className="flex gap-2">
                          {results.palette.map((color: string, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex-1 h-16 rounded-lg shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Fonts */}
                      <div className="space-y-3">
                        <h4>Suggested Typefaces</h4>
                        <div className="flex gap-2">
                          {results.fonts.map((font: string) => (
                            <Badge
                              key={font}
                              variant="outline"
                              className="px-4 py-2 border-2"
                            >
                              {font}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Mood Tags */}
                      <div className="space-y-3">
                        <h4>Mood & Vibe</h4>
                        <div className="flex gap-2">
                          {results.mood.map((tag: string) => (
                            <Badge
                              key={tag}
                              className="bg-primary/10 text-primary px-3 py-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center text-muted-foreground">
                        <Wand2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                        Preview board layout: {results.layout}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                {state === "success" ? (
                  <Button
                    onClick={handleApply}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Apply to Canvas
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || state === "loading"}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    {state === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
