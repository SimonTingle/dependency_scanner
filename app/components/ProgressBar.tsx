'use client';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex justify-between text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest">
        <span>Scanning Repository...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-blue-900/20 animate-pulse"></div>
        
        {/* The Fill Bar */}
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>
      <p className="text-center text-gray-500 text-xs mt-2">
        {progress < 30 && "Fetching manifest..."}
        {progress >= 30 && progress < 70 && "Cross-referencing registries..."}
        {progress >= 70 && progress < 100 && "Analyzing vulnerabilities..."}
        {progress === 100 && "Analysis Complete."}
      </p>
    </div>
  );
}
