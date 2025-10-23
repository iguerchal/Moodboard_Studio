import { motion } from "motion/react";
import { X, Image, Palette, Type, Grid3x3, Plus, Replace } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";

interface AIRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (item: any) => void;
  onReplace: (item: any) => void;
}

const mockImages = [
  "https://images.unsplash.com/photo-1646038572816-04ab3ff22b1f?w=200",
  "https://images.unsplash.com/photo-1630283017751-76e1fbb14d91?w=200",
  "https://images.unsplash.com/photo-1758539197206-f66723e880a2?w=200",
];

const mockColors = [
  { name: "Sunset Orange", color: "#FF6B35", harmony: "complementary" },
  { name: "Ocean Blue", color: "#3B82F6", harmony: "analogous" },
  { name: "Forest Green", color: "#10B981", harmony: "triadic" },
  { name: "Royal Purple", color: "#8B5CF6", harmony: "split-complementary" },
];

const mockFonts = [
  { name: "Inter", category: "Sans-serif", pairing: "Playfair Display" },
  { name: "Space Grotesk", category: "Display", pairing: "Inter" },
  { name: "Crimson Pro", category: "Serif", pairing: "Work Sans" },
];

export function AIRecommendations({
  isOpen,
  onClose,
  onInsert,
  onReplace,
}: AIRecommendationsProps) {
  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-[60px] bottom-0 w-[320px] bg-sidebar dark:bg-card border-l border-sidebar-border shadow-2xl z-40 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </div>
            <div>
              <h3>AI Suggestions</h3>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI suggestions">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="images" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full grid grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="images" className="gap-1" aria-label="Images">
              <Image className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-1" aria-label="Colors">
              <Palette className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="fonts" className="gap-1" aria-label="Fonts">
              <Type className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="layouts" className="gap-1" aria-label="Layouts">
              <Grid3x3 className="w-3.5 h-3.5" />
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Images Tab */}
            <TabsContent value="images" className="mt-0 space-y-3">
              {mockImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={img}
                    alt={`Suggestion ${idx + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onInsert({ type: "image", url: img })}
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onReplace({ type: "image", url: img })}
                    >
                      <Replace className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-0 space-y-3">
              {mockColors.map((colorItem, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg border border-border hover:border-primary transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-lg shadow-md"
                      style={{ backgroundColor: colorItem.color }}
                    />
                    <div className="flex-1">
                      <p>{colorItem.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {colorItem.harmony}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onInsert(colorItem)}
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Fonts Tab */}
            <TabsContent value="fonts" className="mt-0 space-y-3">
              {mockFonts.map((font, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-border hover:border-primary transition-colors group"
                >
                  <p style={{ fontFamily: font.name }} className="mb-1">
                    {font.name}
                  </p>
                  <p className="text-muted-foreground mb-2">{font.category}</p>
                  <p className="text-muted-foreground mb-3">
                    Pairs with: {font.pairing}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onInsert(font)}
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Apply Font
                  </Button>
                </motion.div>
              ))}
            </TabsContent>

            {/* Layouts Tab */}
            <TabsContent value="layouts" className="mt-0 space-y-3">
              {["Grid", "Masonry", "Circle Pack", "Editorial"].map((layout, idx) => (
                <motion.div
                  key={layout}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors group cursor-pointer"
                  onClick={() => onInsert({ type: "layout", name: layout })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{layout} Layout</p>
                      <p className="text-muted-foreground">Auto-arrange elements</p>
                    </div>
                    <Grid3x3 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.aside>
  );
}
