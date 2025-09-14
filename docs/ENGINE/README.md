# COSMOSX Engine Developer Guide

## Overview

The CosmosX runtime consists of three main parts:

- CosmosEngine (`js/cosmosx-engine/core/CosmosEngine/engine.js`): Executes a CosLang story AST, maintains state, and applies story logic (sets, ifs, choices, tags, assets).
- Parser (`js/cosmosx-engine/core/CosmosEngine/parser.js`): Parses `.coslang` text into an AST with `meta`, `assets`, and `scenes`.
- CosmosUI (`js/cosmosx-engine/core/CosmosUI/index.js`): Transforms engine state into a minimal, render-ready object (text, choices, stats, inventory, achievements, events, current assets) for any UI (Player, IDE Live Preview).

This document describes the AST, engine state, processing pipeline, tags, macros, and integration points.

---

## Parser Output (AST)

`parseCosLang(text)` returns:

```js
{
  meta: {
    title: string,
    author: string,
    version: string,
    vars?: object,       // global variables from top-level `vars {}`
    stats?: object,      // global stats from top-level `stats {}`
    inventory?: object   // global inventory from top-level `inventory {}`
  },
  scenes: {
    [sceneId: string]: {
      id: string,        // filled by the parser
      vars?: object,     // scene-level initial vars
      stats?: object,    // scene-level initial stats
      inventory?: object,// scene-level initial inventory
      content: Array<Node>
    }
  },
  assets: Array<{ type: 'image'|'audio'|'video', name: string, value: string, settings?: object }>
}
```

Content node types commonly produced by the parser (`parser.js`):

- `text`: `{ type: 'text', value: string, tags?: string[] }`
- `choice`: `{ type: 'choice', text: string, target: string, tags?: string[] }`
- `set`: `{ type: 'set', var: string, expr: string, tags?: string[] }`
- `if`: `{ type: 'if', condition: string, then: Node[], else: Node[] }`
- Asset commands:
  - `show_image`: `{ type: 'show_image', name: string }`
  - `play_audio`: `{ type: 'play_audio', name: string }`
  - `show_video`: `{ type: 'show_video', name: string }`
- `macro` (definition): `{ type: 'macro', name: string, params: string[], body: string }`
- `unknown`: `{ type: 'unknown', raw: string }` (parser fallback)

Tags are extracted with `extractTags()` and attached to `text`, `set`, or `choice` nodes.
Assets are also registered in `CosmosAssets` for later resolution.

---

## Engine State and Lifecycle

Initial state (see `_initialState()` in `engine.js`):

```js
{
  scene: null,
  sceneId: null,
  position: 0,
  vars: { ...meta.vars },
  stats: { ...meta.stats },
  inventory: { ...meta.inventory },
  events: {},
  achievements: {},
  macros: {},        // merged from global + discovered in content
  callStack: [],
  log: [],
  error: null,
  debug: {}
}
```

Global state also tracks built-in macros (`min`, `max`), and merges discovered macro definitions from all scenes (`_initializeMacrosFromAST()`).

### Scene Loading

`loadScene(sceneId)`:
- Validates scene existence and resets current assets (`currentImage`, `currentAudio`, `currentVideo`).
- Merges scene-level `vars`, `stats`, `inventory` (without overwriting existing keys).
- Merges global `events`/`achievements` into state.
- Deep-clones `scene.content` so the engine can rewrite/expand it during execution.
- Calls `autoAdvanceToRenderable()` to pre-process content.

### Processing Pipeline (`autoAdvanceToRenderable()`)

1. Detect if the scene contains any `set` nodes.
2. If yes, execute all `set` nodes (recursively, including inside `if` branches) via `executeSetNodesInScene()` and `executeSetNodesRecursive()`.
3. Re-interpolate all `text` nodes with updated variables via `reinterpolateTextNodes()`.
4. Iterate content from the current `position`:
   - `text`: keep advancing, interpolated in-place.
   - Asset nodes (`show_image`, `play_audio`, `show_video`): resolve via `CosmosAssets`, store current asset reference, advance.
   - `if`: expand the branch into the content array (`handleIf()`), execute any `set` nodes from the expanded branch, then continue.
   - `choice`: stop and wait for UI input.

The engine stops at the first `choice`, leaving `position` at the first unprocessed node.

### Choices and Tags

`choose(index)`:
- Validates available choices at the current position.
- Logs the choice and `tags`, calls `handleTags(node)` to apply side-effects, then `loadScene(choice.target)`.

`handleTags(node)` supports:
- `LOG:<message>` → `state.log.push({ type: 'log', message })`
- `ACHIEVEMENT:<name>` → `state.achievements[name] = true`
- `EVENT:<name>` → `state.events[name] = true`
- `inventory ++ <item>` → increments `inventory[item]`
- `inventory -- <item>` → decrements `inventory[item]` (no negative values)
- Unrecognized tags are logged as `{ type: 'tag', value }`.

The Player also treats the single tag `RESET` on a `choice` as a “true restart” signal, restarting engine state and jumping to the choice target. See `player/scripts/corePlayer.js` for that behavior.

### Sets and Macros

`handleSet({ var, expr })`:
- Determines the target table among `vars`, `stats`, or `inventory` (existing key wins), else creates in `vars`.
- Supports macro-call expressions like `min(a, b)`. Parameters are substituted from the combined context `{ ...vars, ...stats, ...inventory }`.
- For regular expressions, identifiers are replaced by the current context values, then the arithmetic expression is evaluated safely.
- Auto-clamping rules (example) ensure some variables remain within bounds, e.g. `enemyHealth >= 0`, `questProgress <= 3`.
- Applies `handleTags()` after setting.

### Variable Interpolation

`interpolateVariables(text)` replaces `{name}` occurrences with current values from `{ ...vars, ...stats, ...inventory }`.
`reinterpolateTextNodes()` rewrites all `text` node `value`s in-place after `set` execution.

---

## CosmosUI Renderable State

`CosmosUI.getRenderableState()` converts engine state into a UI-friendly structure:

```js
{
  sceneId,
  text: string[],
  choices: Array<{ index, text, tags?, target }>,
  stats, inventory, vars, log, error, meta,
  achievements, events,
  currentImage, currentAudio, currentVideo
}
```

This is consumed by the Player (`player/scripts/corePlayer.js`) and IDE Preview to render story content without exposing engine internals.

---

## Player Integration Highlights

- `corePlayer.js` wires `CosmosEngine` and `CosmosUI`, manages DOM rendering, and handles `RESET`-tagged choices for a true restart.
- Save/Load is implemented via `localStorage` key `cosmosx-player-save` with `engine.getState()` snapshots.
- `ui.js` provides the welcome screen, keyboard shortcuts (`Ctrl/Cmd+S/L/O`, `F1`), and dispatches custom events for file loading and demo story.
- `fileloader.js` reads `.coslang` files and delegates to `corePlayer.loadStory()`.

---

## Extensibility Guidelines

- New Tags: Extend `handleTags()` to add engine-side effects; document in COSLANG Tags.
- New Asset Types: Add parsing in `parser.js`, registration in `CosmosAssets`, and handling in `engine.js`.
- New Built-in Macros: Register in `globalState.macros` with a validated/safe body.
- Diagnostics: Add checks in `js/cosmosx-engine/utils/engine-diagnostics.js` and surface them via the IDE.

---

## Error Handling and Logging

- Errors are propagated by setting `state.error` and throwing with contextual messages (`if/else error`, `set statement error`, etc.).
- `logger` calls provide verbose debug output throughout parsing and engine execution.
- UI layers should display `state.error` prominently and log engine debug info when available.

---

## References

- Engine: `js/cosmosx-engine/core/CosmosEngine/engine.js`
- Parser: `js/cosmosx-engine/core/CosmosEngine/parser.js`
- CosmosUI: `js/cosmosx-engine/core/CosmosUI/index.js`
- Scene helpers: `js/cosmosx-engine/core/CosmosUI/SceneRenderer.js`
- Inventory helpers: `js/cosmosx-engine/core/CosmosUI/components/InventoryPanel.js`
- Player: `player/scripts/`
