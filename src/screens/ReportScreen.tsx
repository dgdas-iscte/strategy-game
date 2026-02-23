import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store';
import type { MetricKey, PorterForce, PestelCategory } from '../types';
import {
  PESTEL_LABELS,
  PESTEL_COLORS,
  PORTER_LABELS,
  METRIC_LABELS,
  METRIC_COLORS,
  ACTION_POOL,
} from '../data';
import { vrioLabel, vrioLabelColor, finalRating, intensityLabel, getTopPorterForce, boardMaxPosition } from '../utils';

/* ═══ Reveal wrapper — timed reveal with Framer Motion ═══ */

function Reveal({
  delay,
  children,
  className = '',
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ═══ Executive Summary generator ═══ */

function generateSummary(state: ReturnType<typeof useGame>['state']) {
  const { roundHistory, finalDecision, boardPosition, metrics, forces, totalRounds } = state;
  if (!finalDecision) return '';

  const rating = finalRating(boardPosition, totalRounds);
  const avgCoherence = roundHistory.length > 0
    ? (roundHistory.reduce((s, r) => s + r.coherenceScore, 0) / roundHistory.length)
    : 0;
  const trapCount = roundHistory.filter((r) => r.trapsTriggered.length > 0).length;
  const nextAction = ACTION_POOL.find((a) => a.id === finalDecision.nextActionId);

  const lines: string[] = [];
  lines.push(
    `${state.companyName} obteve resultado ${rating.label.toLowerCase()} com posição ${boardPosition}/${boardMaxPosition(state.totalRounds)} no tabuleiro.`,
  );
  lines.push(
    `Métricas ao fecho: Fluxo de Caixa ${metrics.cash}, Quota de Mercado ${metrics.share}, Capital de Marca ${metrics.brand}, Operações ${metrics.ops}.`,
  );
  lines.push(
    `A coerência média foi ${avgCoherence.toFixed(1)}/3 com ${trapCount} ronda${trapCount !== 1 ? 's' : ''} a ativar armadilhas.`,
  );
  lines.push(
    `Os fatores PESTEL dominantes foram ${finalDecision.dominantPestel.map((c) => PESTEL_LABELS[c]).join(' e ')}, ` +
    `com ${PORTER_LABELS[finalDecision.criticalForce]} como a força competitiva mais crítica (${forces[finalDecision.criticalForce]}/5).`,
  );
  lines.push(
    `Recursos-chave identificados: ${finalDecision.keyResources
      .map((id) => state.vrioResources.find((r) => r.id === id)?.name ?? id)
      .join(' e ')}.`,
  );
  if (nextAction) {
    lines.push(
      `Ação recomendada para o próximo trimestre: ${nextAction.name}.`,
    );
  }
  if (finalDecision.rationale) {
    lines.push(`Nota: ${finalDecision.rationale}`);
  }
  return lines.join(' ');
}

/* ═══ REPORT SCREEN ═══ */

export default function ReportScreen() {
  const { state, dispatch } = useGame();
  const { roundHistory, metrics, forces, boardPosition, finalDecision, vrioResources, vrioBaseline, vrioAdjustedIds } = state;

  const rating = finalRating(boardPosition, state.totalRounds);
  const performanceScore = Math.round(
    (metrics.cash + metrics.share + metrics.brand + metrics.ops) / 4,
  );
  const avgCoherence =
    roundHistory.length > 0
      ? (roundHistory.reduce((s, r) => s + r.coherenceScore, 0) / roundHistory.length).toFixed(1)
      : '0.0';
  const trapRate =
    roundHistory.length > 0
      ? `${roundHistory.filter((r) => r.trapsTriggered.length > 0).length} / ${roundHistory.length}`
      : '0 / 0';

  const selectedResources = vrioResources.filter((r) => r.selected);
  const topForce = useMemo(() => getTopPorterForce(forces), [forces]);
  const summary = useMemo(() => generateSummary(state), [state]);

  const maxPos = boardMaxPosition(state.totalRounds);

  return (
    <div className="min-h-screen px-4 py-8 print-report">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Reveal delay={0}>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white mb-2 print:text-black">
              Relatório de Análise Estratégica
            </h1>
            <p className="text-sm text-slate-400 print:text-gray-600">
              {state.companyName} — Simulação Estratégica de {state.totalRounds} Rondas
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${rating.color} print:text-black`}>
                  {boardPosition} / {maxPos}
                </div>
                <div className="text-xs text-slate-400 print:text-gray-600">Posição no Tabuleiro</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${rating.color} print:text-black`}>
                  {rating.label}
                </div>
                <div className="text-xs text-slate-400 print:text-gray-600">Classificação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white print:text-black">
                  {performanceScore}
                </div>
                <div className="text-xs text-slate-400 print:text-gray-600">Desempenho</div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <span className="text-sm text-slate-400 print:text-gray-600">
                Coerência Média: <strong className="text-white print:text-black">{avgCoherence}</strong> / 3.0
              </span>
              <span className="text-sm text-slate-400 print:text-gray-600">
                Taxa de Armadilhas: <strong className="text-white print:text-black">{trapRate}</strong>
              </span>
            </div>
          </div>
        </Reveal>


        {/* Executive Summary */}
        {finalDecision && (
          <Reveal delay={400}>
            <h2 className="text-xl font-bold text-white mb-3 print:text-black">Sumário Executivo</h2>
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <p className="text-sm text-slate-300 leading-relaxed print:text-gray-800">
                {summary}
              </p>
            </div>
          </Reveal>
        )}

        {/* PESTEL Summary Table */}
        <Reveal delay={700}>
          <h2 className="text-xl font-bold text-white mb-3 print:text-black">Resumo PESTEL</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 print:text-gray-600 print:border-gray-300">
                  <th className="text-left py-2">Ronda</th>
                  <th className="text-left py-2">Categoria</th>
                  <th className="text-left py-2">Evento</th>
                  <th className="text-left py-2">Intensidade</th>
                  <th className="text-left py-2">Leitura</th>
                  <th className="text-left py-2">Métrica</th>
                  <th className="text-right py-2">Efeito</th>
                </tr>
              </thead>
              <tbody>
                {roundHistory.map((r) => {
                  const effectSign = r.interpretation === 'opportunity' ? '+' : '-';
                  return (
                    <tr key={r.round} className="border-b border-slate-800/50 print:border-gray-200">
                      <td className="py-2 font-mono">{r.round}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${PESTEL_COLORS[r.pestelCard.category]} print:text-black`}>
                          {PESTEL_LABELS[r.pestelCard.category]}
                        </span>
                      </td>
                      <td className="py-2 text-slate-300 print:text-gray-800">{r.pestelCard.title}</td>
                      <td className="py-2 text-slate-400 print:text-gray-600">{intensityLabel(r.pestelIntensity)}</td>
                      <td className="py-2">
                        <span className={r.interpretation === 'opportunity' ? 'text-emerald-400 print:text-green-700' : 'text-red-400 print:text-red-700'}>
                          {r.interpretation === 'opportunity' ? 'Oportunidade' : 'Ameaça'}
                        </span>
                      </td>
                      <td className="py-2 text-slate-400 print:text-gray-600">{METRIC_LABELS[r.affectedMetric]}</td>
                      <td className="py-2 text-right font-mono">
                        <span className={r.interpretation === 'opportunity' ? 'text-emerald-400 print:text-green-700' : 'text-red-400 print:text-red-700'}>
                          {effectSign}{r.metricDeltas[r.affectedMetric] !== undefined ? Math.abs(r.metricDeltas[r.affectedMetric]) : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Five Forces Final State */}
        <Reveal delay={1100}>
          <h2 className="text-xl font-bold text-white mb-3 print:text-black">Cinco Forças — Estado Final</h2>
          <div className="space-y-3">
            {(['newEntrants', 'suppliers', 'buyers', 'substitutes', 'rivalry'] as PorterForce[]).map((f) => {
              const isTop = f === topForce.force;
              return (
                <div key={f} className="flex items-center gap-3">
                  <span className={`w-28 text-sm ${isTop ? 'text-white font-bold print:text-black' : 'text-slate-300 print:text-gray-700'}`}>
                    {PORTER_LABELS[f]}
                    {isTop && <span className="ml-1 text-[10px] text-amber-400 print:text-amber-700">TOP</span>}
                  </span>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-6 flex-1 rounded ${
                          level <= forces[f]
                            ? isTop
                              ? 'bg-amber-500'
                              : forces[f] >= 5
                              ? 'bg-red-500'
                              : forces[f] >= 4
                              ? 'bg-orange-500'
                              : 'bg-sky-500'
                            : 'bg-slate-700 print:bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-mono text-slate-400 w-8 text-right print:text-gray-600">{forces[f]}/5</span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* VRIO Table */}
        <Reveal delay={1500}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-white print:text-black">Recursos VRIO</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              vrioAdjustedIds.length === 0
                ? 'bg-emerald-500/20 text-emerald-400 print:text-green-700'
                : 'bg-amber-500/20 text-amber-400 print:text-amber-700'
            }`}>
              {vrioAdjustedIds.length === 0
                ? 'Baseline confirmado'
                : `${vrioAdjustedIds.length} recurso${vrioAdjustedIds.length > 1 ? 's' : ''} ajustado${vrioAdjustedIds.length > 1 ? 's' : ''}`
              }
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 print:text-gray-600 print:border-gray-300">
                  <th className="text-left py-2">Recurso</th>
                  <th className="text-center py-2">V</th>
                  <th className="text-center py-2">R</th>
                  <th className="text-center py-2">I</th>
                  <th className="text-center py-2">O</th>
                  <th className="text-left py-2">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {selectedResources.map((r) => {
                  const adjusted = vrioAdjustedIds.includes(r.id);
                  const base = vrioBaseline.find((b) => b.id === r.id);
                  return (
                    <tr key={r.id} className={`border-b border-slate-800/50 print:border-gray-200 ${adjusted ? 'bg-amber-500/5' : ''}`}>
                      <td className="py-2 text-slate-300 print:text-gray-800">
                        {r.name}
                        {adjusted && <span className="ml-1 text-[10px] text-amber-400 print:text-amber-700">ajustado</span>}
                      </td>
                      {(['V', 'R', 'I', 'O'] as const).map((f) => {
                        const changed = adjusted && base && r[f] !== base[f];
                        return (
                          <td key={f} className="py-2 text-center">
                            <span className={
                              changed
                                ? 'text-amber-400 print:text-amber-700'
                                : r[f]
                                ? 'text-emerald-400 print:text-green-700'
                                : 'text-slate-600 print:text-gray-400'
                            }>
                              {r[f] ? '\u25cf' : '\u25cb'}
                            </span>
                            {changed && (
                              <span className="block text-[9px] text-slate-500">
                                {base[f] ? '\u25cf' : '\u25cb'}→{r[f] ? '\u25cf' : '\u25cb'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2">
                        <span className={`text-xs font-semibold ${vrioLabelColor(r)}`}>
                          {vrioLabel(r)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Round-by-Round Timeline */}
        <Reveal delay={1900} className="page-break">
          <h2 className="text-xl font-bold text-white mb-3 print:text-black">Cronologia Ronda a Ronda</h2>
          <div className="space-y-4">
            {roundHistory.map((r) => (
              <div
                key={r.round}
                className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 print:bg-gray-50 print:border-gray-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white print:text-black">Ronda {r.round}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs text-slate-400 print:text-gray-600">
                      Coerência: {r.coherenceScore}/3
                      {r.coherenceBreakdown && (
                        <span className="ml-1">
                          ({r.coherenceBreakdown.pestel ? '✓' : '✗'}P {r.coherenceBreakdown.porter ? '✓' : '✗'}F {r.coherenceBreakdown.vrio ? '✓' : '✗'}V)
                        </span>
                      )}
                    </span>
                    <span className={`text-xs font-bold ${
                      r.movement > 0 ? 'text-emerald-400' : r.movement < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {r.movement > 0 ? '+' : ''}{r.movement} mov
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 print:text-gray-500">PESTEL:</span>{' '}
                    <span className="text-slate-300 print:text-gray-800">{r.pestelCard.title}</span>
                    <span className={` ml-1 text-xs ${
                      r.interpretation === 'opportunity' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ({r.interpretation === 'opportunity' ? 'oportunidade' : 'ameaça'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-gray-500">Porter:</span>{' '}
                    <span className="text-slate-300 print:text-gray-800">{r.porterCard.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-gray-500">Ação:</span>{' '}
                    <span className="text-slate-300 print:text-gray-800">{r.selectedAction.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-gray-500">Posição:</span>{' '}
                    <span className="text-slate-300 print:text-gray-800">{r.boardPositionAfter}</span>
                  </div>
                </div>

                {r.trapsTriggered.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-red-400">Armadilhas: {r.trapsTriggered.join(', ')}</span>
                    {r.trapsMitigated.length > 0 && (
                      <span className="text-cyan-400 ml-2">
                        (Mitigadas: {r.trapsMitigated.join(', ')})
                      </span>
                    )}
                  </div>
                )}

                {/* Post-round metrics */}
                <div className="mt-2 flex gap-3 text-xs">
                  {(['cash', 'share', 'brand', 'ops'] as MetricKey[]).map((k) => (
                    <span key={k} className="text-slate-400 print:text-gray-600">
                      {METRIC_LABELS[k]}: <strong className="text-slate-300 print:text-gray-800">{r.metricsAfter[k]}</strong>
                      {r.metricDeltas[k] !== 0 && (
                        <span className={`ml-1 ${r.metricDeltas[k] > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({r.metricDeltas[k] > 0 ? '+' : ''}{r.metricDeltas[k]})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Board Memo */}
        {finalDecision && (
          <Reveal delay={2300}>
            <h2 className="text-xl font-bold text-white mb-3 print:text-black">Memorando do Conselho</h2>
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-3 text-sm print:bg-gray-50 print:border-gray-300">
              <div>
                <span className="text-slate-500 print:text-gray-500">PESTEL Dominante:</span>{' '}
                <span className="text-white font-semibold print:text-black">
                  {finalDecision.dominantPestel.map((c: PestelCategory) => PESTEL_LABELS[c]).join(', ')}
                </span>
                {finalDecision.edited?.dominantPestel && (
                  <span className="ml-2 text-[10px] text-amber-400 print:text-amber-700">editado</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500">Força Crítica:</span>{' '}
                <span className="text-white font-semibold print:text-black">
                  {PORTER_LABELS[finalDecision.criticalForce]} ({forces[finalDecision.criticalForce]}/5)
                </span>
                {finalDecision.edited?.criticalForce && (
                  <span className="ml-2 text-[10px] text-amber-400 print:text-amber-700">editado</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500">Recursos-Chave:</span>{' '}
                <span className="text-white font-semibold print:text-black">
                  {finalDecision.keyResources
                    .map((id: string) => selectedResources.find((r) => r.id === id)?.name ?? id)
                    .join(', ')}
                </span>
                {finalDecision.edited?.keyResources && (
                  <span className="ml-2 text-[10px] text-amber-400 print:text-amber-700">editado</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500">Próxima Ação:</span>{' '}
                <span className="text-white font-semibold print:text-black">
                  {ACTION_POOL.find((a) => a.id === finalDecision.nextActionId)?.name ?? finalDecision.nextActionId}
                </span>
                {finalDecision.edited?.nextAction && (
                  <span className="ml-2 text-[10px] text-amber-400 print:text-amber-700">editado</span>
                )}
              </div>
              {finalDecision.rationale && (
                <div>
                  <span className="text-slate-500 print:text-gray-500">Nota:</span>{' '}
                  <span className="text-slate-300 italic print:text-gray-700">
                    "{finalDecision.rationale}"
                  </span>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* Final Metrics */}
        <Reveal delay={2700}>
          <h2 className="text-xl font-bold text-white mb-3 print:text-black">Métricas Finais</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['cash', 'share', 'brand', 'ops'] as MetricKey[]).map((k) => (
              <div
                key={k}
                className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-center print:bg-gray-50 print:border-gray-300"
              >
                <div className="text-2xl font-bold text-white print:text-black">{metrics[k]}</div>
                <div className="text-xs text-slate-400 mt-1 print:text-gray-600">{METRIC_LABELS[k]}</div>
                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden print:bg-gray-200">
                  <div
                    className={`h-full rounded-full ${METRIC_COLORS[k]}`}
                    style={{ width: `${metrics[k]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Buttons */}
        <Reveal delay={3100}>
          <div className="flex justify-center gap-4 no-print pb-8">
            <motion.button
              onClick={() => window.print()}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold
                transition-colors border border-slate-700 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Imprimir Relatório
            </motion.button>
            <motion.button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold
                transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Novo Jogo
            </motion.button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
