// CosmosUI: Logic-only bridge between CosmosEngine and UI (Player, IDE, etc)
// Provides pure data for rendering scenes, choices, stats, inventory, etc.
// No styles, no DOM manipulation—just logic and data.

export class CosmosUI {
  constructor(engine) {
    this.engine = engine;
  }

  /**
   * Get a renderable representation of the current scene/state.
   * Returns an object with text, choices, stats, inventory, etc.
   */
  getRenderableState() {
    const state = this.engine.getState();
    const scene = state.scene;
    if (!scene) return { error: state.error || 'No scene loaded.' };
    // Gather text nodes, choices, etc.
    const content = scene.content || [];
    const renderable = {
      sceneId: state.sceneId,
      text: [],
      choices: [],
      stats: state.stats,
      inventory: state.inventory,
      vars: state.vars,
      log: state.log,
      error: state.error,
      meta: state.meta,
      achievements: state.achievements, // Added
      events: state.events,             // Added
      currentImage: state.currentImage || null, // Added for asset rendering
      currentAudio: state.currentAudio || null, // Added for asset rendering
      currentVideo: state.currentVideo || null  // Added for asset rendering
    };
    for (let i = 0; i < content.length; i++) {
      const node = content[i];
      if (node.type === 'text') {
        // Use the node.value directly (which may have been updated by reinterpolateTextNodes)
        // instead of calling handleText which re-interpolates the original value
        renderable.text.push(node.value);
      } else if (node.type === 'choice') {
        renderable.choices.push({
          index: renderable.choices.length,
          text: node.text,
          tags: node.tags,
          target: node.target
        });
      }
      // Skip macro definitions - they are global and not part of scene content
      // Skip set and if nodes - they are processed by the engine, not rendered
    }
    return renderable;
  }

  /**
   * Advance the engine (for linear stories, or after showing text)
   */
  advance() {
    this.engine.advance();
    return this.getRenderableState();
  }

  /**
   * Handle a user selecting a choice (by index)
   */
  choose(index) {
    this.engine.choose(index);
    return this.getRenderableState();
  }

  /**
   * Get renderable state with updated variable interpolation after set nodes are executed
   */
  getRenderableStateAfterSetExecution() {
    const state = this.engine.getState();
    const scene = state.scene;
    if (!scene) return { error: state.error || 'No scene loaded.' };
    
    // Set nodes are already executed in the choose() method, so we just need to get the renderable state
    // The reinterpolateTextNodes() is also called in choose(), so variables should be updated
    return this.getRenderableState();
  }

  /**
   * Reset the engine (restart story, etc)
   */
  reset() {
    this.engine.reset();
    return this.getRenderableState();
  }
} 