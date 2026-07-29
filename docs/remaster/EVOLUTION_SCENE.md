# EvolutionScene: data-driven playable evolution

`EvolutionScene` lets a new protoplasm game progress through the real
Evolution actions until Sentience. It is part of this unofficial Evolve fork:
the original MPL-2.0 notices remain in force, and the scene uses only original
CSS/SVG presentation plus already-reviewed local project assets.

## Data boundary

The scene receives only `RemasterPhaseSnapshot` v2. Its `EvolutionSnapshot`
contains already-calculated visible resources (`amount`, `max`, `diff`, and
formatted value), `evolution.final`, active `evo*` technologies, built steps,
and currently visible actions. An action has its stable
`actions.evolution` key, original DOM id, localized title, description,
effect, renderer-derived costs, affordability, `reqs`, `grant`, counter,
emblem, active state, and visual stage.

The authorized reader lives in `src/actions.js`:

```text
global + actions.evolution
  -> getRemasterEvolutionState()
  -> createGamePhaseSnapshot(global, reader)
  -> EvolutionScene
```

`src/remaster/` never imports `global`, `actions`, `races`, cost helpers, or
save code. RNA, DNA, and every other visible resource are enumerated from the
engine resource table. The scene shows the engine-provided net change rather
than inventing a production or consumption formula when no separate value is
published.

## Branch discovery and coverage

There is no UI-owned list of membranes, organelles, genera, species, or
challenges. Each read enumerates `Object.entries(actions.evolution)`. A node
appears only after the original `checkTechQualifications()` and the exact
`reqs` pass used by `drawEvolution()` succeed. Therefore normal branches,
perks, extinct species, synth, custom/hybrid choices, challenges, and delayed
options are discovered only when the engine allows them.

Edges are drawn from visible `reqs` and `grant` metadata when a source is
unambiguous. Otherwise the node is grouped by its engine `reqs.evo` stage; no
mechanical edge is guessed. Hidden branches are not shown as future locked
content.

`createEvolutionCoverageMatrix()` runs over every live Evolution definition
and publishes `coverage` with one of these outcomes for each id:

- a generic represented and executable map node;
- `classic-hidden-until-available`; or
- `classic-unsupported`.

The remaster contract test covers this matrix rule. The production reader is
the part that iterates the real definitions at runtime.

## Original action path

The panel calls only `GameActionBridge.executeEvolutionAction(id)`. The bridge
ends in `runVisualEvolutionAction()` in `src/actions.js`, which uses the same
original qualification and requirement pass as `drawEvolution()` and then
calls `runAction(c_action, 'evolution', id)`.

The original action therefore retains affordability validation, payment,
quantity, queue behavior, messages, post-processing, species choice, and
challenge effects. The scene writes no resource, technology, race, or
evolution state. It redraws only from the snapshot observed after the original
dispatcher completes.

The real Sentience action calls `sentience()` and the normal `drawCity()` path
then moves the router to `EarlySettlementScene`. Before that confirmation,
`SentienceTransitionScene` uses the same map and final node. Its localized
skip control only stops decorative animation; it cannot change the game phase.

## Accessibility, rendering, and lifecycle

The DOM/SVG map supports pointer selection and tooltip, touch, native button
keyboard controls, wheel/button zoom, drag panning, centering, and stable node
focus after a structural graph refresh. CSS motion follows
`prefers-reduced-motion`; `remaster_skip_animation` is present in every
shipped locale.

`StaticPhaseSceneManager` samples a visible Evolution scene at most once per
second. It pauses while the document is hidden and cleans its interval,
visibility, focus, page-show, locale, pointer, wheel, and media-query listeners
on unmount or feature-flag disable. Resource values, node state, and the panel
update incrementally; the graph rebuilds only when action structure changes.

## Manual parity checks

1. Start a new game, enable Visual Remaster, and perform RNA, DNA, and the
   next visible cellular action. Compare resources and costs in Classic View.
2. Repeat for a cellular upgrade, a genus decision, and an engine-enabled
   species choice, including an unlocked prestige branch when available.
3. Reach Sentience through the final graphical node and confirm that the real
   early settlement appears without fictional resources or technologies.
4. Toggle graphical/classic view, hide and restore the tab, use keyboard and
   touch input, and repeat with reduced motion enabled.

The classic Evolution UI remains the immediate fallback for any unavailable or
specialized engine flow.
