"use client";

import { motion } from "framer-motion";

interface WorkflowControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
}

export function WorkflowControls({
  isPlaying,
  currentStep,
  totalSteps,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
}: WorkflowControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Step backward */}
      <motion.button
        className="w-10 h-10 flex items-center justify-center border border-[#333] hover:border-white hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={onStepBackward}
        disabled={currentStep === 0}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Previous step"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      </motion.button>

      {/* Play/Pause */}
      <motion.button
        className="w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-[#ddd] transition-colors"
        onClick={onPlayPause}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </motion.button>

      {/* Step forward */}
      <motion.button
        className="w-10 h-10 flex items-center justify-center border border-[#333] hover:border-white hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={onStepForward}
        disabled={currentStep >= totalSteps - 1}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Next step"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </motion.button>

      {/* Reset */}
      <motion.button
        className="w-10 h-10 flex items-center justify-center border border-[#333] hover:border-white hover:bg-white hover:text-black transition-colors"
        onClick={onReset}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Reset"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </motion.button>

      {/* Progress indicator */}
      <div className="ml-4 flex items-center gap-3">
        <span className="text-[#666] text-sm font-mono">
          {currentStep + 1} / {totalSteps}
        </span>
        
        {/* Progress bar */}
        <div className="w-32 h-1 bg-[#222] overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

// Step description display
export function StepDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-[#111] border border-[#222] p-4"
    >
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <p className="text-[#888] text-sm">{description}</p>
    </motion.div>
  );
}
