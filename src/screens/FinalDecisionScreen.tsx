import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store';
import type { PestelCategory, PorterForce } from '../types';
import {
  PESTEL_LABELS,
  PORTER_LABELS,
  ACTION_POOL,
} from '../data';
import { autoGenerateMemo, getTopPorterForce, vrioLabel } from '../utils';

export default function FinalDecisionScreen() {
  const { state, dispatch } = useGame();

  // Auto-generate memo fields
  const autoMemo = useMemo(() => autoGenerateMemo(state), [state]);

  const [dominantPestel, setDominantPestel] = useState<[PestelCategory, PestelCategory]>(autoMemo.dominantPestel);
  const [criticalForce, setCriticalForce] = useState<PorterForce>(autoMemo.criticalForce);
  const [keyResources, setKeyResources] = useState<[string, string]>(autoMemo.keyResources);
  const [nextActionId, setNextActionId] = useState<string>(autoMemo.nextActionId);
  const [rationale, setRationale] = useState('');

  // Track which fields user has edited
  const [editedFields, setEditedFields] = useState({
    dominantPestel: false,
    criticalForce: false,
    keyResources: false,
    nextAction: false,
  });

  // Toggle edit panels
  const [editingPestel, setEditingPestel] = useState(false);
  const [editingForce, setEditingForce] = useState(false);
  const [editingResources, setEditingResources] = useState(false);
  const [editingAction, setEditingAction] = useState(false);

  const selectedResources = state.vrioResources.filter((r) => r.selected);
  const topForce = useMemo(() => getTopPorterForce(state.forces), [state.forces]);

  // PESTEL category counts from history
  const pestelCounts = useMemo(() => {
    const counts: Partial<Record<PestelCategory, number>> = {};
    for (const r of state.roundHistory) {
      const cat = r.pestelCard.category;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [state.roundHistory]);

  // Detect ties for critical force
  const tiedForces = useMemo(() => {
    const entries = Object.entries(state.forces) as [PorterForce, number][];
    return entries.filter(([, v]) => v === topForce.value).map(([f]) => f);
  }, [state.forces, topForce.value]);

  // If there's a tie, auto-open the force editor
  useEffect(() => {
    if (tiedForces.length > 1) setEditingForce(true);
  }, [tiedForces.length]);

  const nextAction = ACTION_POOL.find((a) => a.id === nextActionId);

  const togglePestelEdit = (c: PestelCategory) => {
    setDominantPestel((prev) => {
      if (prev.includes(c)) {
        // Can't have less than 2; swap out the one being toggled
        const other = prev.find((x) => x !== c) ?? prev[0];
        const allCats: PestelCategory[] = ['P', 'E', 'S', 'T', 'Ec', 'L'];
        const replacement = allCats.find((x) => x !== other && x !== c) ?? c;
        return [other, replacement];
      }
      // Replace the second slot
      return [prev[0], c];
    });
    setEditedFields((f) => ({ ...f, dominantPestel: true }));
  };

  const toggleResourceEdit = (id: string) => {
    setKeyResources((prev) => {
      if (prev.includes(id)) {
        const other = prev.find((x) => x !== id) ?? prev[0];
        const replacement = selectedResources.find((r) => r.id !== other && r.id !== id)?.id ?? id;
        return [other, replacement];
      }
      return [prev[0], id];
    });
    setEditedFields((f) => ({ ...f, keyResources: true }));
  };

  const handleSubmit = () => {
    dispatch({
      type: 'SET_FINAL',
      decision: {
        dominantPestel,
        criticalForce,
        keyResources,
        nextActionId,
        rationale,
        edited: editedFields,
      },
    });
    dispatch({ type: 'GO_REPORT' });
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Memorando do Conselho
          </h1>
          <p className="text-slate-400">
            Resumo gerado automaticamente com base nas {state.totalRounds} rondas. Reveja e edite conforme necessário.
          </p>
        </div>

        {/* 1. Dominant PESTEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">
              1. Categorias PESTEL Dominantes
            </h3>
            <button
              onClick={() => setEditingPestel(!editingPestel)}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
            >
              {editingPestel ? 'Fechar' : 'Editar'}
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            {dominantPestel.map((c) => (
              <span key={c} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-bold">
                {PESTEL_LABELS[c]}
                {pestelCounts[c] ? ` (${pestelCounts[c]}×)` : ''}
              </span>
            ))}
            {editedFields.dominantPestel && (
              <span className="text-[10px] text-amber-400 self-center ml-1">editado</span>
            )}
          </div>

          {editingPestel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <p className="text-xs text-slate-500 mb-2">Selecione para substituir a segunda categoria.</p>
              <div className="flex flex-wrap gap-1.5">
                {(['P', 'E', 'S', 'T', 'Ec', 'L'] as PestelCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => togglePestelEdit(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${dominantPestel.includes(c)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {PESTEL_LABELS[c]}
                    {pestelCounts[c] ? ` (${pestelCounts[c]})` : ''}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 2. Critical Force */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">
              2. Força de Porter Mais Crítica
            </h3>
            {tiedForces.length <= 1 && (
              <button
                onClick={() => setEditingForce(!editingForce)}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
              >
                {editingForce ? 'Fechar' : 'Editar'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-bold">
              {PORTER_LABELS[criticalForce]}
            </span>
            <span className="text-sm text-slate-400">
              Nível {state.forces[criticalForce]}/5
            </span>
            {editedFields.criticalForce && (
              <span className="text-[10px] text-amber-400">editado</span>
            )}
          </div>

          {tiedForces.length > 1 && !editingForce && (
            <p className="text-xs text-amber-400 mb-2">
              Empate detetado ao nível {topForce.value}/5 — selecione a força mais crítica.
            </p>
          )}

          {editingForce && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              {tiedForces.length > 1 && (
                <p className="text-xs text-amber-400 mb-2">
                  Empate detetado ao nível {topForce.value}/5 — qual é mais crítica?
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(tiedForces.length > 1
                  ? tiedForces
                  : (['newEntrants', 'suppliers', 'buyers', 'substitutes', 'rivalry'] as PorterForce[])
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setCriticalForce(f);
                      setEditedFields((fl) => ({ ...fl, criticalForce: true }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${criticalForce === f
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {PORTER_LABELS[f]} ({state.forces[f]}/5)
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 3. Key Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">
              3. Recursos VRIO-Chave
            </h3>
            <button
              onClick={() => setEditingResources(!editingResources)}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
            >
              {editingResources ? 'Fechar' : 'Editar'}
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            {keyResources.map((id) => {
              const res = selectedResources.find((r) => r.id === id);
              return res ? (
                <span key={id} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-bold">
                  {res.name}
                  <span className="ml-1 text-[10px] opacity-70">({vrioLabel(res)})</span>
                </span>
              ) : null;
            })}
            {editedFields.keyResources && (
              <span className="text-[10px] text-amber-400 self-center ml-1">editado</span>
            )}
          </div>

          {editingResources && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <p className="text-xs text-slate-500 mb-2">Selecione para substituir.</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedResources.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => toggleResourceEdit(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                      ${keyResources.includes(r.id)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 4. Recommended Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">
              4. Ação Recomendada para o Próximo Trimestre
            </h3>
            <button
              onClick={() => setEditingAction(!editingAction)}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
            >
              {editingAction ? 'Fechar' : 'Editar'}
            </button>
          </div>

          {nextAction && (
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-bold">
                {nextAction.name}
              </span>
              <span className="text-xs text-slate-400">{nextAction.intent === 'exploit' ? 'Exploração' : 'Mitigação'}</span>
              {editedFields.nextAction && (
                <span className="text-[10px] text-amber-400">editado</span>
              )}
            </div>
          )}

          {editingAction && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {ACTION_POOL.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setNextActionId(a.id);
                      setEditedFields((f) => ({ ...f, nextAction: true }));
                    }}
                    className={`p-3 rounded-lg border-2 text-left cursor-pointer transition-all
                      ${nextActionId === a.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <div className="mb-1">
                      <span className="font-bold text-white text-sm">{a.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{a.shortDesc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 5. Optional Rationale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
        >
          <h3 className="font-bold text-white mb-2">
            5. Nota ao Conselho <span className="text-xs font-normal text-slate-500">(opcional, máx. 140 caracteres)</span>
          </h3>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value.slice(0, 140))}
            placeholder="Breve nota justificativa..."
            maxLength={140}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white
              placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <p className="text-xs text-slate-500 text-right mt-1">{rationale.length}/140</p>
        </motion.div>

        {/* Submit */}
        <div className="text-center pt-2">
          <motion.button
            onClick={handleSubmit}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg cursor-pointer transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Confirmar Memorando
          </motion.button>
        </div>
      </div>
    </div>
  );
}
