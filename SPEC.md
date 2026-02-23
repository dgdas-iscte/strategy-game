# Strategy Arena — Game Design & Functional Specification

> Version 2.0 — Authoritative spec for the rewrite.
> Frameworks in scope: **PESTEL**, **Porter's Five Forces**, **VRIO**. Nothing else.

---

## 0. Glossary

| Term | Meaning |
|---|---|
| **Intensity die** | d6 roll. 1-2 = Weak (×0.5), 3-4 = Medium (×1.0), 5-6 = Strong (×1.5). |
| **Coherence** | 0..3 score measuring how well the player's justifications match the round's actual cards/resource. |
| **Leverage token (A)** | Spent to amplify positive action effects by +30 %. |
| **Resilience token (R)** | Spent to cancel one retreat from a mitigatable trap. Requires activated resource O=ON. |
| **Big action** | An action marked `isBig: true`. Triggers VRIO Execution Failure trap if activated resource has O=OFF. |
| **Board** | Linear 14-node path (indices 0–13). Node 0 = Start, Node 13 = Finish. |

---

## 1. Screens & UX Flow

```
Home ──▶ Prologue (3 scenes) ──▶ VRIO Audit ──▶ Round × 6 ──▶ Final Decision Room ──▶ Report
 ▲                                                                                      │
 └──────────────────────────── "New Game" button ◄──────────────────────────────────────┘
```

### 1.1 Home Screen

| Element | Behaviour |
|---|---|
| Title + tagline | Static. Gradient text "Strategy Arena". |
| Three decorative deck-back cards | Idle hover float. Labels: PESTEL, Five Forces, VRIO. |
| **"New Game"** button | Dispatches `START_GAME`, transitions to Prologue. |
| **"Continue"** button | Visible only when `localStorage` contains a save whose `phase !== 'home'`. Navigates directly to the saved phase. Reads already-hydrated state — no dispatch needed. |
| Footer | "Executive Strategy Class — Offline Single-Page Game". |

### 1.2 Prologue Screen (3 scenes)

Three sequential choose-one scenes. Progress bar at top (3 segments).

| Scene | Question | Options (label / value) | Narrative snippet |
|---|---|---|---|
| 1 | Sector | Tech Platform / `tech` · Consumer Goods / `consumer` · Industrial Mfg / `industrial` | "The board has just appointed you CSO at NexaCorp…" |
| 2 | Market position | Market Leader / `leader` · Ambitious Challenger / `challenger` · Niche Specialist / `niche` | "Your first briefing reveals the competitive landscape…" |
| 3 | Strategic priority | Aggressive Growth / `growth` · Operational Excellence / `stability` · Innovation Leadership / `innovation` | "The board wants clarity on your strategic orientation…" |

**Navigation**: Back / Next buttons. Next is disabled until a choice is made. Final scene's button reads **"Begin VRIO Audit →"**. On confirm, dispatches `FINISH_PROLOGUE`, which computes starting metrics (see §4.1) and transitions to `vrio-audit`.

### 1.3 VRIO Audit Screen

Presents 8 resource tiles (2 × 4 grid on desktop, stacked on mobile).

**Player must**:
1. **Select exactly 4** resources (toggle on/off). Remaining tiles dim once 4 are selected.
2. For each selected resource, **set V, R, I, O toggles** (booleans). Each flag is a button; player clicks to toggle on/off. A resource must have at least one flag ON to be valid.

Below each selected resource tile, show a live VRIO assessment label:

| Flags ON | Label | Colour |
|---|---|---|
| V + R + I + O | Sustained Competitive Advantage | emerald |
| V + R + I | Unexploited Advantage | yellow |
| V + R | Temporary Advantage | orange |
| V only | Competitive Parity | slate |
| none / !V | No Competitive Value | red |

**"Begin Simulation (6 Rounds)"** button: enabled only when exactly 4 resources are selected AND each selected resource has ≥ 1 flag ON. Dispatches `FINISH_AUDIT`, which seeds initial tokens (see §5) and transitions to `round` phase, `roundPhase: 'pestel-draw'`, `currentRound: 1`.

### 1.4 Round Screen (R1..R6)

Layout (top → bottom):

```
┌─────────────────────────────────────────────┐
│ Round N / 6                   ⚡ 2  🛡 1    │  ← header bar + tokens
├─────────────────────────────────────────────┤
│          [ BOARD SVG — snake path ]         │  ← Board component
├──────────────────────┬──────────────────────┤
│   Metric bars        │   Five Forces meters │  ← HUD row (always visible)
├──────────────────────┴──────────────────────┤
│                                             │
│          [ PHASE CONTENT AREA ]             │  ← animated swap per sub-phase
│                                             │
└─────────────────────────────────────────────┘
```

The phase content area uses `AnimatePresence mode="wait"` to swap between the 6 sub-phases. See §2 for the full sub-phase loop.

### 1.5 Final Decision Room

Shown after Round 6 completes (dispatch `NEXT_ROUND` when currentRound = 6 → `phase: 'final-decision'`).

Five form sections, all required before the submit button enables:

1. **Pick 2 dominant PESTEL categories** — toggle-button group (max 2, must differ). Hint text shows which categories appeared.
2. **Pick 1 most critical Porter force** — radio-style buttons. Hint text shows the highest-metered force.
3. **Pick 2 key VRIO resources** — from the 4 selected resources. Max 2, must differ.
4. **Type a "next quarter" action** — free text input (min 5 chars).
5. **Type strategic justification** — free text textarea (min 10 chars).

Submit dispatches `SET_FINAL_DECISION` + `GO_REPORT`.

### 1.6 Report / Print Screen

Sections appear sequentially (staggered fade-in, 400 ms apart):

1. **Header**: Title "Strategic Analysis Report", final board position X / 13, overall rating (see §4.3).
2. **PESTEL Summary Table**: Round | Category | Event | Intensity | Reading (Opportunity / Threat).
3. **Five Forces Final State**: 5 horizontal segmented bars (1..5), coloured per force.
4. **VRIO Table**: Resource | V | R | I | O | Assessment label.
5. **Round-by-Round Timeline**: Per round card showing PESTEL event + interpretation, Porter card, action chosen, coherence score, traps, movement, post-round metrics.
6. **Final Strategic Decision**: Mirrors §1.5 answers.
7. **Final Metrics**: 4 metric cards with value + progress bar.
8. **Buttons** (hidden in print): "Print Report" (`window.print()`), "New Game" (`RESET_GAME`).

Print CSS: `@media print` hides `.no-print`, forces white background, enables `print-color-adjust: exact`.

---

## 2. Per-Round Step-by-Step Loop

Each round has 6 sequential sub-phases. The player **cannot skip or reorder** them. The `roundPhase` field in state controls which is active.

### Phase 1 — `pestel-draw`: Draw PESTEL Card

1. Player sees a face-down card-back button labelled "Draw Card".
2. Player clicks → system draws from PESTEL deck (see §3.2 for deck logic), stores card in a ref.
3. Card animates face-up (rotateY spring from 180→0, scale 0.5→1).
4. "Roll PESTEL Intensity" dice button appears.
5. Player clicks → die tumbles (12 frames at 80 ms each, random face per frame) → settles on result 1–6.
6. After 800 ms delay, dispatch `DRAW_PESTEL { card, intensity }` → transitions to `pestel-interpret`.

**UI gate**: No "Next" button — transition is automatic after dice settles.

### Phase 2 — `pestel-interpret`: Interpret the Event

1. Card is shown face-up with category badge and intensity label.
2. Player must choose **Opportunity** or **Threat** (two radio-style cards showing hints).
3. After choosing, a second selector appears: **"Which metric is most affected?"** — 4 buttons (Cash / Share / Brand / Ops).
4. After both selections, a "Confirm Interpretation" button appears.
5. Click → dispatch `INTERPRET_PESTEL { interpretation, metric }` → transitions to `porter-draw`.

**UI gate**: Button only enables after both selections made.

### Phase 3 — `porter-draw`: Draw Porter Card

Identical interaction pattern to Phase 1, but for Porter deck.

1. Face-down card → click "Draw Card" → card flips up.
2. Card shows force name, event title, direction arrow (▲ Increases / ▼ Decreases).
3. Dice roll for intensity.
4. After 800 ms, dispatch `DRAW_PORTER { card, intensity }` → transitions to `vrio-activate`.

### Phase 4 — `vrio-activate`: Activate VRIO Resource

1. Show the player's 4 selected resources as clickable cards.
2. Each card shows: resource name, V/R/I/O badges, token yield preview ("+ 1 ⚡ Leverage", "+ 1 🛡 Resilience", or "No tokens").
3. Player clicks one → immediate dispatch `ACTIVATE_VRIO { resourceId }` → transitions to `action-choose`.

**UI gate**: Single-click selection, no confirm needed.

### Phase 5 — `action-choose`: Choose Action + Justify

1. System generates 3 contextual actions (see §3.3) and dispatches `SET_AVAILABLE_ACTIONS`.
2. Three action cards appear in a row. Each shows: title, description, `BIG` badge if applicable, effect deltas (Cash: +12, Share: -5, etc.).
3. Player selects one (radio-style highlight).
4. Justification panel slides in with three selector groups:
   - **PESTEL category targeted** — 6 buttons (P / E / S / T / Ecol / L).
   - **Porter force addressed** — 5 buttons.
   - **VRIO resource leveraged** — 4 buttons (player's selected resources).
5. "Execute Action" button enables only when action + all 3 justifications are set.
6. Click → dispatch `SELECT_ACTION { action, justifications }` → transitions to `resolve`.

### Phase 6 — `resolve`: Resolution

Resolution is a **cinematic reveal sequence** with 5 timed steps (1 200 ms apart). The player does NOT click through each step — they auto-appear. At the end, a "Next Round" button appears.

**Step 0 (immediate)** — Coherence score reveal: three circles animate in, filled if earned.

**Step 1 (+ 1 200 ms)** — Trap check reveal:
- If traps triggered: red panel with shake animation, listing each trap.
- For each mitigatable trap (see §6): if player has ≥ 1 Resilience token AND activated resource O = ON, show a **"Use Resilience Token to cancel retreat?"** button. Player may click it (dispatch `USE_RESILIENCE`) or ignore. This is the **only interactive moment** in resolve.
- If no traps: green "All clear" banner.

**Step 2 (+ 1 200 ms)** — Token gain: show tokens earned from activated resource.

**Step 3 (+ 1 200 ms)** — Metric deltas: show the effect of the action (with PESTEL impact + leverage boost if used + VRIO exec-fail halving if applicable). Metric bars in the HUD animate to new values.

**Step 4 (+ 1 200 ms)** — Board movement: show net movement (+2, +1, 0, −1, etc.). Pawn animates to new position.

**Step 5 (+ 1 200 ms)** — "Continue to Round N+1" button (or "Proceed to Final Decision Room" after R6). On click, dispatch `RESOLVE_ROUND` + `NEXT_ROUND`.

**CRITICAL**: `RESOLVE_ROUND` must be dispatched AFTER the player has had a chance to use Resilience tokens, so that the final retreat value reflects their token choice.

---

## 3. State, Persistence & Deck Management

### 3.1 Persistence

- **Key**: `strategy-game-save`.
- **Strategy**: full `GameState` serialized to JSON on every reducer dispatch (`useEffect` on state).
- **Hydration**: `useReducer` initializer reads from localStorage. If missing or corrupt, returns `initialState`.
- **Reset**: `RESET_GAME` calls `localStorage.removeItem(key)` and returns `initialState`.

### 3.2 Deck Management

Two virtual decks: PESTEL (18 cards) and Porter (15 cards).

**Draw algorithm**:
```
available = FULL_DECK.filter(c => !usedIds.includes(c.id))
if (available.length === 0) {
  // reshuffle: clear usedIds, set available = FULL_DECK
}
card = random pick from available
push card.id into usedIds
```

With 18 PESTEL cards and 6 rounds, exhaustion never happens. With 15 Porter cards and 6 rounds, also fine. But the reshuffle fallback is there for safety.

State fields: `usedPestelCards: string[]`, `usedPorterCards: string[]`. These are reset on `RESET_GAME` but **not** on `NEXT_ROUND` (cards stay "used" across the full game).

### 3.3 Action Selection Algorithm

Pool of 18 actions. Each has `pestelTargets: PestelCategory[]` and `porterTargets: PorterForce[]`.

Per round, generate 3 actions:
1. Score each action: +2 if `pestelTargets` includes current PESTEL card's category, +2 if `porterTargets` includes current Porter card's force. Range 0–4.
2. Sort descending. Pick: **top** (best fit), **median** (moderate fit), **bottom** (worst fit).
3. De-duplicate. Fill from remaining if needed.
4. Fisher-Yates shuffle the 3 picks so presentation order is randomized.

Previously-used action IDs are soft-avoided (filtered out if ≥ 3 alternatives remain). If pool would fall below 3, reset to full pool.

---

## 4. Scoring

### 4.1 Starting Metrics (from Prologue)

Base: `{ cash: 60, share: 40, brand: 50, ops: 50 }`.

| Prologue choice | Adjustments |
|---|---|
| **Leader** (scene 2) | brand +15, share +10, ops +5, cash −5 |
| **Challenger** (scene 2) | share +10, cash −10, brand +5 |
| **Niche** (scene 2) | ops +15, brand +5, share −10, cash +5 |
| **Growth** (scene 3) | share +5, cash −10 |
| **Stability** (scene 3) | ops +10, cash +5 |
| **Innovation** (scene 3) | brand +5, ops −5 |

Clamp each metric to 0..100 after adjustments. Scene 1 (sector) is narrative flavour only — no metric impact.

### 4.2 Coherence Score (per round, 0..3)

Three binary checks:

| # | Check | +1 if |
|---|---|---|
| 1 | PESTEL justification matches drawn card | `justifications.pestel === currentPestelCard.category` |
| 2 | Porter justification matches drawn card | `justifications.porter === currentPorterCard.force` |
| 3 | VRIO justification matches activated resource | `justifications.vrio === activatedVRIO` |

**Design note**: Coherence tests whether the player correctly identified the *relevant* PESTEL/Porter/VRIO inputs for their action. A player who pays attention will get 3/3, but a player who carelessly picks arbitrary justifications will get 0..2.

To make coherence non-trivial: the justification selectors present ALL 6 PESTEL categories, ALL 5 Porter forces, and ALL 4 VRIO resources — not just the ones drawn this round. The player must remember or re-read the drawn cards. The drawn cards are NOT repeated in the justification panel — the player must scroll up or recall them.

### 4.3 Final Rating

| Board position | Rating | Colour |
|---|---|---|
| 11–13 | Excellent | emerald |
| 7–10 | Good | blue |
| 4–6 | Average | yellow |
| 0–3 | Poor | red |

### 4.4 Performance Score (for report)

Computed at report time, not during gameplay:

```
performanceScore = Math.round(
  (metrics.cash + metrics.share + metrics.brand + metrics.ops) / 4
)
```

Displayed in the report header alongside board position. Range 0–100.

Additional sub-scores shown:
- **Strategic Coherence Average**: mean of all 6 rounds' coherence scores (0.0–3.0, one decimal).
- **Trap Rate**: number of rounds where ≥ 1 trap triggered / 6. Lower is better.

---

## 5. Token Economics

### 5.1 Token Generation

**At audit completion (one-time)**:
```
for each of the 4 selected resources:
  if V=ON AND R=ON → +1 Leverage token
  if I=ON AND O=ON → +1 Resilience token
```
Max initial: 4 Leverage + 4 Resilience (if all 4 resources have all flags ON).

**Per round (from activated resource)**:
```
if activated.V AND activated.R → +1 Leverage
if activated.I AND activated.O → +1 Resilience
```
Tokens accumulate. There is no cap.

Tokens gained in a round are added AFTER resolution (so they cannot be spent in the same round they are earned).

### 5.2 Spending Leverage Tokens

**When**: During the resolve phase, BEFORE metric effects are calculated (Step 3).
**How**: Automatic — if the player has ≥ 1 Leverage token, a "Use Leverage Token? ⚡" toggle appears in Step 3. If toggled ON, 1 token is consumed.
**Effect**: All positive deltas from the selected action are multiplied by 1.3 (rounded). Negative deltas are unchanged.

Example: Action effects `{ cash: -10, share: 8, brand: 12, ops: -5 }` with leverage → `{ cash: -10, share: 10, brand: 16, ops: -5 }`.

Only 1 Leverage token can be spent per round.

### 5.3 Spending Resilience Tokens

**When**: During the resolve phase, Step 1 (trap reveal), ONLY if a mitigatable trap fired.
**How**: A "🛡 Use Resilience Token" button appears next to each mitigatable trap. Player clicks to spend 1 token per trap mitigated.
**Effect**: Cancels the −1 retreat from that specific trap.
**Constraint**: A trap is mitigatable ONLY IF the round's activated resource has `O = ON`. If O = OFF, the button does not appear and the retreat stands.
**VRIO Execution Failure is NEVER mitigatable** (it already requires O = OFF, making the O = ON constraint impossible).

Only 1 Resilience token can be spent per trap instance. Multiple traps may fire in one round; each requires a separate token.

### 5.4 Activated Resource Rules

- Exactly 1 resource is activated per round (Phase 4).
- The same resource may be activated in multiple rounds.
- The activated resource determines:
  - Token generation for this round.
  - Whether Resilience spending is allowed (O check).
  - Whether VRIO Execution Failure trap triggers (O check + isBig action check).
- There is no "cooldown" — activating a resource repeatedly is valid strategy.

---

## 6. Traps

Three trap types. Checked during resolve Step 1, using the state AFTER Porter force update but BEFORE metric effects.

### Trap A — PESTEL Shock

| | |
|---|---|
| **Trigger** | PESTEL intensity ≥ 5 (Strong) **AND** coherence < 2 |
| **Effect** | −5 penalty to the metric the player identified as "most affected" (the `affectedMetric` from Phase 2). Board retreat −1. |
| **Mitigatable?** | Yes — if activated resource O = ON and player spends 1 Resilience token, the retreat is cancelled. The −5 metric penalty still applies. |

### Trap B — Porter Max Pressure

| | |
|---|---|
| **Trigger** | Any force meter is at 5/5 **AND** the player's Porter justification does NOT match any of the maxed forces. |
| **Effect** | −3 to all 4 metrics. Board retreat −1. |
| **Mitigatable?** | Yes — same conditions as Trap A. Retreat cancelled, metric penalty still applies. |

Note: Force meters are updated from the Porter card BEFORE the trap check. This means a force at 4 that gets bumped to 5 by a "direction: increase" card WILL trigger this trap if not addressed. This is intentional — the player sees the Porter card's direction in Phase 3 and should factor it in.

### Trap C — VRIO Execution Failure

| | |
|---|---|
| **Trigger** | Selected action is `isBig: true` **AND** activated resource has `O = OFF`. |
| **Effect** | All action effect deltas halved (rounded toward zero). Board retreat −1. |
| **Mitigatable?** | **No.** The condition requires O = OFF, which precludes Resilience spending. |

### Multiple Traps

All three traps are evaluated independently. It is possible for 2 or even 3 to trigger in the same round. Each unmitigated trap contributes −1 to movement. Worst-case movement in a round: `+1 (base) + 0 (no coherence bonus) − 3 (all traps) = −2`.

---

## 7. Board Movement

Calculated during resolve Step 4:

```
base          = +1     (always, for completing the round)
coherenceBonus= coherence >= 2 ? +1 : 0
trapRetreat   = − (number of unmitigated traps that have retreat)
─────────────────────────
net movement  = base + coherenceBonus + trapRetreat
new position  = clamp(boardPosition + net, 0, 13)
```

Best-case per round: +2. Worst-case per round: −2.
Over 6 rounds: theoretical max = 12 (finish or close). Theoretical min = −12 (clamped to 0).

---

## 8. Metric Effects Calculation (Resolve Step 3)

Order of operations:

```
1. Start with current metrics.
2. Base action deltas:
   for each metric k:
     delta = action.effects[k]
     if VRIO Execution Failure triggered:  delta = round(delta * 0.5)
     if Leverage token spent:              delta = (delta > 0) ? round(delta * 1.3) : delta
     metrics[k] += delta
3. PESTEL impact on affected metric:
   pestelDelta = interpretation === 'opportunity' ? round(+5 × intensityMult) : round(-5 × intensityMult)
   metrics[affectedMetric] += pestelDelta
4. Trap penalties:
   if PESTEL Shock triggered:     metrics[affectedMetric] -= 5
   if Porter Max Pressure triggered: for each k: metrics[k] -= 3
5. Clamp all metrics to 0..100.
```

---

## 9. Animation Plan

### 9.1 Screen Transitions (`App.tsx`)

**Component**: `AnimatePresence mode="wait"` wrapping a keyed `motion.div`.
**Pattern**: `initial={{ opacity: 0, y: 20 }}` / `animate={{ opacity: 1, y: 0 }}` / `exit={{ opacity: 0, y: -20 }}`.
**Duration**: 400 ms ease.

### 9.2 Round Sub-Phase Transitions (`RoundScreen.tsx`)

**Component**: `PhaseWrap` — `AnimatePresence mode="wait"` with keyed `motion.div`.
**Pattern**: `initial={{ opacity: 0, x: 50 }}` / `animate={{ opacity: 1, x: 0 }}` / `exit={{ opacity: 0, x: -50 }}`.
**Duration**: 350 ms ease.

### 9.3 Card Draw (PESTEL & Porter)

**Card back**: `motion.button` with `whileHover={{ scale: 1.05, y: -4 }}`, `whileTap={{ scale: 0.95 }}`.
**Flip to face**: `motion.div` with `initial={{ rotateY: 180, scale: 0.5 }}` / `animate={{ rotateY: 0, scale: 1 }}`. Requires parent with `perspective: 1000px` CSS and child with `backface-visibility: hidden`.
**Spring**: `type: 'spring'`, duration ~600 ms.

### 9.4 Dice Roll

**Tumble phase**: `setInterval` at 80 ms, cycling random Unicode dice faces (⚀⚁⚂⚃⚄⚅) for 12 ticks.
**Landing**: After last tick, set final face. `motion.div` scales from 1.5 → 1 with spring.
**Container**: `animate={{ rotate: [0, 360] }}` during tumble, `transition={{ repeat: Infinity, duration: 0.3 }}`.

### 9.5 Board Pawn Movement

**Component**: SVG `motion.circle` for the pawn.
**Pattern**: `animate={{ cx: target.x, cy: target.y }}` driven by computed node coordinates.
**Spring**: `type: 'spring'`, `stiffness: 60`, `damping: 15`.
**Pulse ring**: Second `motion.circle` with `animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}`, `repeat: Infinity`, `duration: 2s`.

### 9.6 Metric Bars

**Component**: `motion.div` inside a fixed-width container.
**Pattern**: `animate={{ width: `${value}%` }}`.
**Spring**: `duration: 0.6`, `type: 'spring'`.

### 9.7 Force Meters

**Component**: 5 small `motion.div` squares per force.
**Pattern**: `animate={{ scale: filled ? 1 : 0.7, opacity: filled ? 1 : 0.3 }}`.
**MAX indicator**: Pulsing `motion.span` with `animate={{ opacity: [1, 0.3, 1] }}`, `repeat: Infinity`.

### 9.8 Trap Alert (Shake)

**Component**: `motion.div` wrapping the trap list.
**Pattern**: `animate={{ x: [0, -5, 5, -5, 5, 0] }}`, `duration: 0.5`.
**Container**: red-tinted `bg-red-500/10 border-red-500/30`.

### 9.9 Resolve Step Staggered Reveal

**Approach**: Local `step` counter incremented by `setInterval(1200ms)`.
**Each step**: `motion.div` with `initial={{ opacity: 0, y: 10 }}` / `animate={{ opacity: 1, y: 0 }}` rendered conditionally on `step >= N`.

### 9.10 Report Section Cascade

**Component**: Wrapper `Section` with a `delay` prop.
**Approach**: `setTimeout(delay)` sets `visible = true`. When visible, `motion.section` mounts with `initial={{ opacity: 0, y: 30 }}` / `animate={{ opacity: 1, y: 0 }}`, `duration: 0.6`.

---

## 10. TypeScript Models

```typescript
/* ═══════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════ */

type PestelCategory = 'P' | 'E' | 'S' | 'T' | 'Ecol' | 'L';

type PorterForce =
  | 'newEntrants'
  | 'suppliers'
  | 'buyers'
  | 'substitutes'
  | 'rivalry';

type MetricKey = 'cash' | 'share' | 'brand' | 'ops';

type Interpretation = 'opportunity' | 'threat';

type Phase =
  | 'home'
  | 'prologue'
  | 'vrio-audit'
  | 'round'
  | 'final-decision'
  | 'report';

type RoundPhase =
  | 'pestel-draw'
  | 'pestel-interpret'
  | 'porter-draw'
  | 'vrio-activate'
  | 'action-choose'
  | 'resolve';

/* ═══════════════════════════════════════════
   CARD TYPES
   ═══════════════════════════════════════════ */

interface CardPESTEL {
  id: string;                    // e.g. 'p1'
  category: PestelCategory;
  title: string;                 // e.g. "Trade War Escalation"
  description: string;           // flavour text
  opportunityHint: string;       // shown when player considers Opportunity
  threatHint: string;            // shown when player considers Threat
}

interface CardPorter {
  id: string;                    // e.g. 'ne1'
  force: PorterForce;
  title: string;
  description: string;
  direction: 'increase' | 'decrease';
}

/* ═══════════════════════════════════════════
   VRIO RESOURCE
   ═══════════════════════════════════════════ */

interface ResourceVRIO {
  id: string;                    // e.g. 'brand'
  name: string;                  // e.g. "Brand Heritage"
  description: string;
  V: boolean;                    // Valuable
  R: boolean;                    // Rare
  I: boolean;                    // Inimitable
  O: boolean;                    // Organized to capture value
  selected: boolean;             // player picked this during audit
}

/* ═══════════════════════════════════════════
   ACTION
   ═══════════════════════════════════════════ */

interface Action {
  id: string;                    // e.g. 'a1'
  title: string;
  description: string;
  isBig: boolean;                // triggers VRIO Execution Failure if O=OFF
  effects: Record<MetricKey, number>; // signed deltas, e.g. { cash: -10, share: 8, brand: 12, ops: -5 }
  pestelTargets: PestelCategory[];    // categories this action "fits"
  porterTargets: PorterForce[];       // forces this action "addresses"
}

/* ═══════════════════════════════════════════
   ROUND LOG (immutable record per round)
   ═══════════════════════════════════════════ */

interface RoundLog {
  round: number;                 // 1..6

  // Phase 1–2: PESTEL
  pestelCard: CardPESTEL;
  pestelIntensity: number;       // 1..6
  interpretation: Interpretation;
  affectedMetric: MetricKey;

  // Phase 3: Porter
  porterCard: CardPorter;
  porterIntensity: number;       // 1..6

  // Phase 4: VRIO
  activatedVRIO: string;         // resource id

  // Phase 5: Action
  selectedAction: Action;
  justifications: {
    pestel: PestelCategory;
    porter: PorterForce;
    vrio: string;                // resource id
  };

  // Phase 6: Resolution
  coherenceScore: number;        // 0..3
  trapsTriggered: string[];      // trap names
  trapsMitigated: string[];      // subset of trapsTriggered where resilience was used
  leverageUsed: boolean;
  resilienceSpent: number;       // 0..N tokens spent this round

  // Outcomes
  metricDeltas: Record<MetricKey, number>; // net change per metric this round
  metricsAfter: Record<MetricKey, number>; // snapshot after all effects
  forcesAfter: Record<PorterForce, number>;
  movement: number;              // net movement (+2 to -3)
  boardPositionAfter: number;
  tokensGained: { leverage: number; resilience: number };
}

/* ═══════════════════════════════════════════
   FINAL DECISION
   ═══════════════════════════════════════════ */

interface FinalDecision {
  dominantPestel: [PestelCategory, PestelCategory];
  criticalForce: PorterForce;
  keyResources: [string, string];   // resource ids
  nextAction: string;               // free text
  justification: string;            // free text
}

/* ═══════════════════════════════════════════
   PROLOGUE CHOICE
   ═══════════════════════════════════════════ */

interface PrologueChoice {
  scene: number;      // 1, 2, or 3
  question: string;
  answer: string;     // display label
  value: string;      // machine key
}

/* ═══════════════════════════════════════════
   ROUND STATE (ephemeral, reset per round)
   ═══════════════════════════════════════════ */

interface RoundState {
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
  usedResilienceThisRound: number;  // count of tokens spent this round
}

/* ═══════════════════════════════════════════
   FULL GAME STATE (persisted to localStorage)
   ═══════════════════════════════════════════ */

interface GameState {
  // Navigation
  phase: Phase;
  roundPhase: RoundPhase;
  currentRound: number;            // 1..6

  // Prologue
  companyName: string;             // always "NexaCorp"
  prologueChoices: PrologueChoice[];

  // VRIO Audit
  vrioResources: ResourceVRIO[];   // all 8, with selected + flags set

  // Board
  boardPosition: number;           // 0..13

  // Metrics & Forces
  metrics: Record<MetricKey, number>;      // 0..100 each
  forces: Record<PorterForce, number>;     // 0..5 each

  // Tokens
  leverageTokens: number;          // ≥ 0, no cap
  resilienceTokens: number;        // ≥ 0, no cap

  // Current round ephemeral
  current: RoundState;

  // History
  roundHistory: RoundLog[];        // grows to length 6
  usedPestelCards: string[];       // card ids, never reset mid-game
  usedPorterCards: string[];

  // End-game
  finalDecision: FinalDecision | null;
}
```

---

## 11. Known Deltas from v1 Codebase → This Spec

The following are **bugs or gaps** in the current implementation that this spec corrects:

| # | Issue | Current behaviour | Spec requirement |
|---|---|---|---|
| 1 | **Resilience tokens never spent interactively** | `USE_RESILIENCE` dispatch exists but nothing in the UI calls it. `checkTraps()` pre-computes mitigation assuming tokens are auto-spent. | Resolve Step 1 must show a clickable "Use Resilience" button per mitigatable trap. Player decides. |
| 2 | **Leverage tokens never spent** | `USE_LEVERAGE` dispatch exists but is never called. `usedLeverageThisRound` is always `false`. | Resolve Step 3 must show a toggle to spend 1 Leverage token before metric effects. |
| 3 | **No metric penalty from traps** | Traps only cause retreat; no metric hits. | Trap A: −5 to affected metric. Trap B: −3 to all metrics. Trap C: halves action effects (already correct). |
| 4 | **Resilience mitigation double-counted** | In `checkTraps()`, if mitigatable, the retreat is NOT added to `retreatPenalty`. Then in `ResolvePhase`, mitigated count is subtracted from penalty — subtracting from a penalty that was never added. Net effect: mitigation is cosmetic. | `checkTraps()` should always add +1 retreat for triggered traps. The resolve phase should subtract 1 per mitigated trap only when player explicitly spends a token. |
| 5 | **Coherence is trivially 3/3** | Justification selectors let the player see the drawn cards while picking. There's no reason to ever pick wrong. | Justification panel should NOT re-display the drawn PESTEL/Porter cards. The drawn cards are shown earlier in the round; the player must recall them. This adds a recall/attention challenge. |
| 6 | **`RoundRecord` missing fields** | No `leverageUsed`, `resilienceSpent`, `metricDeltas`, `boardPositionAfter`. | Add these fields per the `RoundLog` definition above. |
| 7 | **Performance score absent** | Report only shows board position. | Add `performanceScore`, `avgCoherence`, `trapRate` to report header. |
| 8 | **`RESOLVE_ROUND` dispatch too wide** | Current dispatch payload duplicates half the state. | Refactor: compute everything inside the reducer or a utility, dispatch a lean payload `{ leverageUsed: boolean, resilienceSpent: string[] }` and let the reducer call pure functions. |
| 9 | **`PorterDrawPhase` uses `useState<any>`** | `card` is typed `any`. | Type as `CardPorter | null`. |
| 10 | **Report has no print-specific page breaks** | Long timelines overflow. | Add `@media print { .page-break { break-before: page; } }` before timeline section. |

---

## 12. Data Inventory (Content)

| Deck | Count | Breakdown |
|---|---|---|
| PESTEL cards | 18 | 3 per category (P × 3, E × 3, S × 3, T × 3, Ecol × 3, L × 3) |
| Porter cards | 15 | 3 per force (2 increase + 1 decrease each) |
| VRIO resources | 8 | Player picks 4 |
| Actions | 18 | 6 marked `isBig`, 12 normal |

All content is already authored in `data.ts`. No changes needed to card/action texts. Only structural additions (`metricPenalty` fields on traps) are handled in code, not in data.

---

*End of specification.*
