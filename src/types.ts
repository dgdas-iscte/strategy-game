/* ═══ Primitives ═══ */

export type PestelCategory = 'P' | 'E' | 'S' | 'T' | 'Ec' | 'L';

export type PorterForce =
  | 'newEntrants'
  | 'suppliers'
  | 'buyers'
  | 'substitutes'
  | 'rivalry';

export type MetricKey = 'cash' | 'share' | 'brand' | 'ops';

export type Interpretation = 'opportunity' | 'threat';

export type Intensity = 'weak' | 'medium' | 'strong';

export type ExpectedImpactType =
  | 'cost_pressure'
  | 'demand_shift'
  | 'compliance_risk'
  | 'operational_disruption'
  | 'innovation_shift'
  | 'reputation_pressure';

export type ActionIntent = 'exploit' | 'mitigate';

export type Phase =
  | 'home'
  | 'prologue'
  | 'vrio-audit'
  | 'round'
  | 'final-decision'
  | 'report';

export type RoundPhase =
  | 'pestel-draw'
  | 'pestel-interpret'
  | 'porter-draw'
  | 'vrio-activate'
  | 'action-choose'
  | 'resolve';

/* ═══ Cards ═══ */

export interface CardPESTEL {
  id: string;
  category: PestelCategory;
  title: string;
  description: string;
  defaultPolarity: Interpretation;
  suggestedMetric: MetricKey;
  expectedImpactType: ExpectedImpactType;
  tags: string[];
}

export interface CardPorter {
  id: string;
  force: PorterForce;
  title: string;
  description: string;
  direction: 'up' | 'down';
  tags: string[];
}

/* ═══ Resources & Actions ═══ */

export interface ResourceVRIO {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  recommendedUse: string;
  V: boolean;
  R: boolean;
  I: boolean;
  O: boolean;
  selected: boolean;
}

export interface ActionAffinity {
  type: 'pestel' | 'porter' | 'vrio';
  pestelCategory?: PestelCategory;
  porterForce?: PorterForce;
  porterThreshold?: number;
  vrioId?: string;
  bonus: Partial<Record<MetricKey, number>>;
  label: string;
}

export interface Action {
  id: string;
  name: string;
  shortDesc: string;
  isBig: boolean;
  intent: ActionIntent;
  baseEffects: Record<MetricKey, number>;
  affinities: ActionAffinity[];
}

/* ═══ Coherence breakdown ═══ */

export interface CoherenceBreakdown {
  pestel: boolean;
  porter: boolean;
  vrio: boolean;
}

/* ═══ Round scoring (0-100 perfect strategy) ═══ */

export interface RoundScoreResult {
  roundScoreRaw: number;       // 0-100 before coherence multiplier
  roundScoreFinal: number;     // 0-100 after multiplier
  utilityChosen: number;       // -1..+1
  utilityBest: number;         // -1..+1
  utilityWorst: number;        // -1..+1
  missedPoints: string[];      // top penalty explanations
}

/* ═══ Round log (immutable record per round) ═══ */

export interface RoundLog {
  round: number;
  pestelCard: CardPESTEL;
  pestelIntensity: number;
  interpretation: Interpretation;
  affectedMetric: MetricKey;
  porterCard: CardPorter;
  porterIntensity: number;
  activatedVRIO: string;
  selectedAction: Action;
  justifications: {
    pestel: PestelCategory;
    porter: PorterForce;
    vrio: string;
  };
  coherenceScore: number;
  coherenceBreakdown: CoherenceBreakdown;
  trapsTriggered: string[];
  trapsMitigated: string[];
  leverageUsed: boolean;
  metricDeltas: Record<MetricKey, number>;
  metricsAfter: Record<MetricKey, number>;
  forcesAfter: Record<PorterForce, number>;
  movement: number;
  boardPositionAfter: number;
  tokensGained: { leverage: number; resilience: number };
  roundScore: RoundScoreResult;
}

/* ═══ Final decision (Board Memo) ═══ */

export interface FinalDecision {
  dominantPestel: [PestelCategory, PestelCategory];
  criticalForce: PorterForce;
  keyResources: [string, string];
  nextActionId: string;
  rationale: string;
  edited: {
    dominantPestel: boolean;
    criticalForce: boolean;
    keyResources: boolean;
    nextAction: boolean;
  };
}

/* ═══ Prologue ═══ */

export interface PrologueChoice {
  scene: number;
  question: string;
  answer: string;
  value: string;
}

/* ═══ Round state (ephemeral, reset per round) ═══ */

export interface RoundState {
  currentPestelCard: CardPESTEL | null;
  currentPestelIntensity: number;
  pestelInterpretation: Interpretation | null;
  affectedMetric: MetricKey | null;
  currentPorterCard: CardPorter | null;
  currentPorterIntensity: number;
  activatedVRIO: string | null;
  availableActions: Action[];
  selectedAction: Action | null;
  justifications: {
    pestel: PestelCategory | null;
    porter: PorterForce | null;
    vrio: string | null;
  };
  usedLeverageThisRound: boolean;
  mitigatedTraps: string[];
}

/* ═══ Full game state (persisted) ═══ */

export interface GameState {
  saveVersion: number;
  phase: Phase;
  roundPhase: RoundPhase;
  currentRound: number;
  totalRounds: number;
  companyName: string;
  _returnPhase: Phase | null;
  prologueChoices: PrologueChoice[];
  vrioResources: ResourceVRIO[];
  vrioBaseline: ResourceVRIO[];
  vrioAdjustedIds: string[];
  boardPosition: number;
  metrics: Record<MetricKey, number>;
  forces: Record<PorterForce, number>;
  leverageTokens: number;
  resilienceTokens: number;
  current: RoundState;
  roundHistory: RoundLog[];
  /* Deck management */
  pestelDeck: CardPESTEL[];
  porterDeck: CardPorter[];
  pestelDiscard: CardPESTEL[];
  porterDiscard: CardPorter[];
  finalDecision: FinalDecision | null;
}

/* ═══ Dispatch actions ═══ */

export interface ResolvePayload {
  coherence: number;
  coherenceBreakdown: CoherenceBreakdown;
  newForces: Record<PorterForce, number>;
  newMetrics: Record<MetricKey, number>;
  metricDeltas: Record<MetricKey, number>;
  newPosition: number;
  movement: number;
  trapsTriggered: string[];
  trapsMitigated: string[];
  leverageUsed: boolean;
  tokensGained: { leverage: number; resilience: number };
  roundScore: RoundScoreResult;
}

export type Dispatch =
  | { type: 'START_GAME'; totalRounds?: number }
  | { type: 'SET_PROLOGUE'; scene: number; question: string; answer: string; value: string }
  | { type: 'FINISH_PROLOGUE' }
  | { type: 'TOGGLE_RESOURCE'; id: string }
  | { type: 'TOGGLE_FLAG'; id: string; flag: 'V' | 'R' | 'I' | 'O' }
  | { type: 'CONFIRM_VRIO_BASELINE' }
  | { type: 'REVERT_VRIO_RESOURCE'; id: string }
  | { type: 'RESET_VRIO_BASELINE' }
  | { type: 'FINISH_AUDIT' }
  | { type: 'DRAW_PESTEL'; intensity: number }
  | { type: 'INTERPRET_PESTEL'; interpretation: Interpretation; metric: MetricKey }
  | { type: 'DRAW_PORTER'; intensity: number }
  | { type: 'ACTIVATE_VRIO'; id: string }
  | { type: 'SET_ACTIONS'; actions: Action[] }
  | { type: 'SELECT_ACTION'; action: Action; justifications: { pestel: PestelCategory; porter: PorterForce; vrio: string } }
  | { type: 'USE_LEVERAGE' }
  | { type: 'USE_RESILIENCE'; trapName: string }
  | { type: 'COMMIT_RESOLVE'; payload: ResolvePayload }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_FINAL'; decision: FinalDecision }
  | { type: 'GO_REPORT' }
  | { type: 'GO_HOME' }
  | { type: 'CONTINUE_GAME' }
  | { type: 'RESET' };
