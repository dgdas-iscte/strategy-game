import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GameState, Dispatch } from './types';
import {
  INITIAL_ROUND_STATE,
  applyPESTELEvent,
  applyPorterShift,
  advanceRound,
  computeStartingMetrics,
  computeInitialTokens,
  shuffleDeck,
} from './utils';
import { VRIO_TEMPLATES, PESTEL_CARDS, PORTER_CARDS } from './data';

/* ═══ Constants ═══ */

const SAVE_KEY = 'strategy-game-save';
const SAVE_VERSION = 2;

const initialState: GameState = {
  saveVersion: SAVE_VERSION,
  phase: 'home',
  roundPhase: 'pestel-draw',
  currentRound: 1,
  totalRounds: 6,
  companyName: 'NexaCorp',
  _returnPhase: null,
  prologueChoices: [],
  vrioResources: VRIO_TEMPLATES.map((r) => ({ ...r })),
  vrioBaseline: VRIO_TEMPLATES.map((r) => ({ ...r })),
  vrioAdjustedIds: [],
  boardPosition: 0,
  metrics: { cash: 60, share: 40, brand: 50, ops: 50 },
  forces: { newEntrants: 2, suppliers: 2, buyers: 2, substitutes: 2, rivalry: 3 },
  leverageTokens: 0,
  resilienceTokens: 0,
  current: { ...INITIAL_ROUND_STATE },
  roundHistory: [],
  pestelDeck: [],
  porterDeck: [],
  pestelDiscard: [],
  porterDiscard: [],
  finalDecision: null,
};

/* ═══ Helpers ═══ */

/** Reshuffle discard pile back into deck when deck is empty. */
function reshuffleIfEmpty<T>(deck: T[], discard: T[]): { deck: T[]; discard: T[] } {
  if (deck.length > 0) return { deck, discard };
  return { deck: shuffleDeck(discard), discard: [] };
}

/* ═══ Reducer ═══ */

function gameReducer(state: GameState, action: Dispatch): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const rounds = action.totalRounds ?? 6;
      return {
        ...initialState,
        saveVersion: SAVE_VERSION,
        totalRounds: rounds,
        phase: 'prologue',
        vrioResources: VRIO_TEMPLATES.map((r) => ({ ...r })),
        vrioBaseline: VRIO_TEMPLATES.map((r) => ({ ...r })),
        vrioAdjustedIds: [],
        pestelDeck: shuffleDeck(PESTEL_CARDS),
        porterDeck: shuffleDeck(PORTER_CARDS),
        pestelDiscard: [],
        porterDiscard: [],
      };
    }

    case 'SET_PROLOGUE': {
      const choices = state.prologueChoices.filter((c) => c.scene !== action.scene);
      choices.push({
        scene: action.scene,
        question: action.question,
        answer: action.answer,
        value: action.value,
      });
      return { ...state, prologueChoices: choices };
    }

    case 'FINISH_PROLOGUE':
      return {
        ...state,
        phase: 'vrio-audit',
        metrics: computeStartingMetrics(state.prologueChoices),
      };

    case 'TOGGLE_RESOURCE': {
      const target = state.vrioResources.find((r) => r.id === action.id);
      if (!target) return state;
      const selectedCount = state.vrioResources.filter((r) => r.selected).length;
      if (!target.selected && selectedCount >= 4) return state;
      // Track as adjusted if selection differs from baseline
      const baselineRes = state.vrioBaseline.find((r) => r.id === action.id);
      const newSelected = !target.selected;
      const wasBaselineSelected = baselineRes?.selected ?? false;
      const selectionDiffers = newSelected !== wasBaselineSelected;
      let newAdjustedIds = [...state.vrioAdjustedIds];
      if (selectionDiffers && !newAdjustedIds.includes(action.id)) {
        if (newAdjustedIds.length >= 2) return state; // max 2 adjustments
        newAdjustedIds.push(action.id);
      } else if (!selectionDiffers) {
        // Check if flags also match baseline — if so, remove from adjusted
        const flagsSame = baselineRes && target.V === baselineRes.V && target.R === baselineRes.R && target.I === baselineRes.I && target.O === baselineRes.O;
        if (flagsSame) {
          newAdjustedIds = newAdjustedIds.filter((id) => id !== action.id);
        }
      }
      return {
        ...state,
        vrioAdjustedIds: newAdjustedIds,
        vrioResources: state.vrioResources.map((r) =>
          r.id === action.id ? { ...r, selected: newSelected } : r,
        ),
      };
    }

    case 'TOGGLE_FLAG': {
      const flagTarget = state.vrioResources.find((r) => r.id === action.id);
      if (!flagTarget) return state;
      const baselineFlag = state.vrioBaseline.find((r) => r.id === action.id);
      const newFlagVal = !flagTarget[action.flag];
      // Build what the resource will look like after the toggle
      const afterToggle = { ...flagTarget, [action.flag]: newFlagVal };
      // Check if this resource now differs from baseline
      const flagsDiffer = baselineFlag && (
        afterToggle.V !== baselineFlag.V ||
        afterToggle.R !== baselineFlag.R ||
        afterToggle.I !== baselineFlag.I ||
        afterToggle.O !== baselineFlag.O ||
        afterToggle.selected !== baselineFlag.selected
      );
      let newFlagAdjusted = [...state.vrioAdjustedIds];
      if (flagsDiffer && !newFlagAdjusted.includes(action.id)) {
        if (newFlagAdjusted.length >= 2) return state; // max 2 adjustments
        newFlagAdjusted.push(action.id);
      } else if (!flagsDiffer) {
        newFlagAdjusted = newFlagAdjusted.filter((id) => id !== action.id);
      }
      return {
        ...state,
        vrioAdjustedIds: newFlagAdjusted,
        vrioResources: state.vrioResources.map((r) =>
          r.id === action.id ? { ...r, [action.flag]: newFlagVal } : r,
        ),
      };
    }

    case 'CONFIRM_VRIO_BASELINE':
      // Accept baseline as-is, go straight to FINISH_AUDIT logic
      return gameReducer(state, { type: 'FINISH_AUDIT' });

    case 'REVERT_VRIO_RESOURCE': {
      const base = state.vrioBaseline.find((r) => r.id === action.id);
      if (!base) return state;
      return {
        ...state,
        vrioAdjustedIds: state.vrioAdjustedIds.filter((id) => id !== action.id),
        vrioResources: state.vrioResources.map((r) =>
          r.id === action.id ? { ...base } : r,
        ),
      };
    }

    case 'RESET_VRIO_BASELINE':
      return {
        ...state,
        vrioAdjustedIds: [],
        vrioResources: state.vrioBaseline.map((r) => ({ ...r })),
      };

    case 'FINISH_AUDIT': {
      const tokens = computeInitialTokens(state.vrioResources);
      return {
        ...state,
        phase: 'round',
        roundPhase: 'pestel-draw',
        currentRound: 1,
        leverageTokens: tokens.leverage,
        resilienceTokens: tokens.resilience,
        current: { ...INITIAL_ROUND_STATE },
        pestelDeck: shuffleDeck(PESTEL_CARDS),
        porterDeck: shuffleDeck(PORTER_CARDS),
        pestelDiscard: [],
        porterDiscard: [],
      };
    }

    /* ─── PESTEL: draw from deck, then interpret ─── */

    case 'DRAW_PESTEL': {
      // Reshuffle discards if deck exhausted
      const { deck: pDeck, discard: pDiscard } = reshuffleIfEmpty(
        state.pestelDeck, state.pestelDiscard,
      );
      const [card, ...rest] = pDeck;
      if (!card) return state;
      return {
        ...state,
        roundPhase: 'pestel-interpret',
        pestelDeck: rest,
        pestelDiscard: [...pDiscard, card],
        current: {
          ...state.current,
          currentPestelCard: card,
          currentPestelIntensity: action.intensity,
        },
      };
    }

    case 'INTERPRET_PESTEL':
      return applyPESTELEvent(
        state,
        state.current.currentPestelCard!,
        state.current.currentPestelIntensity,
        action.interpretation,
        action.metric,
      );

    /* ─── PORTER: draw from deck + force shift ─── */

    case 'DRAW_PORTER': {
      const { deck: pDeck, discard: pDiscard } = reshuffleIfEmpty(
        state.porterDeck, state.porterDiscard,
      );
      const [card, ...rest] = pDeck;
      if (!card) return state;
      const s = {
        ...state,
        porterDeck: rest,
        porterDiscard: [...pDiscard, card],
      };
      return applyPorterShift(s, card, action.intensity);
    }

    /* ─── VRIO ─── */

    case 'ACTIVATE_VRIO':
      return {
        ...state,
        roundPhase: 'action-choose',
        current: { ...state.current, activatedVRIO: action.id },
      };

    case 'SET_ACTIONS':
      return {
        ...state,
        current: { ...state.current, availableActions: action.actions },
      };

    case 'SELECT_ACTION':
      return {
        ...state,
        roundPhase: 'resolve',
        current: {
          ...state.current,
          selectedAction: action.action,
          justifications: action.justifications,
        },
      };

    /* ─── Token spending (interactive during resolve) ─── */

    case 'USE_LEVERAGE':
      if (state.leverageTokens < 1 || state.current.usedLeverageThisRound) return state;
      return {
        ...state,
        leverageTokens: state.leverageTokens - 1,
        current: { ...state.current, usedLeverageThisRound: true },
      };

    case 'USE_RESILIENCE': {
      if (state.resilienceTokens < 1) return state;
      if (state.current.mitigatedTraps.includes(action.trapName)) return state;
      return {
        ...state,
        resilienceTokens: state.resilienceTokens - 1,
        current: {
          ...state.current,
          mitigatedTraps: [...state.current.mitigatedTraps, action.trapName],
        },
      };
    }

    /* ─── Resolution: commit computed payload, then advance ─── */

    case 'COMMIT_RESOLVE': {
      const { payload } = action;
      const c = state.current;
      const log = {
        round: state.currentRound,
        pestelCard: c.currentPestelCard!,
        pestelIntensity: c.currentPestelIntensity,
        interpretation: c.pestelInterpretation!,
        affectedMetric: c.affectedMetric!,
        porterCard: c.currentPorterCard!,
        porterIntensity: c.currentPorterIntensity,
        activatedVRIO: c.activatedVRIO!,
        selectedAction: c.selectedAction!,
        justifications: {
          pestel: c.justifications.pestel!,
          porter: c.justifications.porter!,
          vrio: c.justifications.vrio!,
        },
        coherenceScore: payload.coherence,
        coherenceBreakdown: payload.coherenceBreakdown,
        trapsTriggered: payload.trapsTriggered,
        trapsMitigated: payload.trapsMitigated,
        leverageUsed: payload.leverageUsed,
        metricDeltas: payload.metricDeltas,
        metricsAfter: payload.newMetrics,
        forcesAfter: payload.newForces,
        movement: payload.movement,
        boardPositionAfter: payload.newPosition,
        tokensGained: payload.tokensGained,
        roundScore: payload.roundScore,
      };
      return {
        ...state,
        metrics: payload.newMetrics,
        forces: payload.newForces,
        boardPosition: payload.newPosition,
        leverageTokens: state.leverageTokens + payload.tokensGained.leverage,
        resilienceTokens: state.resilienceTokens + payload.tokensGained.resilience,
        roundHistory: [...state.roundHistory, log],
      };
    }

    case 'NEXT_ROUND':
      return advanceRound(state);

    case 'SET_FINAL':
      return { ...state, finalDecision: action.decision };

    case 'GO_REPORT':
      return { ...state, phase: 'report' };

    /* ─── Navigation ─── */

    case 'GO_HOME':
      return { ...state, phase: 'home', _returnPhase: state.phase };

    case 'CONTINUE_GAME': {
      if (!state._returnPhase || state._returnPhase === 'home') return state;
      return { ...state, phase: state._returnPhase, _returnPhase: null };
    }

    case 'RESET':
      localStorage.removeItem(SAVE_KEY);
      return {
        ...initialState,
        vrioResources: VRIO_TEMPLATES.map((r) => ({ ...r })),
        vrioBaseline: VRIO_TEMPLATES.map((r) => ({ ...r })),
        vrioAdjustedIds: [],
      };

    default:
      return state;
  }
}

/* ═══ Load from localStorage with migration ═══ */

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      if (parsed.phase && parsed.metrics) {
        // Migrate from v1 (no saveVersion) to v2
        // Migrate roundHistory entries without roundScore (pre-v3)
        const defaultScore = { roundScoreRaw: 0, roundScoreFinal: 0, utilityChosen: 0, utilityBest: 0, utilityWorst: 0, missedPoints: [] as string[] };
        const migratedHistory = (parsed.roundHistory ?? []).map((r) => ({
          ...r,
          roundScore: (r as any).roundScore ?? defaultScore,
        }));
        const migrated: GameState = {
          ...initialState,
          ...parsed,
          saveVersion: SAVE_VERSION,
          totalRounds: parsed.totalRounds ?? 6,
          _returnPhase: parsed._returnPhase ?? null,
          vrioBaseline: parsed.vrioBaseline ?? VRIO_TEMPLATES.map((r) => ({ ...r })),
          vrioAdjustedIds: parsed.vrioAdjustedIds ?? [],
          roundHistory: migratedHistory,
        };
        return migrated;
      }
    }
  } catch {
    /* corrupt save — fall through */
  }
  return { ...initialState, vrioResources: VRIO_TEMPLATES.map((r) => ({ ...r })), vrioBaseline: VRIO_TEMPLATES.map((r) => ({ ...r })), vrioAdjustedIds: [] };
}

/* ═══ Context ═══ */

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Dispatch>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
