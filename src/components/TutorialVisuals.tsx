import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 } };

/* ═══ Step 1: Welcome ═══ */
function WelcomeVisual() {
  const decks = [
    { label: 'PESTEL', color: 'from-red-500 to-amber-500' },
    { label: 'Cinco Forças', color: 'from-blue-500 to-cyan-500' },
    { label: 'VRIO', color: 'from-emerald-500 to-teal-500' },
  ];
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {decks.map((d) => (
          <div key={d.label} className={`w-16 h-22 rounded-xl bg-gradient-to-br ${d.color} border border-white/10 flex flex-col items-center justify-center`}>
            <span className="text-lg">🃏</span>
            <span className="text-[9px] font-bold text-white/90 mt-0.5">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((r) => (
          <div key={r} className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
            R{r}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══ Step 2: PESTEL ═══ */
function PestelVisual() {
  const cats = [
    { label: 'P', color: 'bg-red-500' },
    { label: 'E', color: 'bg-amber-500' },
    { label: 'S', color: 'bg-pink-500' },
    { label: 'T', color: 'bg-cyan-500' },
    { label: 'Ec', color: 'bg-emerald-500' },
    { label: 'L', color: 'bg-violet-500' },
  ];
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="flex gap-1.5">
        {cats.map((c) => (
          <span key={c.label} className={`${c.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{c.label}</span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 w-36">
          <span className="text-cyan-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20">Tech</span>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">IA Automatiza Processos-Chave</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-2xl">🎲</span>
          <span className="text-[9px] text-slate-500 font-mono">×1.5</span>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Oportunidade</span>
        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold border border-red-500/30">Ameaça</span>
      </div>
    </motion.div>
  );
}

/* ═══ Step 3: Porter's Five Forces ═══ */
function PorterVisual() {
  const forces = [
    { label: 'Rivalidade', level: 3 },
    { label: 'N. Concorrentes', level: 2 },
    { label: 'Substitutos', level: 4 },
    { label: 'Compradores', level: 2 },
    { label: 'Fornecedores', level: 5 },
  ];
  return (
    <motion.div {...fade} className="space-y-1.5">
      {forces.map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 w-16 text-right">{f.label}</span>
          <div className="flex gap-0.5 flex-1">
            {[1, 2, 3, 4, 5].map((l) => (
              <div key={l} className={`h-3 flex-1 rounded-sm ${
                l <= f.level
                  ? f.level >= 5 ? 'bg-red-500' : f.level >= 4 ? 'bg-orange-500' : 'bg-sky-500'
                  : 'bg-slate-700'
              }`} />
            ))}
          </div>
          <span className="text-[10px] text-slate-500 font-mono w-6">{f.level}/5</span>
        </div>
      ))}
      <p className="text-[9px] text-red-400 font-bold text-center mt-1">Fornecedores em PRESSÃO MÁXIMA</p>
    </motion.div>
  );
}

/* ═══ Step 4: VRIO ═══ */
function VRIOVisual() {
  const flags = [
    { letter: 'V', on: true, tip: 'Valioso' },
    { letter: 'R', on: true, tip: 'Raro' },
    { letter: 'I', on: true, tip: 'Inimitável' },
    { letter: 'O', on: false, tip: 'Organizado' },
  ];
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 w-52">
        <p className="text-xs font-bold text-white mb-2">Herança de Marca</p>
        <div className="flex gap-1.5 mb-2">
          {flags.map((f) => (
            <div key={f.letter} className="flex flex-col items-center gap-0.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                f.on ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500'
              }`}>
                {f.letter}
              </div>
              <span className="text-[8px] text-slate-500">{f.tip}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-semibold text-yellow-400">Vantagem Inexplorada</p>
        <p className="text-[9px] text-slate-500 mt-0.5">O está OFF — risco de execução</p>
      </div>
    </motion.div>
  );
}

/* ═══ Step 5: Tokens ═══ */
function TokensVisual() {
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20 w-28">
          <div className="text-2xl font-bold text-amber-400">A</div>
          <div className="text-[9px] text-amber-400/70 uppercase tracking-wider mt-0.5">Alavancagem</div>
          <div className="text-[9px] text-slate-500 mt-1">V + R → +30%</div>
        </div>
        <div className="bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/20 w-28">
          <div className="text-2xl font-bold text-cyan-400">R</div>
          <div className="text-[9px] text-cyan-400/70 uppercase tracking-wider mt-0.5">Resiliência</div>
          <div className="text-[9px] text-slate-500 mt-1">I + O → cancelar armadilha</div>
        </div>
      </div>
      <p className="text-[9px] text-slate-500 text-center">Resiliência requer O=ON no recurso ativado</p>
    </motion.div>
  );
}

/* ═══ Step 6: Actions & Coherence ═══ */
function ActionsVisual() {
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {['Otimização Custos', 'Campanha Marca', 'Transf. Digital'].map((a, i) => (
          <div key={a} className={`rounded-lg p-2 border-2 w-28 ${
            i === 1 ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50'
          }`}>
            <p className="text-[10px] font-bold text-white leading-tight">{a}</p>
            <p className="text-[8px] text-slate-500 mt-0.5">Caixa: +12  Ops: +8</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-400">Coerência:</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${
              i < 2 ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-500'
            }`}>
              {i < 2 ? '✓' : '·'}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">2/3</span>
      </div>
    </motion.div>
  );
}

/* ═══ Step 7: Movement & Traps ═══ */
function MovementVisual() {
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
            i < 5 ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' :
            i === 5 ? 'bg-indigo-500 text-white border-2 border-indigo-400' :
            'bg-slate-800 text-slate-600 border border-slate-700'
          }`}>
            {i === 5 ? '▲' : i}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-emerald-400 font-bold">+1 base</span>
        <span className="text-[10px] text-emerald-400 font-bold">+1 bónus coerência</span>
        <span className="text-[10px] text-slate-500">=</span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">+2</span>
      </div>
      <div className="flex gap-2">
        {['Choque PESTEL', 'Pressão Máxima', 'Falha Execução'].map((t) => (
          <span key={t} className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 font-medium">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══ Step 8: Final Decision & Report ═══ */
function FinalVisual() {
  return (
    <motion.div {...fade} className="flex flex-col items-center gap-3">
      <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 w-56">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📊</span>
          <span className="text-xs font-bold text-white">Relatório Estratégico</span>
        </div>
        <div className="space-y-1">
          {['2 Fatores PESTEL dominantes', 'Força mais crítica', '2 Recursos VRIO-chave', 'Ação próximo trimestre'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[9px] text-slate-400">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500">Exportar:</span>
        <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">Ctrl+P → PDF</span>
      </div>
    </motion.div>
  );
}

/* ═══ Main export ═══ */

interface StepVisualProps {
  visual: 'welcome' | 'pestel' | 'porter' | 'vrio' | 'tokens' | 'actions' | 'movement' | 'final';
}

export default function StepVisual({ visual }: StepVisualProps) {
  switch (visual) {
    case 'welcome':  return <WelcomeVisual />;
    case 'pestel':   return <PestelVisual />;
    case 'porter':   return <PorterVisual />;
    case 'vrio':     return <VRIOVisual />;
    case 'tokens':   return <TokensVisual />;
    case 'actions':  return <ActionsVisual />;
    case 'movement': return <MovementVisual />;
    case 'final':    return <FinalVisual />;
  }
}
