import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store';
import { vrioLabel, vrioLabelColor } from '../utils';

const FLAG_LABELS: Record<string, string> = {
  V: 'Valioso',
  R: 'Raro',
  I: 'Inimitável',
  O: 'Organizado',
};
const FLAGS = ['V', 'R', 'I', 'O'] as const;

export default function VRIOAuditScreen() {
  const { state, dispatch } = useGame();
  const { vrioResources, vrioBaseline, vrioAdjustedIds, totalRounds } = state;
  const selectedCount = vrioResources.filter((r) => r.selected).length;
  const [adjustMode, setAdjustMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const allValid =
    selectedCount === 4 &&
    vrioResources
      .filter((r) => r.selected)
      .every((r) => r.V || r.R || r.I || r.O);

  const canAdjustMore = vrioAdjustedIds.length < 2;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Perfil VRIO da NexaCorp
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            O perfil VRIO da sua empresa está pré-definido com base nas características da NexaCorp.
            Pode <strong>confirmar o perfil</strong> diretamente ou <strong>ajustar até 2 recursos</strong> antes de iniciar.
          </p>
        </div>

        {/* Primary CTA — Confirm Baseline */}
        {!adjustMode && (
          <div className="text-center mb-8">
            <motion.button
              onClick={() => dispatch({ type: 'CONFIRM_VRIO_BASELINE' })}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg
                transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Confirmar Perfil e Iniciar ({totalRounds} Rondas)
            </motion.button>
            <div className="mt-3">
              <button
                onClick={() => setAdjustMode(true)}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer transition-colors"
              >
                Ajustar recursos antes de iniciar ({vrioAdjustedIds.length}/2 ajustes)
              </button>
            </div>
          </div>
        )}

        {/* Adjust mode header */}
        {adjustMode && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Modo de Ajuste</h2>
              <span className={`text-sm font-mono px-2 py-0.5 rounded-full ${
                vrioAdjustedIds.length >= 2
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {vrioAdjustedIds.length} / 2 ajustes
              </span>
            </div>
            <div className="flex gap-2">
              {vrioAdjustedIds.length > 0 && (
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET_VRIO_BASELINE' });
                    setEditingId(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg
                    bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Repor Tudo
                </button>
              )}
              <button
                onClick={() => {
                  setAdjustMode(false);
                  setEditingId(null);
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg
                  bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Fechar Ajustes
              </button>
            </div>
          </div>
        )}

        {/* VRIO Matrix Table */}
        <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-800 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {adjustMode && (
                    <th className="w-10 py-3 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Sel
                    </th>
                  )}
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Recurso
                  </th>
                  {FLAGS.map((f) => (
                    <th key={f} className="w-16 py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <span className="hidden sm:inline">{FLAG_LABELS[f]}</span>
                      <span className="sm:hidden">{f}</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  {adjustMode && (
                    <th className="w-20 py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {vrioResources.map((r) => {
                  const adjusted = vrioAdjustedIds.includes(r.id);
                  const isEditing = adjustMode && editingId === r.id;
                  const canEdit = adjustMode && (adjusted || canAdjustMore);
                  const baseRes = vrioBaseline.find((b) => b.id === r.id);

                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-slate-800/50 transition-colors
                        ${adjusted
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : isEditing
                          ? 'bg-indigo-500/5'
                          : r.selected
                          ? 'hover:bg-slate-800/40'
                          : 'opacity-50 hover:opacity-70'
                        }`}
                      onClick={() => {
                        if (adjustMode && canEdit) {
                          setEditingId(isEditing ? null : r.id);
                        }
                      }}
                      style={adjustMode && canEdit ? { cursor: 'pointer' } : undefined}
                    >
                      {/* Selection checkbox (adjust mode only) */}
                      {adjustMode && (
                        <td className="py-3 px-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canEdit || r.selected) {
                                dispatch({ type: 'TOGGLE_RESOURCE', id: r.id });
                              }
                            }}
                            disabled={!r.selected && (selectedCount >= 4 || (!canEdit && !adjusted))}
                            className="cursor-pointer disabled:cursor-not-allowed"
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                              ${r.selected
                                ? adjusted ? 'bg-amber-500 border-amber-400' : 'bg-indigo-500 border-indigo-400'
                                : 'border-slate-600'
                              }`}
                            >
                              {r.selected && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                          </button>
                        </td>
                      )}

                      {/* Resource name + description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {!adjustMode && (
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              r.selected ? 'bg-indigo-500' : 'bg-slate-700'
                            }`} />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white whitespace-nowrap">{r.name}</span>
                              {adjusted && (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  Ajustado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug hidden sm:block">{r.shortDesc}</p>
                          </div>
                        </div>
                      </td>

                      {/* V / R / I / O toggles */}
                      {FLAGS.map((flag) => {
                        const baseVal = baseRes ? baseRes[flag] : false;
                        const changed = adjusted && r[flag] !== baseVal;
                        const clickable = isEditing;
                        return (
                          <td key={flag} className="py-3 px-2 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (clickable) {
                                  dispatch({ type: 'TOGGLE_FLAG', id: r.id, flag });
                                }
                              }}
                              disabled={!clickable}
                              className={`text-lg leading-none select-none transition-all
                                ${clickable
                                  ? 'cursor-pointer hover:scale-125'
                                  : 'cursor-default'
                                }
                                ${r[flag]
                                  ? changed
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                  : clickable
                                  ? 'text-slate-600 hover:text-slate-400'
                                  : 'text-slate-700'
                                }`}
                            >
                              {r[flag] ? '\u25cf' : '\u25cb'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Evaluation */}
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold whitespace-nowrap ${vrioLabelColor(r)}`}>
                          {vrioLabel(r)}
                        </span>
                      </td>

                      {/* Revert button (adjust mode only) */}
                      {adjustMode && (
                        <td className="py-3 px-2 text-center">
                          {adjusted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch({ type: 'REVERT_VRIO_RESOURCE', id: r.id });
                                if (editingId === r.id) setEditingId(null);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors whitespace-nowrap"
                            >
                              Reverter
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selection counter */}
        <div className="text-center mb-4">
          <p className="text-sm text-slate-500">
            {selectedCount} / 4 recursos selecionados
          </p>
        </div>

        {/* Submit — in adjust mode */}
        {adjustMode && (
          <div className="text-center">
            <motion.button
              onClick={() => dispatch({ type: 'FINISH_AUDIT' })}
              disabled={!allValid}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-colors cursor-pointer"
              whileHover={allValid ? { scale: 1.03 } : {}}
              whileTap={allValid ? { scale: 0.97 } : {}}
            >
              Iniciar Simulação ({totalRounds} Rondas)
            </motion.button>
            {!allValid && selectedCount === 4 && (
              <p className="text-xs text-red-400 mt-2">
                Cada recurso selecionado deve ter pelo menos 1 flag ativa.
              </p>
            )}
            {selectedCount < 4 && (
              <p className="text-xs text-red-400 mt-2">
                Selecione exatamente 4 recursos para continuar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
