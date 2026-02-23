import type {
  GameState,
  RoundState,
  CardPESTEL,
  CardPorter,
  Action,
  MetricKey,
  PestelCategory,
  PorterForce,
  Interpretation,
  Intensity,
  ResourceVRIO,
  ResolvePayload,
  CoherenceBreakdown,
  FinalDecision,
  RoundScoreResult,
} from './types';
import { ACTION_POOL, IMPACT_TYPE_METRICS, ACTION_VRIO_COMPAT } from './data';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const METRIC_KEYS: MetricKey[] = ['cash', 'share', 'brand', 'ops'];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Board max position = 1 (base) + 2 per round (base move + coherence bonus). */
export function boardMaxPosition(totalRounds: number): number {
  return 1 + 2 * totalRounds;
}

export const INITIAL_ROUND_STATE: RoundState = {
  currentPestelCard: null,
  currentPestelIntensity: 0,
  pestelInterpretation: null,
  affectedMetric: null,
  currentPorterCard: null,
  currentPorterIntensity: 0,
  activatedVRIO: null,
  availableActions: [],
  selectedAction: null,
  justifications: { pestel: null, porter: null, vrio: null },
  usedLeverageThisRound: false,
  mitigatedTraps: [],
};

/* ═══════════════════════════════════════════════════════════
   1. DICE
   ═══════════════════════════════════════════════════════════ */

/** Roll a fair d6, returning 1..6. */
export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/* ═══════════════════════════════════════════════════════════
   2. INTENSITY
   ═══════════════════════════════════════════════════════════ */

/** Map a d6 roll to a named intensity tier. */
export function intensityFromRoll(roll: number): Intensity {
  if (roll <= 2) return 'weak';
  if (roll <= 4) return 'medium';
  return 'strong';
}

/** Numeric multiplier for an intensity roll: weak=0.5, medium=1.0, strong=1.5. */
export function intensityMultiplier(roll: number): number {
  if (roll <= 2) return 0.5;
  if (roll <= 4) return 1.0;
  return 1.5;
}

/** Human-readable label with multiplier. */
export function intensityLabel(roll: number): string {
  const labels: Record<Intensity, string> = {
    weak: 'Fraco (\u00d70.5)',
    medium: 'Médio (\u00d71.0)',
    strong: 'Forte (\u00d71.5)',
  };
  return labels[intensityFromRoll(roll)];
}

/* ═══════════════════════════════════════════════════════════
   3. DECK UTILITIES
   ═══════════════════════════════════════════════════════════ */

/** Fisher-Yates shuffle — returns a new array. */
export function shuffleDeck<T>(deck: T[]): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ═══════════════════════════════════════════════════════════
   4. APPLY PESTEL EVENT  (pure state → state)
   ═══════════════════════════════════════════════════════════ */

export function applyPESTELEvent(
  state: GameState,
  card: CardPESTEL,
  intensity: number,
  playerInterpretation: Interpretation,
  chosenMetric: MetricKey,
): GameState {
  return {
    ...state,
    roundPhase: 'porter-draw',
    current: {
      ...state.current,
      currentPestelCard: card,
      currentPestelIntensity: intensity,
      pestelInterpretation: playerInterpretation,
      affectedMetric: chosenMetric,
    },
  };
}

/* ═══════════════════════════════════════════════════════════
   5. APPLY PORTER SHIFT  (pure state → state)
   ═══════════════════════════════════════════════════════════ */

export function applyPorterShift(
  state: GameState,
  card: CardPorter,
  intensity: number,
): GameState {
  const newForces = { ...state.forces };
  const delta =
    card.direction === 'up'
      ? Math.ceil(intensityMultiplier(intensity))
      : -Math.ceil(intensityMultiplier(intensity));
  newForces[card.force] = clamp(newForces[card.force] + delta, 0, 5);

  return {
    ...state,
    roundPhase: 'vrio-activate',
    current: {
      ...state.current,
      currentPorterCard: card,
      currentPorterIntensity: intensity,
    },
    forces: newForces,
  };
}

/* ═══════════════════════════════════════════════════════════
   6. GET TOP PORTER FORCE
   ═══════════════════════════════════════════════════════════ */

export function getTopPorterForce(
  forces: Record<PorterForce, number>,
): { force: PorterForce; value: number } {
  let topForce: PorterForce = 'rivalry';
  let topValue = -1;
  for (const [f, v] of Object.entries(forces) as [PorterForce, number][]) {
    if (v > topValue) {
      topValue = v;
      topForce = f;
    }
  }
  return { force: topForce, value: topValue };
}

/* ═══════════════════════════════════════════════════════════
   7. COHERENCE  (0..3) — 3-component system

   (1) PESTEL alignment:
       - chosen metric matches expectedImpactType mapping
       - AND action intent matches reading
         (threat → mitigate, opportunity → exploit)
   (2) Porter alignment:
       - justification force is drawn card's force
         OR the highest force meter (critical pressure)
   (3) VRIO alignment:
       - justification matches activated resource
       - AND action is compatible with that resource
   ═══════════════════════════════════════════════════════════ */

/** Check if a metric aligns with a PESTEL card's expectedImpactType. */
export function isMetricAligned(card: CardPESTEL, metric: MetricKey): boolean {
  const validMetrics = IMPACT_TYPE_METRICS[card.expectedImpactType];
  return validMetrics.includes(metric);
}

/** Check PESTEL alignment: metric matches + action intent matches reading. */
export function checkPestelAlignment(
  card: CardPESTEL,
  metric: MetricKey,
  interpretation: Interpretation,
  action: Action,
): boolean {
  const metricOk = isMetricAligned(card, metric);
  const intentOk =
    (interpretation === 'threat' && action.intent === 'mitigate') ||
    (interpretation === 'opportunity' && action.intent === 'exploit');
  return metricOk && intentOk;
}

/** Check Porter alignment: justification is drawn force OR highest force. */
export function checkPorterAlignment(
  justificationForce: PorterForce,
  drawnForce: PorterForce,
  forces: Record<PorterForce, number>,
): boolean {
  if (justificationForce === drawnForce) return true;
  const top = getTopPorterForce(forces);
  return justificationForce === top.force;
}

/** Check VRIO alignment: justification matches activated + action compatible. */
export function checkVrioAlignment(
  justificationVrio: string,
  activatedVrio: string,
  actionId: string,
): boolean {
  if (justificationVrio !== activatedVrio) return false;
  const compat = ACTION_VRIO_COMPAT[actionId] ?? [];
  return compat.includes(activatedVrio);
}

/** Full coherence computation with breakdown. */
export function computeCoherence(
  justifications: {
    pestel: PestelCategory | null;
    porter: PorterForce | null;
    vrio: string | null;
  },
  context: {
    pestelCard: CardPESTEL;
    porterCard: CardPorter;
    activatedVRIO: string;
    affectedMetric: MetricKey;
    interpretation: Interpretation;
    action: Action;
    forces: Record<PorterForce, number>;
  },
): { score: number; breakdown: CoherenceBreakdown } {
  const pestel = checkPestelAlignment(
    context.pestelCard,
    context.affectedMetric,
    context.interpretation,
    context.action,
  );
  const porter = justifications.porter
    ? checkPorterAlignment(justifications.porter, context.porterCard.force, context.forces)
    : false;
  const vrio = justifications.vrio
    ? checkVrioAlignment(justifications.vrio, context.activatedVRIO, context.action.id)
    : false;

  const breakdown: CoherenceBreakdown = { pestel, porter, vrio };
  const score = (pestel ? 1 : 0) + (porter ? 1 : 0) + (vrio ? 1 : 0);
  return { score, breakdown };
}

/* ═══════════════════════════════════════════════════════════
   8. TRAPS — Uses coherence components

   A) PESTEL Shock: intensity strong (≥5) AND pestel alignment = false
   B) Porter Max Pressure: any force at 5 AND porter alignment = false
   C) VRIO Execution Failure: big action AND O=OFF
   ═══════════════════════════════════════════════════════════ */

export interface TrapResult {
  name: string;
  retreat: number;
  metricPenalty: Record<MetricKey, number>;
  mitigatable: boolean;
}

export function checkTraps(
  coherenceBreakdown: CoherenceBreakdown,
  pestelIntensity: number,
  affectedMetric: MetricKey,
  forces: Record<PorterForce, number>,
  action: Action,
  activatedResourceO: boolean,
): TrapResult[] {
  const traps: TrapResult[] = [];

  // Trap A — PESTEL Shock: intensity ≥ 5 AND pestel alignment failed
  if (pestelIntensity >= 5 && !coherenceBreakdown.pestel) {
    const penalty: Record<MetricKey, number> = { cash: 0, share: 0, brand: 0, ops: 0 };
    penalty[affectedMetric] = -5;
    traps.push({
      name: 'Choque PESTEL',
      retreat: 1,
      metricPenalty: penalty,
      mitigatable: activatedResourceO,
    });
  }

  // Trap B — Porter Max Pressure: any force at 5 AND porter alignment failed
  const maxedForces = (Object.entries(forces) as [PorterForce, number][])
    .filter(([, v]) => v >= 5)
    .map(([k]) => k);
  if (maxedForces.length > 0 && !coherenceBreakdown.porter) {
    traps.push({
      name: 'Pressão Máxima Porter',
      retreat: 1,
      metricPenalty: { cash: -3, share: -3, brand: -3, ops: -3 },
      mitigatable: activatedResourceO,
    });
  }

  // Trap C — VRIO Execution Failure: big action + O=OFF
  if (action.isBig && !activatedResourceO) {
    traps.push({
      name: 'Falha de Execução VRIO',
      retreat: 1,
      metricPenalty: { cash: 0, share: 0, brand: 0, ops: 0 },
      mitigatable: false,
    });
  }

  return traps;
}

/** High-level convenience: extracts trap inputs from GameState. */
export function resolveTraps(state: GameState, coherenceBreakdown: CoherenceBreakdown): TrapResult[] {
  const c = state.current;
  const activated = state.vrioResources.find((r) => r.id === c.activatedVRIO);
  return checkTraps(
    coherenceBreakdown,
    c.currentPestelIntensity,
    c.affectedMetric!,
    state.forces,
    c.selectedAction!,
    activated?.O ?? false,
  );
}

/* ═══════════════════════════════════════════════════════════
   9. ACTION EFFECTS  (base + affinity bonuses)
   ═══════════════════════════════════════════════════════════ */

export function computeActionEffects(
  action: Action,
  pestelCategory: PestelCategory,
  forces: Record<PorterForce, number>,
  activatedVRIO: string,
): Record<MetricKey, number> {
  const effects: Record<MetricKey, number> = { ...action.baseEffects };

  for (const aff of action.affinities) {
    let matches = false;
    switch (aff.type) {
      case 'pestel':
        matches = aff.pestelCategory === pestelCategory;
        break;
      case 'porter':
        matches =
          aff.porterForce !== undefined &&
          aff.porterThreshold !== undefined &&
          forces[aff.porterForce] >= aff.porterThreshold;
        break;
      case 'vrio':
        matches = aff.vrioId === activatedVRIO;
        break;
    }
    if (matches) {
      for (const [k, v] of Object.entries(aff.bonus)) {
        effects[k as MetricKey] += v!;
      }
    }
  }

  return effects;
}

/* ═══════════════════════════════════════════════════════════
   10. METRIC EFFECTS
   ═══════════════════════════════════════════════════════════ */

export function computeMetricEffects(
  currentMetrics: Record<MetricKey, number>,
  actionEffects: Record<MetricKey, number>,
  interpretation: Interpretation,
  affectedMetric: MetricKey,
  pestelIntensity: number,
  leverageUsed: boolean,
  traps: TrapResult[],
): { newMetrics: Record<MetricKey, number>; deltas: Record<MetricKey, number> } {
  const deltas: Record<MetricKey, number> = { cash: 0, share: 0, brand: 0, ops: 0 };
  const vrioExecFailure = traps.some((t) => t.name === 'Falha de Execução VRIO');

  // 1. Action effects (already includes affinity bonuses)
  for (const k of METRIC_KEYS) {
    let d = actionEffects[k];
    if (vrioExecFailure) d = Math.trunc(d * 0.5);
    if (leverageUsed && d > 0) d = Math.round(d * 1.3);
    deltas[k] += d;
  }

  // 2. PESTEL impact
  const mult = intensityMultiplier(pestelIntensity);
  deltas[affectedMetric] += interpretation === 'opportunity'
    ? Math.round(5 * mult)
    : Math.round(-5 * mult);

  // 3. Trap penalties
  for (const trap of traps) {
    for (const k of METRIC_KEYS) deltas[k] += trap.metricPenalty[k];
  }

  // 4. Apply + clamp
  const newMetrics = { ...currentMetrics };
  for (const k of METRIC_KEYS) newMetrics[k] = clamp(newMetrics[k] + deltas[k], 0, 100);

  return { newMetrics, deltas };
}

/* ═══════════════════════════════════════════════════════════
   11. BOARD MOVEMENT
   ═══════════════════════════════════════════════════════════ */

export function computeMovement(
  coherence: number,
  traps: TrapResult[],
  mitigatedTraps: string[],
): number {
  const base = 1;
  const bonus = coherence >= 2 ? 1 : 0;
  const retreat = traps.reduce(
    (sum, t) => (mitigatedTraps.includes(t.name) ? sum : sum + t.retreat),
    0,
  );
  return base + bonus - retreat;
}

/* ═══════════════════════════════════════════════════════════
   12. FULL ROUND RESOLUTION  (pure)
   ═══════════════════════════════════════════════════════════ */

export function resolveRound(state: GameState): ResolvePayload {
  const c = state.current;
  const pestelCard = c.currentPestelCard!;
  const porterCard = c.currentPorterCard!;
  const action = c.selectedAction!;
  const activated = state.vrioResources.find((r) => r.id === c.activatedVRIO)!;

  const { score: coherence, breakdown: coherenceBreakdown } = computeCoherence(
    c.justifications,
    {
      pestelCard,
      porterCard,
      activatedVRIO: c.activatedVRIO!,
      affectedMetric: c.affectedMetric!,
      interpretation: c.pestelInterpretation!,
      action,
      forces: state.forces,
    },
  );

  const traps = resolveTraps(state, coherenceBreakdown);

  const actionEffects = computeActionEffects(
    action,
    pestelCard.category,
    state.forces,
    c.activatedVRIO!,
  );

  const { newMetrics, deltas } = computeMetricEffects(
    state.metrics,
    actionEffects,
    c.pestelInterpretation!,
    c.affectedMetric!,
    c.currentPestelIntensity,
    c.usedLeverageThisRound,
    traps,
  );

  const movement = computeMovement(coherence, traps, c.mitigatedTraps);
  const newPosition = clamp(state.boardPosition + movement, 0, boardMaxPosition(state.totalRounds));
  const tokensGained = computeRoundTokens(activated);

  // 0-100 scoring
  const topForce = getTopPorterForce(state.forces);
  const scoreCtx: ActionUtilityContext = {
    pestelCard,
    interpretation: c.pestelInterpretation!,
    affectedMetric: c.affectedMetric!,
    pestelIntensity: c.currentPestelIntensity,
    criticalForce: topForce.force,
    criticalForceLevel: topForce.value,
    forces: state.forces,
    activatedVRIO: c.activatedVRIO!,
    activatedResourceO: activated.O,
  };
  const roundScore = computeRoundScore(action, c.availableActions, scoreCtx, coherence);

  return {
    coherence,
    coherenceBreakdown,
    newForces: state.forces,
    newMetrics,
    metricDeltas: deltas,
    newPosition,
    movement,
    trapsTriggered: traps.map((t) => t.name),
    trapsMitigated: [...c.mitigatedTraps],
    leverageUsed: c.usedLeverageThisRound,
    tokensGained,
    roundScore,
  };
}

/* ═══════════════════════════════════════════════════════════
   13. ADVANCE ROUND  (pure state → state)
   ═══════════════════════════════════════════════════════════ */

export function advanceRound(state: GameState): GameState {
  if (state.currentRound >= state.totalRounds) {
    return {
      ...state,
      phase: 'final-decision',
      current: { ...INITIAL_ROUND_STATE },
    };
  }
  return {
    ...state,
    currentRound: state.currentRound + 1,
    roundPhase: 'pestel-draw',
    current: { ...INITIAL_ROUND_STATE },
  };
}

/* ═══════════════════════════════════════════════════════════
   14. TOKEN ECONOMICS
   ═══════════════════════════════════════════════════════════ */

export function computeInitialTokens(resources: ResourceVRIO[]): {
  leverage: number;
  resilience: number;
} {
  let leverage = 0;
  let resilience = 0;
  for (const r of resources) {
    if (r.selected) {
      if (r.V && r.R) leverage++;
      if (r.I && r.O) resilience++;
    }
  }
  return { leverage, resilience };
}

export function computeRoundTokens(resource: ResourceVRIO): {
  leverage: number;
  resilience: number;
} {
  return {
    leverage: resource.V && resource.R ? 1 : 0,
    resilience: resource.I && resource.O ? 1 : 0,
  };
}

/* ═══════════════════════════════════════════════════════════
   15. ACTION SELECTION  (deterministic)
   ═══════════════════════════════════════════════════════════ */

export function selectActions(
  round: number,
  pestelCategory: PestelCategory,
  porterForce: PorterForce,
  forces: Record<PorterForce, number>,
  activatedVRIO: string,
): Action[] {
  const poolLen = ACTION_POOL.length;

  const scored = ACTION_POOL.map((a, idx) => {
    let score = 0;
    for (const aff of a.affinities) {
      switch (aff.type) {
        case 'pestel':
          if (aff.pestelCategory === pestelCategory) score += 2;
          break;
        case 'porter':
          if (aff.porterForce === porterForce) score += 2;
          if (
            aff.porterForce !== undefined &&
            aff.porterThreshold !== undefined &&
            forces[aff.porterForce] >= aff.porterThreshold
          )
            score += 1;
          break;
        case 'vrio':
          if (aff.vrioId === activatedVRIO) score += 2;
          break;
      }
    }
    return { action: a, score, idx };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return ((a.idx + round) % poolLen) - ((b.idx + round) % poolLen);
  });

  const pickIndices = [0, Math.min(3, poolLen - 2), Math.min(7, poolLen - 1)];
  const seen = new Set<string>();
  const picks: Action[] = [];

  for (const pi of pickIndices) {
    const a = scored[pi].action;
    if (!seen.has(a.id)) {
      seen.add(a.id);
      picks.push(a);
    }
  }
  for (const s of scored) {
    if (picks.length >= 3) break;
    if (!seen.has(s.action.id)) {
      seen.add(s.action.id);
      picks.push(s.action);
    }
  }

  return picks.slice(0, 3);
}

/* ═══════════════════════════════════════════════════════════
   16. STARTING METRICS
   ═══════════════════════════════════════════════════════════ */

export function computeStartingMetrics(
  choices: { value: string; scene: number }[],
): Record<MetricKey, number> {
  const m = { cash: 60, share: 40, brand: 50, ops: 50 };
  for (const c of choices) {
    if (c.scene === 2) {
      switch (c.value) {
        case 'leader':     m.brand += 15; m.share += 10; m.ops += 5; m.cash -= 5; break;
        case 'challenger': m.share += 10; m.cash -= 10; m.brand += 5; break;
        case 'niche':      m.ops += 15; m.brand += 5; m.share -= 10; m.cash += 5; break;
      }
    }
    if (c.scene === 3) {
      switch (c.value) {
        case 'growth':     m.share += 5; m.cash -= 10; break;
        case 'stability':  m.ops += 10; m.cash += 5; break;
        case 'innovation': m.brand += 5; m.ops -= 5; break;
      }
    }
  }
  return {
    cash: clamp(m.cash, 0, 100), share: clamp(m.share, 0, 100),
    brand: clamp(m.brand, 0, 100), ops: clamp(m.ops, 0, 100),
  };
}

/* ═══════════════════════════════════════════════════════════
   17. VRIO ASSESSMENT
   ═══════════════════════════════════════════════════════════ */

export function vrioLabel(r: { V: boolean; R: boolean; I: boolean; O: boolean }): string {
  if (r.V && r.R && r.I && r.O) return 'Vantagem Competitiva Sustentada';
  if (r.V && r.R && r.I) return 'Vantagem Inexplorada';
  if (r.V && r.R) return 'Vantagem Temporária';
  if (r.V) return 'Paridade Competitiva';
  return 'Desvantagem Competitiva';
}

export function vrioLabelColor(r: { V: boolean; R: boolean; I: boolean; O: boolean }): string {
  if (r.V && r.R && r.I && r.O) return 'text-emerald-400';
  if (r.V && r.R && r.I) return 'text-yellow-400';
  if (r.V && r.R) return 'text-orange-400';
  if (r.V) return 'text-slate-400';
  return 'text-red-400';
}

/** VRIO strength score for ranking (4 = V+R+I+O, 3 = V+R+I, etc). */
export function vrioStrength(r: { V: boolean; R: boolean; I: boolean; O: boolean }): number {
  if (r.V && r.R && r.I && r.O) return 4;
  if (r.V && r.R && r.I) return 3;
  if (r.V && r.R) return 2;
  if (r.V) return 1;
  return 0;
}

/* ═══════════════════════════════════════════════════════════
   18. FINAL RATING — percentile-based

   Primary rule: position as percentage of max possible.
   Max board = boardMaxPosition(totalRounds). Best per round = +2.
   - Excellent = position >= 75% of max reachable
   - Good = position >= 50%
   - Risky = below 50%
   ═══════════════════════════════════════════════════════════ */

export function finalRating(position: number, totalRounds = 6): { label: string; color: string } {
  const maxPos = boardMaxPosition(totalRounds);
  const pct = maxPos > 0 ? position / maxPos : 0;
  if (pct >= 0.75) return { label: 'Excelente', color: 'text-emerald-400' };
  if (pct >= 0.50) return { label: 'Bom', color: 'text-blue-400' };
  return { label: 'Arriscado', color: 'text-red-400' };
}

/* ═══════════════════════════════════════════════════════════
   19. PERFECT-STRATEGY SCORING (0–100)

   Computes per-round and final scores measuring how optimal
   the player's action choice was given the realized context.
   100 = best available action; score is context-relative and
   never penalized by bad luck (card draws).
   ═══════════════════════════════════════════════════════════ */

const METRIC_CAP = 15;

const PORTER_WEIGHT_BOOSTS: Record<PorterForce, Partial<Record<MetricKey, number>>> = {
  substitutes:  { share: 0.10, brand: 0.10 },
  buyers:       { cash: 0.15, brand: 0.05 },
  suppliers:    { cash: 0.15, ops: 0.05 },
  rivalry:      { share: 0.10, cash: 0.10 },
  newEntrants:  { share: 0.10, brand: 0.10 },
};

const COHERENCE_MULTIPLIER: Record<number, number> = {
  3: 1.00,
  2: 0.95,
  1: 0.85,
  0: 0.75,
};

/** Compute context-sensitive metric weights for a round (sum = 1). */
export function computeContextWeights(
  affectedMetric: MetricKey,
  criticalForce: PorterForce,
): Record<MetricKey, number> {
  const keys: MetricKey[] = ['cash', 'share', 'brand', 'ops'];
  const w: Record<MetricKey, number> = { cash: 0.25, share: 0.25, brand: 0.25, ops: 0.25 };

  // PESTEL adjustment: +0.20 to target metric, -0.20/3 from others
  const pestelBoost = 0.20;
  w[affectedMetric] += pestelBoost;
  const otherPestel = keys.filter((k) => k !== affectedMetric);
  for (const k of otherPestel) w[k] -= pestelBoost / 3;

  // Porter adjustment: boost specific metrics, subtract proportionally from non-boosted
  const porterBoosts = PORTER_WEIGHT_BOOSTS[criticalForce];
  const boostedKeys = Object.keys(porterBoosts) as MetricKey[];
  const nonBoosted = keys.filter((k) => !boostedKeys.includes(k));
  const totalPorterBoost = Object.values(porterBoosts).reduce((s, v) => s + v, 0);
  for (const k of boostedKeys) w[k] += porterBoosts[k]!;
  if (nonBoosted.length > 0) {
    const perKey = totalPorterBoost / nonBoosted.length;
    for (const k of nonBoosted) w[k] -= perKey;
  }

  // Normalize to sum = 1 (guard against floating-point drift)
  const total = keys.reduce((s, k) => s + w[k], 0);
  if (total > 0) for (const k of keys) w[k] /= total;

  return w;
}

/** Context object for action utility computation. */
export interface ActionUtilityContext {
  pestelCard: CardPESTEL;
  interpretation: Interpretation;
  affectedMetric: MetricKey;
  pestelIntensity: number;
  criticalForce: PorterForce;
  criticalForceLevel: number;
  forces: Record<PorterForce, number>;
  activatedVRIO: string;
  activatedResourceO: boolean;
}

/** Compute utility for a single action given context. Returns utility + penalty breakdown. */
export function computeActionUtility(
  action: Action,
  weights: Record<MetricKey, number>,
  ctx: ActionUtilityContext,
): { utility: number; penalties: { name: string; value: number }[] } {
  const keys: MetricKey[] = ['cash', 'share', 'brand', 'ops'];
  const penalties: { name: string; value: number }[] = [];

  // Compute actual metric deltas (base + affinities)
  const effects = computeActionEffects(action, ctx.pestelCard.category, ctx.forces, ctx.activatedVRIO);

  // Base utility = weighted normalized deltas
  let utilityBase = 0;
  for (const k of keys) {
    const normalized = clamp(effects[k] / METRIC_CAP, -1, 1);
    utilityBase += weights[k] * normalized;
  }

  // A) Porter: action addresses critical force?
  const addressesCritical = action.affinities.some(
    (aff) => aff.type === 'porter' && aff.porterForce === ctx.criticalForce,
  );
  if (addressesCritical) {
    penalties.push({ name: 'Endereça força crítica', value: 0.18 });
  } else if (ctx.criticalForceLevel >= 5) {
    penalties.push({ name: `Não endereça ${PORTER_LABELS_INTERNAL[ctx.criticalForce]} a 5/5`, value: -0.25 });
  } else if (ctx.criticalForceLevel >= 4) {
    penalties.push({ name: `Não endereça ${PORTER_LABELS_INTERNAL[ctx.criticalForce]} a ${ctx.criticalForceLevel}/5`, value: -0.18 });
  }

  // B) VRIO execution feasibility
  const vrioCompat = ACTION_VRIO_COMPAT[action.id] ?? [];
  const vrioMatch = vrioCompat.includes(ctx.activatedVRIO);
  if (action.isBig && !ctx.activatedResourceO) {
    penalties.push({ name: 'Ação BIG com O=OFF', value: -0.30 });
  } else if (action.isBig && ctx.activatedResourceO) {
    penalties.push({ name: 'Ação BIG com O=ON', value: 0.08 });
  }
  if (vrioMatch) {
    penalties.push({ name: 'VRIO compatível com ação', value: 0.10 });
  } else {
    penalties.push({ name: 'VRIO não compatível com ação', value: -0.08 });
  }

  // C) PESTEL intensity risk
  const pestelAligned = checkPestelAlignment(
    ctx.pestelCard,
    ctx.affectedMetric,
    ctx.interpretation,
    action,
  );
  if (ctx.pestelIntensity >= 5 && !pestelAligned) {
    penalties.push({ name: 'Choque PESTEL forte não alinhado', value: -0.20 });
  } else if (ctx.pestelIntensity >= 5 && pestelAligned) {
    penalties.push({ name: 'PESTEL forte alinhado', value: 0.06 });
  }

  // D) Trap risk
  const maxedForces = (Object.entries(ctx.forces) as [PorterForce, number][])
    .filter(([, v]) => v >= 5);
  // PESTEL shock trap
  if (ctx.pestelIntensity >= 5 && !pestelAligned) {
    penalties.push({ name: 'Armadilha: Choque PESTEL', value: -0.20 });
  }
  // Porter max trap (assume optimal justification for this action)
  // Porter alignment succeeds if drawn force matches critical or top —
  // for utility we assess action quality, not justification, so we check
  // whether the action at least has a porter affinity matching the drawn force
  if (maxedForces.length > 0) {
    const hasPorterAffinity = action.affinities.some(
      (aff) => aff.type === 'porter' && maxedForces.some(([f]) => aff.porterForce === f),
    );
    if (!hasPorterAffinity) {
      // Player could still justify with drawn/top force, but the action itself doesn't help
      // Small penalty signal
    }
  }
  // VRIO execution trap
  if (action.isBig && !ctx.activatedResourceO) {
    // Already penalized in B), avoid double count
  }

  const totalPenalty = penalties.reduce((s, p) => s + p.value, 0);
  const utility = clamp(utilityBase + totalPenalty, -1, 1);

  return { utility, penalties };
}

/** Compute round score (0-100) for the chosen action among all available actions. */
export function computeRoundScore(
  chosenAction: Action,
  allActions: Action[],
  ctx: ActionUtilityContext,
  coherence: number,
): RoundScoreResult {
  const weights = computeContextWeights(ctx.affectedMetric, ctx.criticalForce);

  const results = allActions.map((a) => ({
    action: a,
    ...computeActionUtility(a, weights, ctx),
  }));

  const chosenResult = results.find((r) => r.action.id === chosenAction.id)!;
  const best = Math.max(...results.map((r) => r.utility));
  const worst = Math.min(...results.map((r) => r.utility));

  let roundScoreRaw: number;
  if (best === worst) {
    roundScoreRaw = 100;
  } else {
    roundScoreRaw = 100 * (chosenResult.utility - worst) / (best - worst);
  }
  roundScoreRaw = clamp(Math.round(roundScoreRaw), 0, 100);

  const multiplier = COHERENCE_MULTIPLIER[clamp(coherence, 0, 3)] ?? 0.75;
  const roundScoreFinal = clamp(Math.round(roundScoreRaw * multiplier), 0, 100);

  // Build missed points explanation (top negative penalties)
  const negativePenalties = chosenResult.penalties
    .filter((p) => p.value < 0)
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);
  const missedPoints: string[] = [];
  for (const p of negativePenalties) {
    missedPoints.push(p.name);
  }
  if (coherence < 3) {
    missedPoints.push(`Coerência ${coherence}/3 (multiplicador ×${(multiplier * 100).toFixed(0)}%)`);
  }

  return {
    roundScoreRaw,
    roundScoreFinal,
    utilityChosen: chosenResult.utility,
    utilityBest: best,
    utilityWorst: worst,
    missedPoints,
  };
}

/** Compute projected score for a single action (before execution, assumes optimal coherence). */
export function computeProjectedScore(
  action: Action,
  allActions: Action[],
  ctx: ActionUtilityContext,
): number {
  const weights = computeContextWeights(ctx.affectedMetric, ctx.criticalForce);
  const results = allActions.map((a) => computeActionUtility(a, weights, ctx));
  const chosenIdx = allActions.findIndex((a) => a.id === action.id);
  const chosenUtility = results[chosenIdx].utility;
  const best = Math.max(...results.map((r) => r.utility));
  const worst = Math.min(...results.map((r) => r.utility));
  if (best === worst) return 100;
  return clamp(Math.round(100 * (chosenUtility - worst) / (best - worst)), 0, 100);
}

/** Compute final game score: average of all round scores. */
export function computeFinalScore(roundHistory: { roundScore: RoundScoreResult }[]): number {
  if (roundHistory.length === 0) return 0;
  const sum = roundHistory.reduce((s, r) => s + r.roundScore.roundScoreFinal, 0);
  return Math.round(sum / roundHistory.length);
}

// Internal Portuguese labels for penalty messages (avoid circular import)
const PORTER_LABELS_INTERNAL: Record<PorterForce, string> = {
  newEntrants: 'Novos Concorrentes',
  suppliers: 'Fornecedores',
  buyers: 'Compradores',
  substitutes: 'Substitutos',
  rivalry: 'Rivalidade',
};

/* ═══════════════════════════════════════════════════════════
   20. AUTO-GENERATE BOARD MEMO (FinalDecision)

   Deterministic rules for each field:
   - dominantPestel: top 2 by intensity (strong>medium>weak),
     tiebreak by absolute metric delta sum
   - criticalForce: highest force meter
   - keyResources: top 2 by vrioStrength
   - nextAction: action from pool with best affinity score
     for final context (most-freq PESTEL, highest force, best VRIO)
   ═══════════════════════════════════════════════════════════ */

export function autoGenerateMemo(state: GameState): Omit<FinalDecision, 'rationale' | 'edited'> {
  const { roundHistory, forces, vrioResources } = state;
  const selectedResources = vrioResources.filter((r) => r.selected);

  // 1. Dominant PESTEL: rank rounds by intensity, pick top 2 unique categories
  const roundsByIntensity = [...roundHistory].sort((a, b) => {
    if (b.pestelIntensity !== a.pestelIntensity) return b.pestelIntensity - a.pestelIntensity;
    const aDelta = METRIC_KEYS.reduce((s, k) => s + Math.abs(a.metricDeltas[k]), 0);
    const bDelta = METRIC_KEYS.reduce((s, k) => s + Math.abs(b.metricDeltas[k]), 0);
    return bDelta - aDelta;
  });
  const seenCats = new Set<PestelCategory>();
  const dominantPestel: PestelCategory[] = [];
  for (const r of roundsByIntensity) {
    if (!seenCats.has(r.pestelCard.category)) {
      seenCats.add(r.pestelCard.category);
      dominantPestel.push(r.pestelCard.category);
      if (dominantPestel.length >= 2) break;
    }
  }
  // Fallback: fill from all categories if not enough rounds
  const allCats: PestelCategory[] = ['P', 'E', 'S', 'T', 'Ec', 'L'];
  for (const c of allCats) {
    if (dominantPestel.length >= 2) break;
    if (!seenCats.has(c)) dominantPestel.push(c);
  }

  // 2. Critical force: highest meter
  const topForce = getTopPorterForce(forces);

  // 3. Key VRIO: top 2 by strength, tiebreak by activation frequency
  const activationCount: Record<string, number> = {};
  for (const r of roundHistory) {
    activationCount[r.activatedVRIO] = (activationCount[r.activatedVRIO] || 0) + 1;
  }
  const rankedResources = [...selectedResources].sort((a, b) => {
    const sa = vrioStrength(a);
    const sb = vrioStrength(b);
    if (sb !== sa) return sb - sa;
    return (activationCount[b.id] || 0) - (activationCount[a.id] || 0);
  });
  const keyResources = rankedResources.slice(0, 2).map((r) => r.id);
  // Fallback if less than 2
  while (keyResources.length < 2 && selectedResources.length > keyResources.length) {
    const next = selectedResources.find((r) => !keyResources.includes(r.id));
    if (next) keyResources.push(next.id);
    else break;
  }

  // 4. Recommended next action: best affinity score for current context
  //    Uses most frequent PESTEL category, highest force, and best VRIO resource
  const mostFreqPestel = dominantPestel[0] || 'P';
  const bestVrio = keyResources[0] || (selectedResources[0]?.id ?? '');
  const actionScores = ACTION_POOL.map((a) => {
    let score = 0;
    for (const aff of a.affinities) {
      if (aff.type === 'pestel' && aff.pestelCategory === mostFreqPestel) score += 2;
      if (aff.type === 'porter' && aff.porterForce === topForce.force) score += 2;
      if (aff.type === 'vrio' && aff.vrioId === bestVrio) score += 2;
    }
    return { id: a.id, score };
  });
  actionScores.sort((a, b) => b.score - a.score);
  const nextActionId = actionScores[0]?.id ?? ACTION_POOL[0].id;

  return {
    dominantPestel: [dominantPestel[0], dominantPestel[1]] as [PestelCategory, PestelCategory],
    criticalForce: topForce.force,
    keyResources: [keyResources[0], keyResources[1]] as [string, string],
    nextActionId,
  };
}
