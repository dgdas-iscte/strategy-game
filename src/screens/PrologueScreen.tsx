import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store';
import { PROLOGUE_SCENES } from '../data';

export default function PrologueScreen() {
  const { state, dispatch } = useGame();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const scene = PROLOGUE_SCENES[sceneIdx];
  const isLast = sceneIdx === PROLOGUE_SCENES.length - 1;

  // Restore selection if user navigates back
  const existing = state.prologueChoices.find((c) => c.scene === scene.scene);
  const currentSelection = selected ?? existing?.value ?? null;

  const handleSelect = (value: string) => {
    setSelected(value);
    const option = scene.options.find((o) => o.value === value)!;
    dispatch({
      type: 'SET_PROLOGUE',
      scene: scene.scene,
      question: scene.question,
      answer: option.label,
      value: option.value,
    });
  };

  const handleNext = () => {
    if (isLast) {
      dispatch({ type: 'FINISH_PROLOGUE' });
    } else {
      setSceneIdx((i) => i + 1);
      setSelected(null);
    }
  };

  const handleBack = () => {
    if (sceneIdx > 0) {
      setSceneIdx((i) => i - 1);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex gap-2">
          {PROLOGUE_SCENES.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= sceneIdx ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Cena {sceneIdx + 1} de {PROLOGUE_SCENES.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIdx}
          className="w-full max-w-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.35 }}
        >
          {/* Narrative */}
          <div className="bg-slate-900/60 rounded-2xl p-6 mb-6 border border-slate-800">
            <p className="text-slate-300 italic leading-relaxed">
              "{scene.narrative}"
            </p>
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-white mb-5 text-center">
            {scene.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {scene.options.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all cursor-pointer
                  ${
                    currentSelection === opt.value
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                  }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="font-semibold">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 w-full max-w-lg">
        {sceneIdx > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium
              transition-colors border border-slate-700 cursor-pointer"
          >
            Voltar
          </button>
        )}
        <div className="flex-1" />
        <motion.button
          onClick={handleNext}
          disabled={!currentSelection}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
            disabled:cursor-not-allowed rounded-xl font-bold transition-colors cursor-pointer"
          whileHover={currentSelection ? { scale: 1.03 } : {}}
          whileTap={currentSelection ? { scale: 0.97 } : {}}
        >
          {isLast ? 'Iniciar Auditoria VRIO →' : 'Seguinte →'}
        </motion.button>
      </div>
    </div>
  );
}
