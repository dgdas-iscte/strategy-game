import type {
  CardPESTEL,
  CardPorter,
  ResourceVRIO,
  Action,
  ActionIntent,
  PestelCategory,
  PorterForce,
  MetricKey,
  ExpectedImpactType,
} from './types';
import PESTEL_CONTENT from './content/pestel';
import PORTER_CONTENT from './content/porter';
import type { ContentPorterForce } from './content/porter';
import VRIO_CONTENT from './content/vrio';

/* ═══════════════════════════════════════════
   PESTEL CARDS  (mapped from content → engine)
   ═══════════════════════════════════════════ */

const PESTEL_CAT_MAP: Record<string, PestelCategory> = {
  P: 'P', E: 'E', S: 'S', T: 'T', Ec: 'Ec', L: 'L',
};

export const PESTEL_CARDS: CardPESTEL[] = PESTEL_CONTENT.map((c) => ({
  id: c.id,
  category: PESTEL_CAT_MAP[c.category] as PestelCategory,
  title: c.title,
  description: c.description,
  defaultPolarity: c.defaultPolarity,
  suggestedMetric: c.suggestedMetric,
  expectedImpactType: c.expectedImpactType as ExpectedImpactType,
  tags: c.tags,
}));

/* ═══════════════════════════════════════════
   PORTER CARDS  (mapped from content → engine)
   ═══════════════════════════════════════════ */

const FORCE_MAP: Record<ContentPorterForce, PorterForce> = {
  Rivalry: 'rivalry',
  Entrants: 'newEntrants',
  Substitutes: 'substitutes',
  Buyers: 'buyers',
  Suppliers: 'suppliers',
};

export const PORTER_CARDS: CardPorter[] = PORTER_CONTENT.map((c) => ({
  id: c.id,
  force: FORCE_MAP[c.force],
  title: c.title,
  description: c.description,
  direction: c.direction,
  tags: c.tags,
}));

/* ═══════════════════════════════════════════
   VRIO RESOURCE TEMPLATES (8 — player picks 4)
   ═══════════════════════════════════════════ */

export const VRIO_TEMPLATES: ResourceVRIO[] = VRIO_CONTENT.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.shortDesc,
  shortDesc: c.shortDesc,
  recommendedUse: c.recommendedUse,
  V: c.baseline.V,
  R: c.baseline.R,
  I: c.baseline.I,
  O: c.baseline.O,
  selected: c.preSelected,
}));

/* ═══════════════════════════════════════════
   IMPACT TYPE → VALID METRICS
   Maps each expectedImpactType to which
   metric choices are considered "aligned".
   ═══════════════════════════════════════════ */

export const IMPACT_TYPE_METRICS: Record<ExpectedImpactType, MetricKey[]> = {
  cost_pressure: ['cash'],
  demand_shift: ['share'],
  compliance_risk: ['brand', 'ops'],
  operational_disruption: ['ops'],
  innovation_shift: ['ops', 'share'],
  reputation_pressure: ['brand'],
};

/* ═══════════════════════════════════════════
   ACTION → COMPATIBLE VRIO RESOURCES
   Defines which VRIO resources thematically
   align with each action for coherence scoring.
   ═══════════════════════════════════════════ */

export const ACTION_VRIO_COMPAT: Record<string, string[]> = {
  a1: ['tech', 'brand', 'data'],       // Lançar Linha — leverages tech/brand/data
  a2: ['finance', 'partners'],          // Adquirir Concorrente — needs capital & networks
  a3: ['tech', 'data', 'talent'],       // Transformação Digital — tech/data/talent
  a4: ['supply', 'culture', 'finance'], // Otimização de Custos — ops excellence
  a5: ['brand', 'data'],               // Campanha de Marca — brand & analytics
  a6: ['supply', 'partners'],          // Reestruturar Cadeia — supply & partners
  a7: ['partners', 'brand', 'finance'],// Parceria Estratégica — networks
  a8: ['culture', 'talent'],           // Conformidade Regulatória — org excellence
};

/* ═══════════════════════════════════════════
   ACTION CATALOG  (8 — 3 big + 5 normal)
   Each action has affinities that grant bonus
   effects when the round context matches.
   intent: 'exploit' = growth/innovation/brand
           'mitigate' = efficiency/compliance/risk
   ═══════════════════════════════════════════ */

export const ACTION_POOL: Action[] = [
  // ── Ações grandes (3) ──
  {
    id: 'a1',
    name: 'Lançar Linha de Produtos',
    shortDesc: 'Desenvolver e lançar uma nova categoria de produto para captar procura não satisfeita.',
    isBig: true,
    intent: 'exploit' as ActionIntent,
    baseEffects: { cash: -12, share: 10, brand: 6, ops: -4 },
    affinities: [
      { type: 'pestel', pestelCategory: 'T', bonus: { share: 3 }, label: 'Lançamento tech-driven' },
      { type: 'porter', porterForce: 'substitutes', porterThreshold: 3, bonus: { brand: 3 }, label: 'Contrariar substitutos' },
      { type: 'vrio', vrioId: 'tech', bonus: { share: 4 }, label: 'Vantagem tech proprietária' },
    ],
  },
  {
    id: 'a2',
    name: 'Adquirir Concorrente',
    shortDesc: 'Adquirir um rival para consolidar posição de mercado e acelerar crescimento.',
    isBig: true,
    intent: 'exploit' as ActionIntent,
    baseEffects: { cash: -18, share: 14, brand: 4, ops: -6 },
    affinities: [
      { type: 'pestel', pestelCategory: 'E', bonus: { share: 3 }, label: 'Janela económica' },
      { type: 'porter', porterForce: 'rivalry', porterThreshold: 4, bonus: { cash: 3 }, label: 'Reduzir rivalidade' },
      { type: 'vrio', vrioId: 'partners', bonus: { share: 4 }, label: 'Rede de alianças' },
    ],
  },
  {
    id: 'a3',
    name: 'Transformação Digital',
    shortDesc: 'Reformular infraestrutura tecnológica e digitalizar processos de negócio centrais.',
    isBig: true,
    intent: 'mitigate' as ActionIntent,
    baseEffects: { cash: -10, share: 5, brand: 6, ops: 10 },
    affinities: [
      { type: 'pestel', pestelCategory: 'T', bonus: { ops: 3 }, label: 'Impulso tecnológico' },
      { type: 'porter', porterForce: 'newEntrants', porterThreshold: 3, bonus: { share: 3 }, label: 'Reforçar barreiras' },
      { type: 'vrio', vrioId: 'data', bonus: { ops: 4 }, label: 'Operações data-driven' },
    ],
  },

  // ── Ações normais (5) ──
  {
    id: 'a4',
    name: 'Otimização de Custos',
    shortDesc: 'Reduzir custos sistematicamente em toda a operação sem sacrificar qualidade.',
    isBig: false,
    intent: 'mitigate' as ActionIntent,
    baseEffects: { cash: 12, share: -2, brand: -2, ops: 8 },
    affinities: [
      { type: 'pestel', pestelCategory: 'E', bonus: { cash: 3 }, label: 'Pressão económica' },
      { type: 'porter', porterForce: 'suppliers', porterThreshold: 3, bonus: { ops: 3 }, label: 'Alavancagem s/ fornecedores' },
      { type: 'vrio', vrioId: 'supply', bonus: { cash: 4 }, label: 'Vantagem cadeia abastecimento' },
    ],
  },
  {
    id: 'a5',
    name: 'Campanha de Marca',
    shortDesc: 'Lançar campanha de marketing multicanal para reforçar visibilidade e reputação.',
    isBig: false,
    intent: 'exploit' as ActionIntent,
    baseEffects: { cash: -8, share: 4, brand: 12, ops: 0 },
    affinities: [
      { type: 'pestel', pestelCategory: 'S', bonus: { brand: 3 }, label: 'Impulso social' },
      { type: 'porter', porterForce: 'buyers', porterThreshold: 4, bonus: { share: 3 }, label: 'Lealdade compradores' },
      { type: 'vrio', vrioId: 'brand', bonus: { brand: 4 }, label: 'Amplificador de herança' },
    ],
  },
  {
    id: 'a6',
    name: 'Reestruturar Cadeia Abastecimento',
    shortDesc: 'Reestruturar logística e diversificar parcerias com fornecedores para resiliência.',
    isBig: false,
    intent: 'mitigate' as ActionIntent,
    baseEffects: { cash: -6, share: 2, brand: 2, ops: 12 },
    affinities: [
      { type: 'pestel', pestelCategory: 'Ec', bonus: { ops: 3 }, label: 'Conformidade ecológica' },
      { type: 'porter', porterForce: 'suppliers', porterThreshold: 4, bonus: { cash: 3 }, label: 'Reduzir poder fornecedores' },
      { type: 'vrio', vrioId: 'supply', bonus: { ops: 4 }, label: 'Rede logística' },
    ],
  },
  {
    id: 'a7',
    name: 'Parceria Estratégica',
    shortDesc: 'Formar aliança estratégica para aceder a novas capacidades e mercados.',
    isBig: false,
    intent: 'exploit' as ActionIntent,
    baseEffects: { cash: -4, share: 7, brand: 5, ops: 4 },
    affinities: [
      { type: 'pestel', pestelCategory: 'P', bonus: { share: 3 }, label: 'Alinhamento político' },
      { type: 'porter', porterForce: 'newEntrants', porterThreshold: 3, bonus: { brand: 3 }, label: 'Barreira à entrada' },
      { type: 'vrio', vrioId: 'partners', bonus: { share: 4 }, label: 'Sinergia de alianças' },
    ],
  },
  {
    id: 'a8',
    name: 'Conformidade Regulatória',
    shortDesc: 'Exceder proativamente requisitos regulatórios para ganhar vantagem competitiva.',
    isBig: false,
    intent: 'mitigate' as ActionIntent,
    baseEffects: { cash: -8, share: 2, brand: 6, ops: 4 },
    affinities: [
      { type: 'pestel', pestelCategory: 'L', bonus: { brand: 3 }, label: 'Liderança legal' },
      { type: 'porter', porterForce: 'newEntrants', porterThreshold: 4, bonus: { ops: 3 }, label: 'Fosso de conformidade' },
      { type: 'vrio', vrioId: 'culture', bonus: { brand: 4 }, label: 'Cultura de excelência' },
    ],
  },
];

/* ═══════════════════════════════════════════
   CENAS DO PRÓLOGO
   ═══════════════════════════════════════════ */

export interface PrologueScene {
  scene: number;
  question: string;
  narrative: string;
  options: { label: string; value: string }[];
}

export const PROLOGUE_SCENES: PrologueScene[] = [
  {
    scene: 1,
    question: 'Em que setor opera a NexaCorp?',
    narrative:
      'O conselho de administração acaba de nomeá-lo Diretor de Estratégia da NexaCorp. O seu primeiro dia começa com um briefing sobre a empresa e o seu ambiente operacional.',
    options: [
      { label: 'Plataforma Tecnológica', value: 'tech' },
      { label: 'Bens de Consumo', value: 'consumer' },
      { label: 'Indústria Transformadora', value: 'industrial' },
    ],
  },
  {
    scene: 2,
    question: 'Qual é a posição atual de mercado da NexaCorp?',
    narrative:
      'O primeiro briefing revela o panorama competitivo. Os analistas caracterizaram a posição da NexaCorp face aos principais rivais.',
    options: [
      { label: 'Líder de Mercado', value: 'leader' },
      { label: 'Challenger Ambicioso', value: 'challenger' },
      { label: 'Especialista de Nicho', value: 'niche' },
    ],
  },
  {
    scene: 3,
    question: 'Que prioridade estratégica vai defender?',
    narrative:
      'O conselho quer clareza sobre a sua orientação estratégica para os próximos trimestres. Que direção vai definir o seu mandato?',
    options: [
      { label: 'Crescimento Agressivo', value: 'growth' },
      { label: 'Excelência Operacional', value: 'stability' },
      { label: 'Liderança pela Inovação', value: 'innovation' },
    ],
  },
];

/* ═══════════════════════════════════════════
   MAPAS DE RÓTULOS & CORES
   ═══════════════════════════════════════════ */

export const PESTEL_LABELS: Record<PestelCategory, string> = {
  P: 'Político',
  E: 'Económico',
  S: 'Social',
  T: 'Tecnológico',
  Ec: 'Ecológico',
  L: 'Legal',
};

export const PESTEL_COLORS: Record<PestelCategory, string> = {
  P: 'bg-red-500',
  E: 'bg-amber-500',
  S: 'bg-pink-500',
  T: 'bg-cyan-500',
  Ec: 'bg-emerald-500',
  L: 'bg-violet-500',
};

export const PORTER_LABELS: Record<PorterForce, string> = {
  newEntrants: 'Novos Concorrentes',
  suppliers: 'Fornecedores',
  buyers: 'Compradores',
  substitutes: 'Substitutos',
  rivalry: 'Rivalidade',
};

export const PORTER_COLORS: Record<PorterForce, string> = {
  newEntrants: 'bg-orange-500',
  suppliers: 'bg-yellow-500',
  buyers: 'bg-blue-500',
  substitutes: 'bg-teal-500',
  rivalry: 'bg-rose-500',
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  cash: 'Fluxo de Caixa',
  share: 'Quota de Mercado',
  brand: 'Capital de Marca',
  ops: 'Operações',
};

export const METRIC_COLORS: Record<MetricKey, string> = {
  cash: 'bg-green-500',
  share: 'bg-blue-500',
  brand: 'bg-purple-500',
  ops: 'bg-orange-500',
};

export const INTENSITY_LABELS: Record<string, string> = {
  weak: 'Fraco (×0.5)',
  medium: 'Médio (×1.0)',
  strong: 'Forte (×1.5)',
};

export const IMPACT_TYPE_LABELS: Record<ExpectedImpactType, string> = {
  cost_pressure: 'Pressão de Custos',
  demand_shift: 'Mudança de Procura',
  compliance_risk: 'Risco de Conformidade',
  operational_disruption: 'Disrupção Operacional',
  innovation_shift: 'Mudança de Inovação',
  reputation_pressure: 'Pressão Reputacional',
};
