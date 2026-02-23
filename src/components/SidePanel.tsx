import { motion } from 'framer-motion';
import type { MetricKey, PorterForce } from '../types';
import { METRIC_LABELS, METRIC_COLORS, PORTER_LABELS } from '../data';
import Tooltip from './Tooltip';

interface SidePanelProps {
  metrics: Record<MetricKey, number>;
  forces: Record<PorterForce, number>;
  leverageTokens: number;
  resilienceTokens: number;
}

const METRIC_KEYS: MetricKey[] = ['cash', 'share', 'brand', 'ops'];
const FORCE_KEYS: PorterForce[] = ['newEntrants', 'suppliers', 'buyers', 'substitutes', 'rivalry'];

const FORCE_TIPS: Record<PorterForce, string> = {
  newEntrants: 'Ameaça de novos concorrentes a entrar no mercado',
  suppliers: 'Poder negocial dos seus fornecedores',
  buyers: 'Poder negocial dos seus clientes',
  substitutes: 'Ameaça de produtos ou serviços alternativos',
  rivalry: 'Intensidade da concorrência entre empresas existentes',
};

export default function SidePanel({
  metrics,
  forces,
  leverageTokens,
  resilienceTokens,
}: SidePanelProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-800 space-y-5">
      {/* Tokens */}
      <div className="flex gap-3">
        <Tooltip text="Gastar para potenciar efeitos positivos em +30%">
          <div className="flex-1 bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">{leverageTokens}</div>
            <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mt-1">
              Alavancagem (A)
            </div>
          </div>
        </Tooltip>
        <Tooltip text="Gastar para cancelar penalidade de recuo de armadilha">
          <div className="flex-1 bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">{resilienceTokens}</div>
            <div className="text-[10px] text-cyan-400/70 uppercase tracking-wider mt-1">
              Resiliência (R)
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Metrics */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Métricas
        </h4>
        <div className="space-y-2.5">
          {METRIC_KEYS.map((k) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{METRIC_LABELS[k]}</span>
                <motion.span
                  key={metrics[k]}
                  className="font-mono text-slate-400"
                  initial={{ scale: 1.4, color: '#818cf8' }}
                  animate={{ scale: 1, color: '#94a3b8' }}
                  transition={{ duration: 0.4 }}
                >
                  {metrics[k]}
                </motion.span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${METRIC_COLORS[k]}`}
                  animate={{ width: `${metrics[k]}%` }}
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Five Forces */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Cinco Forças
        </h4>
        <div className="space-y-2.5">
          {FORCE_KEYS.map((k) => (
            <div key={k}>
              <Tooltip text={FORCE_TIPS[k]}>
                <div className="flex justify-between text-xs mb-1 w-full">
                  <span className="text-slate-300">{PORTER_LABELS[k]}</span>
                  <span className="font-mono text-slate-400">{forces[k]}/5</span>
                </div>
              </Tooltip>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.div
                    key={level}
                    className={`h-3 flex-1 rounded-sm ${
                      level <= forces[k]
                        ? forces[k] >= 5
                          ? 'bg-red-500'
                          : forces[k] >= 4
                          ? 'bg-orange-500'
                          : 'bg-sky-500'
                        : 'bg-slate-700'
                    }`}
                    animate={{
                      scale: level <= forces[k] ? 1 : 0.7,
                      opacity: level <= forces[k] ? 1 : 0.3,
                    }}
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                ))}
              </div>
              {forces[k] >= 5 && (
                <motion.span
                  className="text-[10px] text-red-400 font-bold"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  PRESSÃO MÁXIMA
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
