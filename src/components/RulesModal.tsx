import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RULES_SECTIONS } from '../content/tutorial';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  onReplayTutorial: () => void;
}

function AccordionItem({ title, body }: { title: string; body: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer
          hover:bg-slate-800/30 transition-colors px-1 rounded"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-slate-500">{expanded ? '▼' : '▶'}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-400 pb-3 px-1 leading-relaxed">{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RulesModal({ open, onClose, onReplayTutorial }: RulesModalProps) {
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Regras do Jogo</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800
                  hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {RULES_SECTIONS.map((section) => (
                <AccordionItem key={section.id} title={section.title} body={section.body} />
              ))}
            </div>

            {/* Replay tutorial button */}
            <motion.button
              onClick={onReplayTutorial}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium
                border border-slate-700 cursor-pointer transition-colors mt-4 text-slate-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Repetir Tutorial
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
