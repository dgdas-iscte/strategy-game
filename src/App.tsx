import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './store';
import HomeScreen from './screens/HomeScreen';
import PrologueScreen from './screens/PrologueScreen';
import VRIOAuditScreen from './screens/VRIOAuditScreen';
import RoundScreen from './screens/RoundScreen';
import FinalDecisionScreen from './screens/FinalDecisionScreen';
import ReportScreen from './screens/ReportScreen';
import Tutorial from './components/Tutorial';
import RulesModal from './components/RulesModal';

const TUTORIAL_KEY = 'strategy-tutorial-done';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

function screenFor(phase: string) {
  switch (phase) {
    case 'home':
      return <HomeScreen />;
    case 'prologue':
      return <PrologueScreen />;
    case 'vrio-audit':
      return <VRIOAuditScreen />;
    case 'round':
      return <RoundScreen />;
    case 'final-decision':
      return <FinalDecisionScreen />;
    case 'report':
      return <ReportScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  const { state } = useGame();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Auto-show tutorial on first launch
  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.phase}
          {...pageTransition}
          className="min-h-screen"
        >
          {screenFor(state.phase)}
        </motion.div>
      </AnimatePresence>

      {/* Help button — always visible, hidden during print */}
      {!showTutorial && (
        <motion.button
          onClick={() => setShowRules(true)}
          className="fixed top-4 right-4 z-40 w-10 h-10 bg-slate-800/80 hover:bg-slate-700
            border border-slate-700 rounded-full flex items-center justify-center
            text-slate-400 hover:text-white font-bold text-lg cursor-pointer
            transition-colors shadow-lg backdrop-blur print:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Regras do jogo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ?
        </motion.button>
      )}

      {/* Rules modal */}
      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        onReplayTutorial={() => {
          setShowRules(false);
          setTimeout(() => setShowTutorial(true), 200);
        }}
      />

      {/* Tutorial overlay */}
      <Tutorial
        open={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />
    </div>
  );
}
