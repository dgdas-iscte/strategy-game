import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store';
import type {
  Action,
  MetricKey,
  PestelCategory,
  PorterForce,
  Interpretation,
  CoherenceBreakdown,
} from '../types';
import {
  intensityLabel,
  intensityFromRoll,
  isMetricAligned,
  selectActions,
  computeActionEffects,
  computeCoherence,
  checkPestelAlignment,
  checkPorterAlignment,
  checkVrioAlignment,
  getTopPorterForce,
  resolveTraps,
  resolveRound,
  computeRoundTokens,
  vrioLabel,
  vrioLabelColor,
} from '../utils';
import {
  PESTEL_LABELS,
  PESTEL_COLORS,
  PORTER_LABELS,
  METRIC_LABELS,
  IMPACT_TYPE_LABELS,
} from '../data';
import ProgressBoard from '../components/ProgressBoard';
import SidePanel from '../components/SidePanel';
import FlipCard from '../components/FlipCard';
import DiceRoll from '../components/DiceRoll';
import Tooltip from '../components/Tooltip';
import ConfirmDialog from '../components/ConfirmDialog';

/* ═══ Tooltip data ═══ */

const PESTEL_TIPS: Record<PestelCategory, string> = {
  P: 'Político — política governamental, regulação, estabilidade',
  E: 'Económico — crescimento, inflação, taxas de câmbio',
  S: 'Social — demografia, cultura, atitudes do consumidor',
  T: 'Tecnológico — inovação, automação, I&D',
  Ec: 'Ecológico — sustentabilidade, clima, recursos',
  L: 'Legal — conformidade, propriedade intelectual, legislação laboral',
};

const PORTER_TIPS: Record<PorterForce, string> = {
  newEntrants: 'Ameaça de novos concorrentes a entrar no mercado',
  suppliers: 'Poder negocial dos seus fornecedores',
  buyers: 'Poder negocial dos seus clientes',
  substitutes: 'Ameaça de produtos ou serviços alternativos',
  rivalry: 'Intensidade da concorrência entre empresas existentes',
};

/* ═══ Phase transition wrapper ═══ */

function PhaseWrap({ phaseKey, children }: { phaseKey: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phaseKey}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY PANEL  (read-only review of prior rounds)
   ═══════════════════════════════════════════════════════════ */

function HistoryPanel() {
  const { state } = useGame();
  const [open, setOpen] = useState(false);
  const history = state.roundHistory;

  if (history.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white
          transition-colors cursor-pointer"
      >
        <span className="text-xs">{open ? '▼' : '▶'}</span>
        Histórico ({history.length} ronda{history.length > 1 ? 's' : ''})
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {history.map((r) => (
                <div
                  key={r.round}
                  className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 text-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">Ronda {r.round}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-slate-400">
                        Coerência: {r.coherenceScore}/3
                        {r.coherenceBreakdown && (
                          <span className="ml-1">
                            ({r.coherenceBreakdown.pestel ? '✓' : '✗'}P {r.coherenceBreakdown.porter ? '✓' : '✗'}F {r.coherenceBreakdown.vrio ? '✓' : '✗'}V)
                          </span>
                        )}
                      </span>
                      <span className={r.movement > 0 ? 'text-emerald-400' : r.movement < 0 ? 'text-red-400' : 'text-slate-400'}>
                        {r.movement > 0 ? '+' : ''}{r.movement} mov
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-slate-500">PESTEL: </span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mr-1 ${PESTEL_COLORS[r.pestelCard.category]}`}>
                        {PESTEL_LABELS[r.pestelCard.category]}
                      </span>
                      <span className="text-slate-300">{r.pestelCard.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Leitura: </span>
                      <span className={r.interpretation === 'opportunity' ? 'text-emerald-400' : 'text-red-400'}>
                        {r.interpretation === 'opportunity' ? 'Oportunidade' : 'Ameaça'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Porter: </span>
                      <span className="text-slate-300">{r.porterCard.title}</span>
                      <span className="text-slate-500 ml-1">({PORTER_LABELS[r.porterCard.force]})</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Ação: </span>
                      <span className="text-slate-300">{r.selectedAction.name}</span>
                    </div>
                  </div>

                  {r.trapsTriggered.length > 0 && (
                    <div className="mt-1 text-[10px] text-red-400">
                      Armadilhas: {r.trapsTriggered.join(', ')}
                      {r.trapsMitigated.length > 0 && (
                        <span className="text-cyan-400 ml-1">(Mitigadas: {r.trapsMitigated.join(', ')})</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 1: PESTEL DRAW  (pestel-draw)
   - Flip card → roll intensity die → auto-advance to interpret
   Card is drawn from state.pestelDeck[0] (pre-shuffled).
   ═══════════════════════════════════════════════════════════ */

function PestelDrawPhase() {
  const { state, dispatch } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [showDice, setShowDice] = useState(false);

  const card = state.pestelDeck[0] ?? null;

  const handleFlip = () => {
    setFlipped(true);
    setShowDice(true);
  };

  const handleDice = (value: number) => {
    setTimeout(() => {
      dispatch({ type: 'DRAW_PESTEL', intensity: value });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold">Tirar Carta PESTEL</h2>
      <p className="text-xs text-slate-500">
        {state.pestelDeck.length} carta{state.pestelDeck.length !== 1 ? 's' : ''} restante{state.pestelDeck.length !== 1 ? 's' : ''}
      </p>
      <FlipCard backLabel="PESTEL" backColor="from-red-500 to-amber-500" onFlip={handleFlip} flipped={flipped}>
        {card && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <Tooltip text={PESTEL_TIPS[card.category]}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${PESTEL_COLORS[card.category]}`}>
                {PESTEL_LABELS[card.category]}
              </span>
            </Tooltip>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-400">{card.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {card.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        )}
      </FlipCard>
      {showDice && flipped && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DiceRoll onResult={handleDice} label="Lançar Intensidade PESTEL" />
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 2: PESTEL INTERPRET  (pestel-interpret)
   - Opportunity / Threat  +  affected metric
   ═══════════════════════════════════════════════════════════ */

function PestelInterpretPhase() {
  const { state, dispatch } = useGame();
  const card = state.current.currentPestelCard!;
  const intensity = state.current.currentPestelIntensity;
  const [interp, setInterp] = useState<Interpretation | null>(null);
  const [metric, setMetric] = useState<MetricKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // After confirm, show feedback briefly then dispatch
  useEffect(() => {
    if (confirmed && interp && metric) {
      const timer = setTimeout(() => {
        dispatch({ type: 'INTERPRET_PESTEL', interpretation: interp, metric });
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [confirmed, interp, metric, dispatch]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Tooltip text={PESTEL_TIPS[card.category]}>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${PESTEL_COLORS[card.category]}`}>
              {PESTEL_LABELS[card.category]}
            </span>
          </Tooltip>
          <span className="text-xs text-slate-400">
            Intensidade: {intensityLabel(intensity)} ({intensityFromRoll(intensity)})
          </span>
        </div>
        <h3 className="font-bold text-white">{card.title}</h3>
        <p className="text-sm text-slate-400">{card.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Como interpreta este evento?</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['opportunity', 'threat'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterp(i)}
                className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all
                  ${interp === i
                    ? i === 'opportunity' ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${i === 'opportunity' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {i === 'opportunity' ? 'Oportunidade' : 'Ameaça'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {i === 'opportunity'
                    ? 'Aproveitar este evento para vantagem competitiva.'
                    : 'Mitigar o risco negativo deste evento.'}
                </p>
              </button>
          ))}
        </div>
      </div>

      {interp && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            Qual métrica é mais afetada?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'share', 'brand', 'ops'] as MetricKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`px-4 py-3 rounded-xl border-2 font-medium text-sm cursor-pointer transition-all
                  ${metric === k ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}
              >
                {METRIC_LABELS[k]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {interp && metric && !confirmed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center">
            <button
              onClick={() => setConfirmed(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Confirmar Interpretação
            </button>
          </div>
        </motion.div>
      )}

      {confirmed && metric && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl p-4 text-sm text-center ${
            isMetricAligned(card, metric)
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          }`}>
          {isMetricAligned(card, metric)
            ? `✓ Coerente — ${METRIC_LABELS[metric]} alinha com ${IMPACT_TYPE_LABELS[card.expectedImpactType]}.`
            : `⚠ Pouco alinhado — ${IMPACT_TYPE_LABELS[card.expectedImpactType]} sugere outra métrica. Pode afetar a coerência PESTEL.`
          }
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 3: PORTER DRAW  (porter-draw)
   - Flip card → roll → auto-advance (forces shift immediately)
   Card is drawn from state.porterDeck[0] (pre-shuffled).
   ═══════════════════════════════════════════════════════════ */

function PorterDrawPhase() {
  const { state, dispatch } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [showDice, setShowDice] = useState(false);

  const card = state.porterDeck[0] ?? null;

  const handleFlip = () => {
    setFlipped(true);
    setShowDice(true);
  };

  const handleDice = (value: number) => {
    setTimeout(() => {
      dispatch({ type: 'DRAW_PORTER', intensity: value });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold">Tirar Carta das Cinco Forças</h2>
      <p className="text-xs text-slate-500">
        {state.porterDeck.length} carta{state.porterDeck.length !== 1 ? 's' : ''} restante{state.porterDeck.length !== 1 ? 's' : ''}
      </p>
      <FlipCard backLabel="Cinco Forças" backColor="from-blue-500 to-cyan-500" onFlip={handleFlip} flipped={flipped}>
        {card && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Tooltip text={PORTER_TIPS[card.force]}>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-500">
                  {PORTER_LABELS[card.force]}
                </span>
              </Tooltip>
              <span className={`text-lg ${card.direction === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                {card.direction === 'up' ? '▲ Aumenta' : '▼ Diminui'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-400">{card.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {card.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        )}
      </FlipCard>
      {showDice && flipped && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DiceRoll onResult={handleDice} label="Lançar Intensidade Porter" />
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 4: VRIO ACTIVATE  (vrio-activate)
   ═══════════════════════════════════════════════════════════ */

function VRIOActivatePhase() {
  const { state, dispatch } = useGame();
  const selected = state.vrioResources.filter((r) => r.selected);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center">Ativar um Recurso VRIO</h2>
      <p className="text-sm text-slate-400 text-center">Escolhe o recurso que melhor responde ao contexto desta ronda (PESTEL + pressão competitiva). Um recurso só dá bónus/defesa quando existe fit com o evento e com a ação.</p>
      <div className="grid grid-cols-2 gap-3">
        {selected.map((r) => {
          const preview: string[] = [];
          if (r.V && r.R) preview.push('+1 Alavancagem');
          if (r.I && r.O) preview.push('+1 Resiliência');
          return (
            <motion.button
              key={r.id}
              onClick={() => dispatch({ type: 'ACTIVATE_VRIO', id: r.id })}
              className="p-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 text-left
                hover:border-indigo-500 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="font-bold text-white text-sm mb-1">{r.name}</h3>
              <p className="text-[10px] text-slate-500 mb-2">{r.shortDesc}</p>
              <div className="flex gap-1 mb-2">
                {(['V', 'R', 'I', 'O'] as const).map((f) => (
                  <Tooltip key={f} text={
                    f === 'V' ? 'Valioso — ajuda a explorar oportunidades ou neutralizar ameaças' :
                    f === 'R' ? 'Raro — poucos concorrentes o têm' :
                    f === 'I' ? 'Inimitável — difícil ou caro de copiar' :
                    'Organizado — estrutura e processos para o explorar'
                  }>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${r[f] ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                      {f}
                    </span>
                  </Tooltip>
                ))}
              </div>
              <p className={`text-xs font-semibold ${vrioLabelColor(r)}`}>{vrioLabel(r)}</p>
              {preview.length > 0 && <p className="text-xs text-amber-400 mt-1">{preview.join(', ')}</p>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 5: ACTION CHOOSE  (action-choose)
   - 3 contextual actions + 3 justification selectors
   - Drawn cards are NOT re-displayed here (coherence test)
   ═══════════════════════════════════════════════════════════ */

function ActionChoosePhase() {
  const { state, dispatch } = useGame();
  const [actions, setActions] = useState<Action[]>([]);
  const [sel, setSel] = useState<Action | null>(null);
  const [jP, setJP] = useState<PestelCategory | null>(null);
  const [jF, setJF] = useState<PorterForce | null>(null);
  const [jV, setJV] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(true);
  const [actionConfirmed, setActionConfirmed] = useState(false);

  const pestelCard = state.current.currentPestelCard!;
  const porterCard = state.current.currentPorterCard!;
  const activatedResource = state.vrioResources.find((r) => r.id === state.current.activatedVRIO);
  const selectedResources = state.vrioResources.filter((r) => r.selected);
  const topForce = getTopPorterForce(state.forces);

  useEffect(() => {
    const picked = selectActions(
      state.currentRound,
      pestelCard.category,
      porterCard.force,
      state.forces,
      state.current.activatedVRIO!,
    );
    setActions(picked);
    dispatch({ type: 'SET_ACTIONS', actions: picked });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canExecute = sel && jP && jF && jV;

  // After confirm, show feedback briefly then dispatch
  useEffect(() => {
    if (actionConfirmed && sel && jP && jF && jV) {
      const timer = setTimeout(() => {
        dispatch({
          type: 'SELECT_ACTION',
          action: sel,
          justifications: { pestel: jP, porter: jF, vrio: jV },
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [actionConfirmed, sel, jP, jF, jV, dispatch]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-center">Escolha a Sua Ação</h2>
      <p className="text-xs text-slate-500 text-center -mt-3">
        Com base no contexto desta ronda, selecione uma ação e justifique a sua escolha ligando-a às cartas tiradas.
      </p>

      {/* Round Context Recap — collapsed by default to test memory */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowContext(!showContext)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer
            hover:bg-slate-800/40 transition-colors"
        >
          <span className="text-xs font-semibold text-slate-400">
            {showContext ? '▼' : '▶'} Contexto da Ronda
          </span>
          <span className="text-[10px] text-slate-600">
            {showContext ? 'fechar' : 'rever cartas tiradas'}
          </span>
        </button>

        <AnimatePresence>
          {showContext && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PESTEL card recap */}
                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${PESTEL_COLORS[pestelCard.category]}`}>
                      {PESTEL_LABELS[pestelCard.category]}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {intensityLabel(state.current.currentPestelIntensity)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white mb-0.5">{pestelCard.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{pestelCard.description}</p>
                  <div className="flex gap-2 mt-1.5 text-[10px]">
                    <span className={state.current.pestelInterpretation === 'opportunity' ? 'text-emerald-400' : 'text-red-400'}>
                      {state.current.pestelInterpretation === 'opportunity' ? 'Oportunidade' : 'Ameaça'}
                    </span>
                    <span className="text-slate-500">→ {METRIC_LABELS[state.current.affectedMetric!]}</span>
                  </div>
                </div>

                {/* Porter card recap */}
                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-blue-500">
                      {PORTER_LABELS[porterCard.force]}
                    </span>
                    <span className={`text-[10px] ${porterCard.direction === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {porterCard.direction === 'up' ? '▲' : '▼'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white mb-0.5">{porterCard.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{porterCard.description}</p>
                  <div className="mt-1.5 text-[10px] text-slate-500">
                    Nível: {state.forces[porterCard.force]}/5
                  </div>
                </div>

                {/* Activated VRIO recap */}
                {activatedResource && (
                  <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-indigo-500">
                        VRIO
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white mb-0.5">{activatedResource.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{activatedResource.shortDesc}</p>
                    <div className="flex gap-1 mt-1.5">
                      {(['V', 'R', 'I', 'O'] as const).map((f) => (
                        <span key={f} className={`text-[10px] px-1 py-0.5 rounded font-bold ${activatedResource[f] ? 'bg-indigo-500/40 text-indigo-300' : 'bg-slate-700 text-slate-600'}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 pb-2 text-[10px] text-slate-500">
                Maior pressão agora: <span className="text-white font-semibold">{PORTER_LABELS[topForce.force]}</span> ({topForce.value}/5)
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((a) => {
          const eff = computeActionEffects(a, pestelCard.category, state.forces, state.current.activatedVRIO!);

          return (
            <motion.button
              key={a.id}
              onClick={() => { if (!actionConfirmed) setSel(a); }}
              className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all
                ${sel?.id === a.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}
                ${actionConfirmed ? 'pointer-events-none' : ''}`}
              whileHover={!actionConfirmed ? { scale: 1.02 } : {}}
            >
              <div className="mb-1">
                <h3 className="font-bold text-white text-sm">{a.name}</h3>
              </div>

              <p className="text-xs text-slate-400 mb-3">{a.shortDesc}</p>

              <div className="grid grid-cols-2 gap-1 text-xs">
                {(['cash', 'share', 'brand', 'ops'] as MetricKey[]).map((k) => (
                  <span key={k} className={eff[k] > 0 ? 'text-emerald-400' : eff[k] < 0 ? 'text-red-400' : 'text-slate-500'}>
                    {METRIC_LABELS[k]}: {eff[k] > 0 ? '+' : ''}{eff[k]}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {sel && !actionConfirmed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4 bg-slate-900/60 rounded-xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300">Justifique a Sua Escolha</h3>

          {/* PESTEL justification */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Categoria PESTEL Visada</label>
            <div className="flex flex-wrap gap-1.5">
              {(['P', 'E', 'S', 'T', 'Ec', 'L'] as PestelCategory[]).map((c) => (
                <Tooltip key={c} text={PESTEL_TIPS[c]}>
                  <button onClick={() => setJP(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${jP === c ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {PESTEL_LABELS[c]}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Porter justification */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Força de Porter Endereçada</label>
            <div className="flex flex-wrap gap-1.5">
              {(['newEntrants', 'suppliers', 'buyers', 'substitutes', 'rivalry'] as PorterForce[]).map((f) => (
                <Tooltip key={f} text={PORTER_TIPS[f]}>
                  <button onClick={() => setJF(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${jF === f ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {PORTER_LABELS[f]}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* VRIO justification */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Recurso VRIO Alavancado</label>
            <div className="flex flex-wrap gap-1.5">
              {selectedResources.map((r) => (
                <Tooltip key={r.id} text={r.shortDesc}>
                  <button onClick={() => setJV(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${jV === r.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {r.name}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <motion.button
              onClick={() => { if (canExecute) setActionConfirmed(true); }}
              disabled={!canExecute}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                disabled:cursor-not-allowed rounded-xl font-bold cursor-pointer transition-colors"
              whileHover={canExecute ? { scale: 1.03 } : {}}
              whileTap={canExecute ? { scale: 0.97 } : {}}
            >
              Executar Ação
            </motion.button>
          </div>
        </motion.div>
      )}

      {actionConfirmed && sel && jP && jF && jV && (() => {
        const cPestel = checkPestelAlignment(
          pestelCard,
          state.current.affectedMetric!,
          state.current.pestelInterpretation!,
          sel,
        );
        const cPorter = checkPorterAlignment(jF, porterCard.force, state.forces);
        const cVrio = checkVrioAlignment(jV, state.current.activatedVRIO!, sel.id);
        const cScore = (cPestel ? 1 : 0) + (cPorter ? 1 : 0) + (cVrio ? 1 : 0);

        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 text-sm text-center space-y-2 ${
              cScore >= 3 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : cScore >= 2 ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                : cScore >= 1 ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
            <div className="text-lg font-bold">Coerência: {cScore}/3</div>
            <div className="flex justify-center gap-4 text-xs">
              <span>PESTEL {cPestel ? '✓' : '✗'}</span>
              <span>Porter {cPorter ? '✓' : '✗'}</span>
              <span>VRIO {cVrio ? '✓' : '✗'}</span>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-PHASE 6: RESOLVE  (resolve)

   Cinematic 5-step reveal. Token spending is interactive.
   resolveRound() is called live so metrics/movement update
   as the player toggles leverage or resilience.
   ═══════════════════════════════════════════════════════════ */

function ResolvePhase() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [committed, setCommitted] = useState(false);

  const c = state.current;
  const isReady = !!(c.currentPestelCard && c.currentPorterCard && c.activatedVRIO);

  const pestelCard = c.currentPestelCard;
  const porterCard = c.currentPorterCard;
  const activated = state.vrioResources.find((r) => r.id === c.activatedVRIO);

  // Fixed coherence (doesn't change with token spending)
  const coherenceResult = useMemo(
    () => {
      if (!isReady) return { score: 0, breakdown: { pestel: false, porter: false, vrio: false } as CoherenceBreakdown };
      return computeCoherence(c.justifications, {
        pestelCard: pestelCard!,
        porterCard: porterCard!,
        activatedVRIO: c.activatedVRIO!,
        affectedMetric: c.affectedMetric!,
        interpretation: c.pestelInterpretation!,
        action: c.selectedAction!,
        forces: state.forces,
      });
    },
    [isReady, c.justifications, pestelCard, porterCard, c.activatedVRIO, c.affectedMetric, c.pestelInterpretation, c.selectedAction, state.forces],
  );
  const coherence = coherenceResult.score;
  const coherenceBreakdown = coherenceResult.breakdown;

  // Fixed traps (don't change with token spending, only mitigation changes)
  const traps = useMemo(
    () => (isReady ? resolveTraps(state, coherenceBreakdown) : []),
    [isReady, state.forces, coherenceBreakdown, c.affectedMetric, c.selectedAction, activated?.O],
  );

  // LIVE payload — recomputes when player toggles leverage or mitigates traps
  const payload = useMemo(
    () => (isReady ? resolveRound(state) : null),
    [isReady, state],
  );

  const tokensGained = useMemo(
    () => (activated ? computeRoundTokens(activated) : { leverage: 0, resilience: 0 }),
    [activated],
  );

  // Auto-advance steps
  useEffect(() => {
    if (!isReady) return;
    if (step < 5) {
      const timer = setTimeout(() => setStep((s) => s + 1), 1500);
      return () => clearTimeout(timer);
    }
  }, [isReady, step]);

  const handleCommit = useCallback(() => {
    if (committed || !isReady) return;
    setCommitted(true);
    const finalPayload = resolveRound(state);
    dispatch({ type: 'COMMIT_RESOLVE', payload: finalPayload });
    dispatch({ type: 'NEXT_ROUND' });
  }, [committed, isReady, state, dispatch]);

  // Guard: during AnimatePresence exit, current may already be reset
  if (!isReady || !payload) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-center">Resolução</h2>

      {/* Step 0: Coherence */}
      {step >= 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-300 mb-2">Pontuação de Coerência</h3>
          <div className="flex gap-3 justify-center">
            {([
              { key: 'pestel', label: 'PESTEL', ok: coherenceBreakdown.pestel },
              { key: 'porter', label: 'Porter', ok: coherenceBreakdown.porter },
              { key: 'vrio', label: 'VRIO', ok: coherenceBreakdown.vrio },
            ] as const).map((item, i) => (
              <motion.div key={item.key}
                className={`flex flex-col items-center gap-1`}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                  ${item.ok ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-500'}`}>
                  {item.ok ? '✓' : '✗'}
                </div>
                <span className={`text-[10px] font-bold ${item.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400 mt-2">{coherence} / 3</p>
        </motion.div>
      )}

      {/* Step 1: Traps + Resilience spending */}
      {step >= 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {traps.length > 0 ? (
            <motion.div
              className="bg-red-500/10 rounded-xl p-4 border border-red-500/30"
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.5 }}>
              <h3 className="text-sm font-bold text-red-400 mb-3">Armadilhas Ativadas!</h3>
              {traps.map((trap) => {
                const mitigated = c.mitigatedTraps.includes(trap.name);
                const canMitigate =
                  trap.mitigatable &&
                  !mitigated &&
                  state.resilienceTokens > 0 &&
                  activated!.O;
                return (
                  <div key={trap.name} className="flex items-center justify-between mb-2 last:mb-0">
                    <div>
                      <span className="text-sm text-red-300 font-medium">{trap.name}</span>
                      <span className="text-xs text-red-400/70 ml-2">(-1 recuo)</span>
                    </div>
                    {canMitigate && (
                      <button
                        onClick={() => dispatch({ type: 'USE_RESILIENCE', trapName: trap.name })}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                        Gastar R <span className="opacity-70">({state.resilienceTokens})</span>
                      </button>
                    )}
                    {mitigated && <span className="text-xs text-cyan-400 font-bold">Mitigada ✓</span>}
                    {!trap.mitigatable && !mitigated && (
                      <span className="text-xs text-red-400/50">Não mitigável</span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-sm text-emerald-400 font-bold text-center">Tudo Limpo — Sem Armadilhas</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Tokens earned */}
      {step >= 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-300 mb-2">Tokens Ganhos Nesta Ronda</h3>
          <div className="flex gap-4 justify-center">
            {tokensGained.leverage > 0 && <span className="text-amber-400 font-bold">+{tokensGained.leverage} Alavancagem</span>}
            {tokensGained.resilience > 0 && <span className="text-cyan-400 font-bold">+{tokensGained.resilience} Resiliência</span>}
            {tokensGained.leverage === 0 && tokensGained.resilience === 0 && <span className="text-slate-500">Sem tokens nesta ronda</span>}
          </div>
        </motion.div>
      )}

      {/* Step 3: Leverage toggle + Metric deltas */}
      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-300">Alterações nas Métricas</h3>
            {state.leverageTokens > 0 && !c.usedLeverageThisRound && (
              <button
                onClick={() => dispatch({ type: 'USE_LEVERAGE' })}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                Gastar A <span className="opacity-70">({state.leverageTokens})</span>
              </button>
            )}
            {c.usedLeverageThisRound && (
              <span className="text-xs text-amber-400 font-bold">Alavancagem Ativa (+30%)</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'share', 'brand', 'ops'] as MetricKey[]).map((k) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-400">{METRIC_LABELS[k]}</span>
                <span className={payload.metricDeltas[k] > 0 ? 'text-emerald-400 font-mono' : payload.metricDeltas[k] < 0 ? 'text-red-400 font-mono' : 'text-slate-500 font-mono'}>
                  {payload.metricDeltas[k] > 0 ? '+' : ''}{payload.metricDeltas[k]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 4: Movement */}
      {step >= 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <h3 className="text-sm font-bold text-slate-300 mb-1">Movimento no Tabuleiro</h3>
          <span className={`text-3xl font-bold ${payload.movement > 0 ? 'text-emerald-400' : payload.movement < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {payload.movement > 0 ? '+' : ''}{payload.movement}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Posição: {state.boardPosition} → {payload.newPosition}
          </p>
        </motion.div>
      )}

      {/* Step 5: Continue */}
      {step >= 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
          <motion.button
            onClick={handleCommit}
            disabled={committed}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
              rounded-xl font-bold cursor-pointer transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            {state.currentRound >= state.totalRounds ? 'Avançar para Sala de Decisão Final' : `Continuar para Ronda ${state.currentRound + 1}`}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROUND SCREEN
   ═══════════════════════════════════════════════════════════ */

export default function RoundScreen() {
  const { state, dispatch } = useGame();
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  const renderPhase = () => {
    switch (state.roundPhase) {
      case 'pestel-draw':     return <PestelDrawPhase />;
      case 'pestel-interpret': return <PestelInterpretPhase />;
      case 'porter-draw':     return <PorterDrawPhase />;
      case 'vrio-activate':   return <VRIOActivatePhase />;
      case 'action-choose':   return <ActionChoosePhase />;
      case 'resolve':         return <ResolvePhase />;
      default:                return null;
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">Ronda {state.currentRound} / {state.totalRounds}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-sm font-mono">
              <Tooltip text="Tokens de Alavancagem — amplificam efeitos positivos em +30%">
                <span className="text-amber-400">A: {state.leverageTokens}</span>
              </Tooltip>
              <Tooltip text="Tokens de Resiliência — cancelam a penalidade de recuo de uma armadilha">
                <span className="text-cyan-400">R: {state.resilienceTokens}</span>
              </Tooltip>
            </div>
            <button
              onClick={() => setShowHomeConfirm(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium
                text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              Menu
            </button>
          </div>
        </div>

        <ProgressBoard currentRound={state.currentRound} totalRounds={state.totalRounds} boardPosition={state.boardPosition} />

        {/* History panel (read-only review of prior cards + decisions) */}
        <HistoryPanel />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="hidden lg:block">
            <SidePanel metrics={state.metrics} forces={state.forces}
              leverageTokens={state.leverageTokens} resilienceTokens={state.resilienceTokens} />
          </div>
          <div className="min-h-[400px]">
            <PhaseWrap phaseKey={state.roundPhase}>{renderPhase()}</PhaseWrap>
          </div>
        </div>

        <div className="lg:hidden">
          <SidePanel metrics={state.metrics} forces={state.forces}
            leverageTokens={state.leverageTokens} resilienceTokens={state.resilienceTokens} />
        </div>
      </div>

      {/* Home confirmation dialog */}
      <ConfirmDialog
        open={showHomeConfirm}
        title="Voltar ao Menu?"
        message="O seu progresso é guardado automaticamente. Pode continuar de onde parou."
        confirmLabel="Ir para Menu"
        cancelLabel="Ficar"
        onConfirm={() => {
          setShowHomeConfirm(false);
          dispatch({ type: 'GO_HOME' });
        }}
        onCancel={() => setShowHomeConfirm(false)}
      />
    </div>
  );
}
