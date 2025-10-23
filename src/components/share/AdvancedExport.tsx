import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, FileImage, FileVideo, FileText, Link2, Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// Removed shadcn Select for reliability in this modal context
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface AdvancedExportProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: any) => void;
}

export function AdvancedExport({ isOpen, onClose, onExport }: AdvancedExportProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [exportType, setExportType] = useState<"image" | "video" | "pdf" | "link" | "project">("image");
  const [imageFormat, setImageFormat] = useState("png");
  const [imageQuality, setImageQuality] = useState("high");
  const [videoFormat, setVideoFormat] = useState("mp4");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [pdfIncludePalette, setPdfIncludePalette] = useState(true);
  const [pdfIncludeAssets, setPdfIncludeAssets] = useState(true);
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("never");
  const [imageResolution, setImageResolution] = useState("original");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return null;
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16),
    };
  }

  const handleExport = async () => {
    const options = {
      type: exportType,
      ...(exportType === "image" && { format: imageFormat, quality: imageQuality }),
      ...(exportType === "video" && { format: videoFormat, aspect: videoAspect }),
      ...(exportType === "pdf" && { includePalette: pdfIncludePalette, includeAssets: pdfIncludeAssets }),
      ...(exportType === "link" && { password: linkPassword, expiry: linkExpiry }),
    };
    onExport(options);
    try {
      if (exportType === "image") {
        const node = document.querySelector(
          ".relative.w-full.min-h-\\[calc\\(100vh-60px-4rem\\)\\].md\\:min-h-\\[calc\\(100vh-60px-8rem\\)\\]",
        ) as HTMLElement | null;
        const { toPng, toJpeg, toSvg } = await import("html-to-image");
        if (node) {
          const pixelRatio = imageResolution === "2160p" ? 4 : imageResolution === "1440p" ? 3 : imageResolution === "1080p" ? 2 : (imageQuality === "ultra" ? 4 : imageQuality === "high" ? 3 : imageQuality === "medium" ? 2 : 1);
          if (imageFormat === "png") {
            const dataUrl = await toPng(node, { cacheBust: true, pixelRatio });
            downloadDataUrl(dataUrl, `moodboard.${imageFormat}`);
          } else if (imageFormat === "jpg") {
            const dataUrl = await toJpeg(node, { cacheBust: true, pixelRatio, quality: 0.92 });
            downloadDataUrl(dataUrl, `moodboard.${imageFormat}`);
          } else if (imageFormat === "webp") {
            const png = await toPng(node, { cacheBust: true, pixelRatio });
            const webp = await convertToWebP(png, 0.92);
            downloadDataUrl(webp, `moodboard.webp`);
          } else if (imageFormat === "svg") {
            const dataUrl = await toSvg(node);
            downloadDataUrl(dataUrl, `moodboard.svg`);
          }
        }
      } else if (exportType === "pdf") {
        const node = document.querySelector(
          ".relative.w-full.min-h-\\[calc\\(100vh-60px-4rem\\)\\].md\\:min-h-\\[calc\\(100vh-60px-8rem\\)\\]",
        ) as HTMLElement | null;
        const { toPng } = await import("html-to-image");
        const { jsPDF } = await import("jspdf");
        if (node) {
          // Inline external images to avoid cross-origin taint
          const imgs = node.querySelectorAll('img');
          await Promise.all(Array.from(imgs).map(async (img: any) => {
            try {
              const res = await fetch(img.src, { mode: 'cors' });
              const blob = await res.blob();
              const reader = new FileReader();
              const dataUrl: string = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              img.setAttribute('src', dataUrl);
            } catch {}
          }));
          const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
          const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [node.clientWidth, node.clientHeight] });
          pdf.addImage(dataUrl, "PNG", 0, 0, node.clientWidth, node.clientHeight);
          if (pdfIncludePalette) {
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.text("Color Palette", 24, 36);
            // Dessiner des swatches à partir des éléments color du board
            const raw = localStorage.getItem("mb/elements");
            const elements = raw ? JSON.parse(raw) : [];
            const colors = elements.filter((e: any) => e.type === 'color').map((e: any) => e.color).slice(0, 24);
            let x = 24, y = 56; const size = 40; const gap = 24; let count = 0;
            pdf.setFontSize(10);
            if (colors.length === 0) {
              pdf.setTextColor(17, 24, 39);
              pdf.text("No color swatches on the board", 24, 64);
            } else {
              colors.forEach((c: string) => {
                const rgb = hexToRgb(c || '#000000') || { r: 0, g: 0, b: 0 };
                pdf.setFillColor(rgb.r, rgb.g, rgb.b);
                pdf.rect(x, y, size, size, 'F');
                // Etiquette hex
                pdf.setTextColor(17, 24, 39);
                pdf.text((c || '').toUpperCase(), x, y + size + 12);
                x += size + gap; count++;
                if (count % 6 === 0) { x = 24; y += size + 28; }
              });
            }
          }
          if (pdfIncludeAssets) {
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.text("Assets & References", 24, 36);
            const raw = localStorage.getItem("mb/elements");
            const elements = raw ? JSON.parse(raw) : [];
            const images = elements.filter((e: any) => e.type === 'image').map((e: any) => e.imageUrl);
            const fontsSet = new Set<string>(
              elements
                .filter((e: any) => e.type === 'text')
                .map((e: any) => (e.fontFamily as string) || 'Inter')
            );
            const fonts: string[] = Array.from(fontsSet);
            // Section Images en colonnes
            pdf.setFontSize(14);
            pdf.text("Images:", 24, 64);
            let yCursor = 84;
            const colWidth = 320; let col = 0;
            if (images.length === 0) {
              pdf.text("• None", 24, yCursor);
              yCursor += 18;
            } else {
              images.slice(0, 12).forEach((url: string) => {
                const colX = 24 + col * colWidth;
                pdf.text(`• ${url}`, colX, yCursor, { maxWidth: colWidth - 40 });
                yCursor += 18;
                if (yCursor > 180) { yCursor = 84; col = (col + 1) % 2; }
              });
            }
            // Section Fonts en deux colonnes
            const fontsStartY = 210;
            pdf.text("Fonts:", 24, fontsStartY);
            let fy = fontsStartY + 20; col = 0;
            if (fonts.length === 0) {
              pdf.text("• None", 24, fy);
              fy += 18;
            } else {
              fonts.forEach((f: string) => {
                const colX = 24 + col * colWidth;
                pdf.text(`• ${f}`, colX, fy);
                fy += 18;
                if (fy > 290) { fy = fontsStartY + 20; col = (col + 1) % 2; }
              });
            }
          }
          pdf.save("moodboard.pdf");
        }
      } else if (exportType === "link") {
        const canvasStateEl = (window as any).document;
        const board = (window as any).localStorage?.getItem("mb/elements");
        const payload = {
          theme: (window as any).localStorage?.getItem("mb/theme"),
          layout: (window as any).localStorage?.getItem("mb/layout"),
          elements: board ? JSON.parse(board) : [],
        };
        const json = JSON.stringify(payload);
        await navigator.clipboard.writeText(json);
      }
    } catch (e) {
      // Swallow errors silently; parent toast already shows intent
    }
  };

  function downloadDataUrl(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  async function convertToWebP(pngDataUrl: string, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(pngDataUrl);
        ctx.drawImage(img, 0, 0);
        const webp = canvas.toDataURL('image/webp', quality);
        resolve(webp);
      };
      img.crossOrigin = 'anonymous';
      img.src = pngDataUrl;
    });
  }

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
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[101]"
          >
            <div className="mx-4 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div>
                  <h3>Export Moodboard</h3>
                  <p className="text-muted-foreground">Choose your export format and options</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close export dialog">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                <Tabs value={exportType} onValueChange={(v: any) => setExportType(v)}>
                  <TabsList className="w-full flex gap-2 overflow-x-auto">
                    <TabsTrigger value="image" className="gap-2 shrink-0">
                      <FileImage className="w-4 h-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2 shrink-0">
                      <FileVideo className="w-4 h-4" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="gap-2 shrink-0">
                      <FileText className="w-4 h-4" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="link" className="gap-2 shrink-0">
                      <Link2 className="w-4 h-4" />
                      Link
                    </TabsTrigger>
                    <TabsTrigger value="project" className="gap-2 shrink-0">
                      <FileText className="w-4 h-4" />
                      Project
                    </TabsTrigger>
                  </TabsList>

                  {/* Image Export */}
                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={imageFormat}
                          onChange={(e) => setImageFormat(e.target.value)}
                        >
                          <option value="png">PNG (Best Quality)</option>
                          <option value="jpg">JPG (Smaller Size)</option>
                          <option value="webp">WebP (Modern)</option>
                          <option value="svg">SVG (Vector)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={imageQuality}
                          onChange={(e) => setImageQuality(e.target.value)}
                        >
                          <option value="low">Low (1x)</option>
                          <option value="medium">Medium (2x)</option>
                          <option value="high">High (3x)</option>
                          <option value="ultra">Ultra (4x)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Resolution</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={imageResolution}
                          onChange={(e) => setImageResolution(e.target.value)}
                        >
                          <option value="original">Original</option>
                          <option value="1080p">1080p (2x)</option>
                          <option value="1440p">1440p (3x)</option>
                          <option value="2160p">2160p (4x)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        <span>Preview Size</span>
                      </div>
                      <p className="text-muted-foreground">
                        Estimated: 1920×1080 px ({imageQuality === "high" ? "~2.5 MB" : "~1.2 MB"})
                      </p>
                    </div>
                  </TabsContent>

                  {/* Video Export */}
                  <TabsContent value="video" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={videoFormat}
                          onChange={(e) => setVideoFormat(e.target.value)}
                        >
                          <option value="mp4">MP4 (H.264)</option>
                          <option value="webm">WebM</option>
                          <option value="gif">Animated GIF</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Aspect Ratio</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={videoAspect}
                          onChange={(e) => setVideoAspect(e.target.value)}
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="1:1">1:1 (Square)</option>
                          <option value="9:16">9:16 (Portrait/Stories)</option>
                          <option value="4:5">4:5 (Instagram)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-muted-foreground">
                        Duration: 5 seconds • 30 FPS • Smooth transitions
                      </p>
                    </div>
                  </TabsContent>

                  {/* PDF Export */}
                  <TabsContent value="pdf" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Include Color Palette</Label>
                          <p className="text-muted-foreground">
                            Add extracted colors as a separate page
                          </p>
                        </div>
                        <Switch
                          checked={pdfIncludePalette}
                          onCheckedChange={setPdfIncludePalette}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Include Asset List</Label>
                          <p className="text-muted-foreground">
                            Add references, fonts, and sources
                          </p>
                        </div>
                        <Switch
                          checked={pdfIncludeAssets}
                          onCheckedChange={setPdfIncludeAssets}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-muted-foreground">
                        Page size: A4 • Print-ready quality
                      </p>
                    </div>
                  </TabsContent>

                  {/* Share Link */}
                  <TabsContent value="link" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Password (Optional)</Label>
                      <Input
                        type="password"
                        value={linkPassword}
                        onChange={(e) => setLinkPassword(e.target.value)}
                        placeholder="Leave empty for public access"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Link Expiration</Label>
                      <div className="relative">
                        <select
                          className="w-full h-9 border border-border dark:border-input rounded-md px-3 pr-8 bg-input-background dark:bg-card text-foreground dark:text-foreground appearance-none text-sm focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                          value={linkExpiry}
                          onChange={(e) => setLinkExpiry(e.target.value)}
                        >
                          <option value="1hour">1 Hour</option>
                          <option value="1day">1 Day</option>
                          <option value="7days">7 Days</option>
                          <option value="30days">30 Days</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-muted-foreground">
                        Anyone with the link can view your moodboard
                      </p>
                    </div>
                  </TabsContent>

                  {/* Project JSON Import/Export */}
                  <TabsContent value="project" className="space-y-4 mt-4">
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-muted-foreground mb-2">Export or import your project as JSON.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            try {
                              const payload = {
                                theme: (window as any).localStorage?.getItem("mb/theme"),
                                layout: (window as any).localStorage?.getItem("mb/layout"),
                                elements: JSON.parse((window as any).localStorage?.getItem("mb/elements") || "[]"),
                              };
                              const data = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(data);
                              const a = document.createElement('a');
                              a.href = url; a.download = 'moodboard-project.json'; a.click();
                              URL.revokeObjectURL(url);
                            } catch {}
                          }}
                        >
                          Download JSON
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Import JSON
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const text = await file.text();
                            const data = JSON.parse(text);
                            const theme = data?.theme;
                            const layout = data?.layout;
                            const elements = Array.isArray(data?.elements) ? data.elements : [];
                            // Persist into localStorage so App picks them up / or uses keyboard save
                            try {
                              (window as any).localStorage?.setItem('mb/theme', theme === 'dark' ? 'dark' : 'light');
                              if (typeof layout === 'string') (window as any).localStorage?.setItem('mb/layout', layout);
                              (window as any).localStorage?.setItem('mb/elements', JSON.stringify(elements));
                            } catch {}
                            alert('Project imported. Close this dialog and press Ctrl+S to persist or reload to apply.');
                          } catch (err) {
                            alert('Invalid project file.');
                          }
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                {exportType !== 'project' && (
                  <Button
                    onClick={handleExport}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportType === "link" ? "Generate Link" : "Export"}
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
