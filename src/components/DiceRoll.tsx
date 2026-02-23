import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

interface DiceRollProps {
  onResult: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export default function DiceRoll({ onResult, label = 'Lançar Intensidade', disabled }: DiceRollProps) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roll = useCallback(() => {
    if (rolling || done) return;
    setRolling(true);

    let ticks = 0;
    const finalValue = Math.floor(Math.random() * 6) + 1;

    intervalRef.current = setInterval(() => {
      ticks++;
      setFace(DICE_FACES[Math.floor(Math.random() * 6)]);

      if (ticks >= 12) {
        clearInterval(intervalRef.current!);
        setFace(DICE_FACES[finalValue - 1]);
        setRolling(false);
        setDone(true);
        onResult(finalValue);
      }
    }, 80);
  }, [rolling, done, onResult]);

  if (done && face) {
    return (
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <span className="text-6xl">{face}</span>
        <span className="text-sm text-slate-400 font-mono">
          {face === '⚀' || face === '⚁' ? 'Fraco' : face === '⚂' || face === '⚃' ? 'Médio' : 'Forte'}
        </span>
      </motion.div>
    );
  }

  if (rolling && face) {
    return (
      <motion.div
        className="flex flex-col items-center gap-2"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 0.3 }}
      >
        <span className="text-6xl">{face}</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={() => roll()}
      disabled={disabled}
      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40
        rounded-xl font-bold text-lg transition-colors cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      🎲 {label}
    </motion.button>
  );
}
