import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TUTORIAL_STEPS } from '../content/tutorial';
import StepVisual from './TutorialVisuals';

const TUTORIAL_KEY = 'strategy-tutorial-done';

interface TutorialProps {
  open: boolean;
  onComplete: () => void;
}

const variants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
};

export default function Tutorial({ open, onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setStep(0);
    setDirection(1);
    onComplete();
  };

  const goNext = () => {
    if (step === TUTORIAL_STEPS.length - 1) {
      handleComplete();
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Panel */}
          <div className="relative w-full max-w-lg mx-4">
            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mb-4">
              {TUTORIAL_STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-500/40' : 'bg-slate-700'
                  }`}
                  animate={i === step ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={i === step ? { duration: 0.4 } : {}}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
              >
                {/* Visual */}
                <div className="mb-4 flex justify-center">
                  <StepVisual visual={current.visual} />
                </div>

                {/* Text */}
                <h2 className="text-lg font-bold text-white mb-2">{current.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{current.body}</p>

                {/* Step counter */}
                <p className="text-[10px] text-slate-600 mt-3 text-right">
                  {step + 1} / {TUTORIAL_STEPS.length}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleComplete}
                className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
              >
                Saltar
              </button>

              <div className="flex gap-2">
                {step > 0 && (
                  <motion.button
                    onClick={goBack}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium
                      border border-slate-700 cursor-pointer transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Voltar
                  </motion.button>
                )}
                <motion.button
                  onClick={goNext}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold
                    cursor-pointer transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLast ? 'Começar a Jogar' : 'Seguinte'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
