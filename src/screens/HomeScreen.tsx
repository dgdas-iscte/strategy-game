import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store';
import ConfirmDialog from '../components/ConfirmDialog';

const DECKS = [
  { label: 'PESTEL', color: 'from-red-500 to-amber-500' },
  { label: 'Cinco Forças', color: 'from-blue-500 to-cyan-500' },
  { label: 'VRIO', color: 'from-emerald-500 to-teal-500' },
];

const GAME_LENGTHS = [
  { rounds: 2, label: 'Rápido', desc: '2 rondas — ideal para experimentar os conceitos base' },
  { rounds: 4, label: 'Regular', desc: '4 rondas — equilíbrio entre profundidade e duração' },
  { rounds: 6, label: 'Longo', desc: '6 rondas — experiência completa com análise aprofundada' },
] as const;

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const hasSave = state._returnPhase !== null && state._returnPhase !== 'home';
  const [showReset, setShowReset] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState(6);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Title */}
      <motion.h1
        className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text
          bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-3 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Arena Estratégica
      </motion.h1>

      <motion.p
        className="text-slate-400 text-base mb-12 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Foste nomeado para o conselho de administração da NexaCorp. Utiliza as tuas capacidades de Estratégia, através da Análise Interna e Externa, para levar a empresa ao sucesso! Será que és capaz?
      </motion.p>

      {/* Decorative deck cards */}
      <div className="flex gap-6 mb-12">
        {DECKS.map((deck, i) => (
          <motion.div
            key={deck.label}
            className={`w-28 h-40 sm:w-36 sm:h-48 rounded-2xl bg-gradient-to-br ${deck.color}
              border border-white/10 shadow-xl flex flex-col items-center justify-center
              cursor-default select-none`}
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { delay: 0.4 + i * 0.15 },
              y: {
                delay: 0.4 + i * 0.15,
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
              },
            }}
          >
            <span className="text-3xl mb-2">🃏</span>
            <span className="text-sm font-bold text-white/90 text-center px-2">
              {deck.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Game length selector */}
      <motion.div
        className="mb-8 w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
          Duração do Jogo
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {GAME_LENGTHS.map((gl) => (
            <button
              key={gl.rounds}
              onClick={() => setSelectedRounds(gl.rounds)}
              className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all
                ${selectedRounds === gl.rounds
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
            >
              <span className={`block text-lg font-bold ${selectedRounds === gl.rounds ? 'text-white' : 'text-slate-300'}`}>
                {gl.label}
              </span>
              <span className="block text-[10px] text-slate-500 mt-1 leading-tight">
                {gl.desc}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-64">
        <motion.button
          onClick={() => {
            if (hasSave) {
              setShowReset(true);
            } else {
              dispatch({ type: 'START_GAME', totalRounds: selectedRounds });
            }
          }}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg
            transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Novo Jogo
        </motion.button>

        {hasSave && (
          <motion.button
            onClick={() => dispatch({ type: 'CONTINUE_GAME' })}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg
              transition-colors border border-slate-700 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Continuar
          </motion.button>
        )}
      </div>


      {/* Footer */}
      <motion.p
        className="mt-16 text-xs text-slate-600 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Aula de Estratégia Executiva — Jogo Offline Single-Page
      </motion.p>

      {/* Reset confirmation dialog */}
      <ConfirmDialog
        open={showReset}
        title="Iniciar Novo Jogo?"
        message="Tem um jogo em progresso. Iniciar um novo jogo irá apagar todo o progresso. Esta ação não pode ser revertida."
        confirmLabel="Novo Jogo"
        cancelLabel="Continuar a Jogar"
        onConfirm={() => {
          setShowReset(false);
          dispatch({ type: 'RESET' });
          dispatch({ type: 'START_GAME', totalRounds: selectedRounds });
        }}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
