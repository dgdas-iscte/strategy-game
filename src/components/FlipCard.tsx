import { useState } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
  backLabel: string;
  backColor?: string;
  onFlip: () => void;
  children: React.ReactNode; // face-up content
  flipped?: boolean;
}

export default function FlipCard({
  backLabel,
  backColor = 'from-indigo-600 to-purple-700',
  onFlip,
  children,
  flipped: controlledFlipped,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = controlledFlipped ?? internalFlipped;

  const handleClick = () => {
    if (!flipped) {
      setInternalFlipped(true);
      onFlip();
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      {!flipped ? (
        <motion.button
          onClick={handleClick}
          className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${backColor} border-2 border-white/10
            flex flex-col items-center justify-center gap-4 cursor-pointer shadow-xl`}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-3xl">?</span>
          </div>
          <span className="text-lg font-bold text-white/90">{backLabel}</span>
          <span className="text-sm text-white/50">Click to draw</span>
        </motion.button>
      ) : (
        <motion.div
          className="w-full"
          initial={{ rotateY: 180, scale: 0.5 }}
          animate={{ rotateY: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
