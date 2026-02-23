import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { boardMaxPosition } from '../utils';

const COLS = 7;
const CELL_SIZE = 42; // px
const GAP = 5;        // px

interface ProgressBoardProps {
  currentRound: number;
  totalRounds?: number;
  boardPosition: number;
}

/** Return (row, col) for a cell index in a serpentine layout. */
function serpentineCoord(index: number): [row: number, col: number] {
  const row = Math.floor(index / COLS);
  const colInRow = index % COLS;
  const col = row % 2 === 0 ? colInRow : COLS - 1 - colInRow;
  return [row, col];
}

/** Pixel offset for center of a cell. */
function cellCenter(index: number): { x: number; y: number } {
  const [row, col] = serpentineCoord(index);
  return {
    x: col * (CELL_SIZE + GAP) + CELL_SIZE / 2,
    y: row * (CELL_SIZE + GAP) + CELL_SIZE / 2,
  };
}

export default function ProgressBoard({
  currentRound,
  totalRounds = 6,
  boardPosition,
}: ProgressBoardProps) {
  const maxPos = boardMaxPosition(totalRounds);
  const totalCells = maxPos + 1;
  const totalRows = Math.ceil(totalCells / COLS);

  const cells = useMemo(
    () => Array.from({ length: totalCells }, (_, i) => {
      const [row, col] = serpentineCoord(i);
      return { index: i, row, col };
    }),
    [totalCells],
  );

  // Track previous position for bounce
  const prevPos = useRef(boardPosition);
  const [bouncing, setBouncing] = useState(false);
  const reachedEnd = boardPosition >= maxPos;

  useEffect(() => {
    if (prevPos.current !== boardPosition) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 600);
      prevPos.current = boardPosition;
      return () => clearTimeout(timer);
    }
  }, [boardPosition]);

  // Pawn center
  const pawnIdx = Math.min(boardPosition, totalCells - 1);
  const pawnCenter = cellCenter(pawnIdx);

  // Grid dimensions
  const gridW = COLS * CELL_SIZE + (COLS - 1) * GAP;
  const gridH = totalRows * CELL_SIZE + (totalRows - 1) * GAP;

  // Connectors between sequential cells
  const connectors = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; visited: boolean }[] = [];
    for (let i = 0; i < totalCells - 1; i++) {
      const a = cellCenter(i);
      const b = cellCenter(i + 1);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, visited: i < boardPosition });
    }
    return lines;
  }, [totalCells, boardPosition]);

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur rounded-2xl px-4 py-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Tabuleiro
        </h3>
        <span className="text-xs font-mono text-slate-500">
          Posição: {boardPosition} / {maxPos}
        </span>
      </div>

      {/* Board container */}
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: gridW, height: gridH }}>
          {/* SVG connectors */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={gridW}
            height={gridH}
          >
            {connectors.map((c, i) => (
              <line
                key={i}
                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                stroke={c.visited ? 'rgba(99,102,241,0.35)' : 'rgba(71,85,105,0.3)'}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Cells */}
          {cells.map((cell) => {
            const isLast = cell.index === maxPos;
            const isVisited = cell.index < boardPosition;
            const isCurrent = cell.index === boardPosition;

            return isLast ? (
              <motion.div
                key={cell.index}
                className={`
                  absolute flex items-center justify-center
                  rounded-lg border-2 text-sm font-bold
                  ${reachedEnd
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30'
                    : isVisited
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400/70'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-500/60'
                  }
                `}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: cell.col * (CELL_SIZE + GAP),
                  top: cell.row * (CELL_SIZE + GAP),
                }}
                animate={reachedEnd ? { scale: [1, 1.1, 1] } : {}}
                transition={reachedEnd ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
              >
                🏆
              </motion.div>
            ) : (
              <div
                key={cell.index}
                className={`
                  absolute flex items-center justify-center
                  rounded-lg border-2 text-xs font-bold transition-colors duration-300
                  ${isCurrent
                    ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/20'
                    : isVisited
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400/70'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-600'
                  }
                `}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: cell.col * (CELL_SIZE + GAP),
                  top: cell.row * (CELL_SIZE + GAP),
                }}
              >
                {cell.index}
              </div>
            );
          })}

          {/* Animated pawn */}
          <motion.div
            className="absolute z-10 flex items-center justify-center pointer-events-none"
            animate={{
              left: pawnCenter.x - CELL_SIZE / 2,
              top: pawnCenter.y - CELL_SIZE / 2,
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 13,
            }}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            <motion.span
              className="text-2xl drop-shadow-lg select-none"
              animate={
                reachedEnd && bouncing
                  ? { scale: [1, 1.8, 1.2, 1.6, 1], y: [0, -16, -4, -12, 0], rotate: [0, -15, 15, -10, 0] }
                  : bouncing
                  ? { scale: [1, 1.5, 1], y: [0, -10, 0] }
                  : {}
              }
              transition={{ duration: reachedEnd && bouncing ? 0.8 : 0.5, ease: 'easeOut' }}
            >
              ♟
            </motion.span>
          </motion.div>

          {/* Celebration particles when reaching the end */}
          {reachedEnd && bouncing && (
            <>
              {['🎉', '⭐', '✨', '🎊'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute z-20 text-lg pointer-events-none select-none"
                  initial={{
                    left: pawnCenter.x - 8,
                    top: pawnCenter.y - 8,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    left: pawnCenter.x - 8 + (i % 2 === 0 ? -1 : 1) * (20 + i * 10),
                    top: pawnCenter.y - 8 - 20 - i * 8,
                    opacity: 0,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Round indicator */}
      <div className="flex items-center justify-center mt-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Ronda {currentRound} / {totalRounds}
        </span>
      </div>
    </div>
  );
}
