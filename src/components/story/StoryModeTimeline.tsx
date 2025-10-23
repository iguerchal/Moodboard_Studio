import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, SkipBack, SkipForward, Plus, X, Film } from "lucide-react";
import { Button } from "../ui/button";

interface TimelineFrame {
  id: string;
  name: string;
  duration: number;
  thumbnail: string;
}

interface StoryModeTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export function StoryModeTimeline({ isOpen, onClose, onPlay }: StoryModeTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<TimelineFrame[]>([
    { id: "1", name: "Opening", duration: 2, thumbnail: "#6366F1" },
    { id: "2", name: "Concept", duration: 3, thumbnail: "#EC4899" },
    { id: "3", name: "Details", duration: 2.5, thumbnail: "#10B981" },
    { id: "4", name: "Final", duration: 2, thumbnail: "#F59E0B" },
  ]);
  const timersRef = useRef<number[]>([]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      onPlay();
    }
  };

  const handlePrevious = () => {
    setCurrentFrame((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentFrame((prev) => Math.min(frames.length - 1, prev + 1));
  };

  const handleAddFrame = () => {
    const newFrame: TimelineFrame = {
      id: Date.now().toString(),
      name: `Frame ${frames.length + 1}`,
      duration: 2,
      thumbnail: "#3B82F6",
    };
    setFrames([...frames, newFrame]);
  };

  // Auto-advance frames while playing
  useEffect(() => {
    // clear any pending timers first
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (!isPlaying) return;
    let acc = 0;
    const total = frames.reduce((sum, f) => sum + f.duration, 0);
    frames.forEach((f, idx) => {
      if (idx === 0) return; // start at current frame
      acc += frames[idx - 1].duration * 1000;
      const t = window.setTimeout(() => {
        setCurrentFrame((prev) => Math.min(prev + 1, frames.length - 1));
      }, acc);
      timersRef.current.push(t);
    });
    // stop after last frame
    const stopTimer = window.setTimeout(() => {
      setIsPlaying(false);
    }, total * 1000);
    timersRef.current.push(stopTimer);
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [isPlaying, frames]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border shadow-2xl z-40"
    >
      {/* Now Playing overlay */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[76px] left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-md bg-black/60 dark:bg-white/10 text-white text-sm shadow-md"
          >
            {frames[currentFrame]?.name}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4>Story Mode</h4>
            <p className="text-muted-foreground">Create an animated narrative</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddFrame}
            className="gap-2"
          >
            <Plus className="w-3 h-3" />
            Add Frame
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentFrame === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleNext}
              disabled={currentFrame === frames.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Frames */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2">
            {frames.map((frame, idx) => (
              <motion.button
                key={frame.id}
                onClick={() => setCurrentFrame(idx)}
                className={`relative flex-shrink-0 group ${
                  currentFrame === idx ? "ring-2 ring-primary" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-32 h-20 rounded-lg border-2 border-border flex items-center justify-center"
                  style={{ backgroundColor: frame.thumbnail }}
                >
                  <span className="text-white drop-shadow-lg">{frame.name}</span>
                </div>
                <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white rounded text-xs">
                  {frame.duration}s
                </div>
                {currentFrame === idx && (
                  <motion.div
                    layoutId="active-frame"
                    className="absolute -inset-0.5 border-2 border-primary rounded-lg pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: "0%" }}
            animate={{
              width: isPlaying ? "100%" : `${(currentFrame / (frames.length - 1)) * 100}%`,
            }}
            transition={{
              duration: isPlaying ? frames.reduce((sum, f) => sum + f.duration, 0) : 0.3,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
