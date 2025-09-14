// CosmosEngine: Core runner for CosLang AST
// Expanded skeleton with all required state and feature stubs per status.md

import { parseSet, parseText } from './parser.js';
import { logger, setLogMode } from '../../logger.js';
import { cosmosAssets } from '../CosmosAssets/assets.js';

const ENGINE_DEBUG = true;

// Add a deepClone helper at the top
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _engineInitialized = false;
export class CosmosEngine {
  constructor(ast) {
    if (!_engineInitialized) {
      logger.banner('CosmosEngine initialized', 'success');
      _engineInitialized = true;
    } else {
      logger.debug('CosmosEngine initialized');
    }
    this.ast = ast;
    this.meta = ast.meta || {};
    // Initialize global state from ast.meta or ast.scenes if present
    this.globalState = {
      vars: (ast.meta && ast.meta.vars) ? { ...ast.meta.vars } : {},
      stats: (ast.meta && ast.meta.stats) ? { ...ast.meta.stats } : {},
      inventory: (ast.meta && ast.meta.inventory) ? { ...ast.meta.inventory } : {},
      events: {},
      achievements: {},
      macros: {
        // Built-in functions that are always available
        min: {
          name: 'min',
          params: ['a', 'b'],
          body: 'return (a < b) ? a : b'
        },
        max: {
          name: 'max', 
          params: ['a', 'b'],
          body: 'return (a > b) ? a : b'
        }
      },
      log: [],
    };
    this.state = this._initialState();
    logger.debug('[ENGINE] Global state initialized:', {
      vars: this.globalState.vars,
      stats: this.globalState.stats,
      inventory: this.globalState.inventory
    });
    this._initializeMacrosFromAST();
    // Optionally, scan all scenes for global events/achievements
    for (const sceneId in this.ast.scenes) {
      const scene = this.ast.scenes[sceneId];
      if (scene.events) Object.assign(this.globalState.events, scene.events);
      if (scene.achievements) Object.assign(this.globalState.achievements, scene.achievements);
    }
  }

  _initialState() {
    return {
      scene: null,
      sceneId: null,
      position: 0,
      vars: { ...this.globalState.vars },
      stats: { ...this.globalState.stats },
      inventory: { ...this.globalState.inventory },
      events: {},
      achievements: {},
      macros: {},
      callStack: [],
      log: [],
      error: null,
      debug: {},
    };
  }

  _initializeMacrosFromAST() {
    for (const sceneId in this.ast.scenes) {
      const scene = this.ast.scenes[sceneId];
      if (scene.content) {
        this._findMacrosRecursive(scene.content);
      }
    }
  }

  _findMacrosRecursive(content) {
    if (!content || !Array.isArray(content)) return;
    
    for (const node of content) {
      if (!node) continue;
      
      if (node.type === 'macro') {
        logger.debug(`[ENGINE] Found macro: ${node.name}`);
        this.globalState.macros[node.name] = node;
      } else if (node.type === 'if') {
        // Recursively search in if blocks
        if (node.then && Array.isArray(node.then)) {
          this._findMacrosRecursive(node.then);
        }
        if (node.else && Array.isArray(node.else)) {
          this._findMacrosRecursive(node.else);
        }
      }
    }
  }

  autoAdvanceToRenderable() {
    logger.info('[ENGINE] autoAdvanceToRenderable', this.state.position);
    
    // First pass: collect text and stop at first choice (skip set nodes and if nodes)
    // First, find if there are any set nodes in this scene
    let hasSetNodes = false;
    for (let i = 0; i < this.state.scene.content.length; i++) {
      if (this.state.scene.content[i] && this.state.scene.content[i].type === 'set') {
        hasSetNodes = true;
        break;
      }
    }
    
    logger.debug(`[ENGINE] Scene has set nodes: ${hasSetNodes}`);
    
    // If the scene has set nodes, we need to execute them first before processing if nodes
    if (hasSetNodes) {
      logger.debug('[ENGINE] Scene has set nodes, executing them first');
      this.executeSetNodesInScene();
      // Re-interpolate text nodes with updated variables after set execution
      this.reinterpolateTextNodes();
    }
    
    // First pass: Process all if blocks to expand conditional content
    let i = 0;
    while (i < this.state.scene.content.length) {
      let node = this.state.scene.content[i];
      if (!node) {
        i++;
        continue;
      }
      if (node.type === 'if') {
        try {
          logger.debug(`[ENGINE] Processing if node at position ${i}: ${node.condition}`);
          const branch = this.handleIf(node);
          this.state.scene.content.splice(i, 1, ...branch);
          logger.debug('[ENGINE] If node processed, new content length:', this.state.scene.content.length);
          
          // Execute any set nodes that were expanded from the if block
          if (branch.length > 0) {
            logger.debug('[ENGINE] Executing set nodes from expanded if block');
            this.executeSetNodesRecursive(branch);
            // Re-interpolate text nodes after executing set nodes from if block
            this.reinterpolateTextNodes();
          }
          
          // Don't increment i, process the expanded content
          continue;
        } catch (e) {
          this.state.error = 'If/else error: ' + e.message;
          throw new Error(this.state.error);
        }
      } else {
        i++;
      }
    }
    
    // Second pass: Process content and stop at first choice
    while (this.state.scene && this.state.position < this.state.scene.content.length) {
      let node = this.state.scene.content[this.state.position];
      if (!node) break;
      if (node.type === 'text') {
        // Interpolate text nodes with current variables
        const originalValue = node.value;
        const interpolatedValue = this.interpolateVariables(originalValue);
        if (originalValue !== interpolatedValue) {
          logger.debug(`[ENGINE] Interpolation: "${originalValue}" -> "${interpolatedValue}"`);
          node.value = interpolatedValue;
        }
        this.state.position++;
      } else if (node.type === 'show_image') {
        // Handle show image asset
        const asset = cosmosAssets.getAsset('image', node.name);
        if (asset) {
          this.state.currentImage = asset;
          logger.info(`[ENGINE] Showing image asset: ${node.name} -> ${asset.resolvedPath}`);
        } else {
          this.state.currentImage = null;
          logger.error(`[ENGINE] Image asset not found: ${node.name}`);
        }
        this.state.position++;
      } else if (node.type === 'play_audio') {
        // Handle play audio asset
        const asset = cosmosAssets.getAsset('audio', node.name);
        if (asset) {
          this.state.currentAudio = asset;
          logger.info(`[ENGINE] Playing audio asset: ${node.name} -> ${asset.resolvedPath}`);
        } else {
          this.state.currentAudio = null;
          logger.error(`[ENGINE] Audio asset not found: ${node.name}`);
        }
        this.state.position++;
      } else if (node.type === 'show_video') {
        // Handle show video asset
        const asset = cosmosAssets.getAsset('video', node.name);
        if (asset) {
          this.state.currentVideo = asset;
          logger.info(`[ENGINE] Showing video asset: ${node.name} -> ${asset.resolvedPath}`);
        } else {
          this.state.currentVideo = null;
          logger.error(`[ENGINE] Video asset not found: ${node.name}`);
        }
        this.state.position++;
      } else if (node.type === 'choice') {
        // Stop at first choice, wait for user input
        break;
      } else {
        // Skip set nodes (they were already executed above) and any remaining if nodes
        this.state.position++;
      }
    }
    // Do NOT rewind position to last text node. Leave at first unprocessed node (choice or end).
  }

  // Helper: advance only one node, do not recurse
  advanceOne() {
    if (!this.state.scene) {
      this.state.error = 'No scene loaded.';
      logger.error('[ENGINE] advanceOne: No scene loaded.');
      return;
    }
    let node = this.state.scene.content[this.state.position];
    logger.debug('[ENGINE] advanceOne: Node', this.state.position, node ? node.type : 'undefined');
    if (node && node.type === 'if') {
      try {
        const branch = this.handleIf(node);
        this.state.scene.content.splice(this.state.position, 1, ...branch);
        logger.debug('[ENGINE] advanceOne: Processed IF, new content:', this.state.scene.content);
        return;
      } catch (e) {
        this.state.error = 'If/else error: ' + e.message;
        throw new Error(this.state.error);
      }
    }
    if (node && node.type === 'set') {
      logger.debug(`[ENGINE] handleSet: ${node.var} (before: ${this.state.vars[node.var] || this.state.stats[node.var] || this.state.inventory[node.var]})`);
      this.handleSet(node);
      logger.debug(`[ENGINE] handleSet: ${node.var} updated to ${this.state.vars[node.var] || this.state.stats[node.var] || this.state.inventory[node.var]}`);
    }
    this.state.position++;
  }

  // Start a new game at the given sceneId. Only call reset() if you want a true restart.
  start(sceneId, { reset = false } = {}) {
    try {
      if (reset) this.reset(); // Only reset if explicitly requested
      this.loadScene(sceneId);
      this.state.position = 0;
      // Removed redundant autoAdvanceToRenderable call here
    } catch (e) {
      this.state.error = 'Engine start error: ' + e.message;
      throw new Error(this.state.error);
    }
  }

  loadScene(sceneId) {
    const scene = this.ast.scenes[sceneId];
    if (!scene) {
      this.state.error = `Scene not found: ${sceneId}`;
      throw new Error(this.state.error);
    }
    // --- FIX: Clear assets at the start of every scene ---
    this.state.currentImage = null;
    this.state.currentVideo = null;
    this.state.currentAudio = null;
    logger.banner('='.repeat(80));
    logger.banner(`[ENGINE] 🎭 LOADING SCENE: ${sceneId}`);
    logger.banner('='.repeat(80));
    logger.debug('[ENGINE] State BEFORE scene init:', JSON.stringify({vars: this.state.vars, stats: this.state.stats, inventory: this.state.inventory}));
    this.state.scene = {
      ...scene,
      content: deepClone(scene.content),
      _setNodesExecuted: false
    };
    this.state.sceneId = sceneId;
    // Only set scene.vars if not already present
    if (scene.vars) {
      for (const key in scene.vars) {
        if (!(key in this.state.vars)) {
          this.state.vars[key] = scene.vars[key];
          logger.debug(`[ENGINE] Init var: ${key} = ${scene.vars[key]}`);
        }
      }
    }
    // Only set scene.stats if not already present
    if (scene.stats) {
      for (const key in scene.stats) {
        if (!(key in this.state.stats)) {
          this.state.stats[key] = scene.stats[key];
          logger.debug(`[ENGINE] Init stat: ${key} = ${scene.stats[key]}`);
        }
      }
    }
    // Only set scene.inventory if not already present
    if (scene.inventory) {
      for (const key in scene.inventory) {
        if (!(key in this.state.inventory)) {
          this.state.inventory[key] = scene.inventory[key];
          logger.debug(`[ENGINE] Init inventory: ${key} = ${scene.inventory[key]}`);
        }
      }
    }
    logger.debug('[ENGINE] State AFTER scene init:', JSON.stringify({vars: this.state.vars, stats: this.state.stats, inventory: this.state.inventory}));
    // Merge global events and achievements (do not overwrite)
    this.state.events = { ...this.state.events, ...this.globalState.events };
    this.state.achievements = { ...this.state.achievements, ...this.globalState.achievements };
    this.state.macros = { ...this.globalState.macros };
    this.state.position = 0;
    this.autoAdvanceToRenderable();
    logger.banner('='.repeat(80));
    logger.banner(`[ENGINE] ✅ SCENE COMPLETE: ${sceneId}`);
    logger.banner('='.repeat(80));
  }

  getCurrentContent() {
    if (!this.state.scene) {
      this.state.error = 'No scene loaded.';
      return null;
    }
    return this.state.scene.content[this.state.position];
  }

  advance() {
    if (!this.state.scene) {
      this.state.error = 'No scene loaded.';
      return;
    }
    this.state.position++;
    // Removed redundant autoAdvanceToRenderable call here
  }

  choose(index) {
    if (!this.state.scene) {
      this.state.error = 'No scene loaded.';
      throw new Error(this.state.error);
    }
    const choices = [];
    for (let i = 0; i < this.state.scene.content.length; i++) {
      const node = this.state.scene.content[i];
      if (node.type === 'choice') choices.push({ node, idx: i });
    }
    if (choices.length === 0) {
      this.state.error = 'No choices available in this scene.';
      throw new Error(this.state.error);
    }
    if (index < 0 || index >= choices.length) {
      this.state.error = 'Invalid choice index.';
      throw new Error(this.state.error);
    }
    const choice = choices[index].node;
    logger.debug('[ENGINE] choose:', index, 'Choice:', choice.text, 'Target:', choice.target, 'Tags:', choice.tags);
    
    this.handleTags(choice);
    this.state.log.push({ type: 'choice', text: choice.text, target: choice.target, tags: choice.tags });
    this.loadScene(choice.target);
    this.state.position = 0;
    
    // Set nodes are now executed in autoAdvanceToRenderable, so we don't need to execute them again here
    // The autoAdvanceToRenderable method will handle set execution and if node processing
  }

  handleChoice(node) {
    if (!node || node.type !== 'choice') return null;
    this.handleTags(node);
    return node;
  }

  executeSetNodesInScene() {
    if (!this.state.scene || !this.state.scene.content) return;
    
    // Prevent multiple executions of set nodes for the same scene
    if (this.state.scene._setNodesExecuted) {
      logger.debug('[ENGINE] Set nodes already executed for this scene, skipping');
      logger.debug('[ENGINE] Stack trace:', new Error().stack);
      return;
    }
    
    logger.debug('[ENGINE] Executing set nodes in scene');
    logger.debug('[ENGINE] Current scene ID:', this.state.sceneId);
    
    // Store the original variable state before executing set nodes
    const originalVars = { ...this.state.vars };
    logger.debug('[ENGINE] Original variables before set execution:', originalVars);
    
    // Recursively find and execute all set nodes in the scene content
    this.executeSetNodesRecursive(this.state.scene.content);
    
    // After executing set nodes, re-process text nodes to update variable interpolation
    logger.debug('[ENGINE] Re-processing text nodes after set execution');
    logger.debug('[ENGINE] Variables after set execution:', this.state.vars);
    
    // Store the original variables for use in reinterpolateTextNodes
    this.originalVarsBeforeSet = originalVars;
    
    // Mark this scene as having executed set nodes
    this.state.scene._setNodesExecuted = true;
  }

  executeSetNodesRecursive(content) {
    if (!content || !Array.isArray(content)) return;
    
    let setExecuted = false;
    logger.debug(`[ENGINE] executeSetNodesRecursive: Processing ${content.length} nodes`);
    
    for (let i = 0; i < content.length; i++) {
      const node = content[i];
      if (!node) continue;
      
      logger.debug(`[ENGINE] executeSetNodesRecursive: Node ${i}: type=${node.type}, var=${node.var}, expr=${node.expr}`);
      
      if (node.type === 'set') {
        logger.debug(`[ENGINE] 🔥 EXECUTING SET NODE: ${node.var} = ${node.expr}`);
        logger.debug(`[ENGINE] Before set: ${node.var} = ${this.state.vars[node.var] || 'undefined'}`);
        this.handleSet(node);
        logger.debug(`[ENGINE] After set: ${node.var} = ${this.state.vars[node.var] || 'undefined'}`);
        setExecuted = true;
      } else if (node.type === 'if') {
        // Recursively process set nodes inside if blocks
        if (node.then && Array.isArray(node.then)) {
          logger.debug(`[ENGINE] Recursively processing set nodes in if.then branch`);
          this.executeSetNodesRecursive(node.then);
        }
        if (node.else && Array.isArray(node.else)) {
          logger.debug(`[ENGINE] Recursively processing set nodes in if.else branch`);
          this.executeSetNodesRecursive(node.else);
        }
      }
    }
    // After any set node execution, re-interpolate all text nodes in the scene
    if (setExecuted) {
      logger.debug('[ENGINE] Re-interpolating text nodes after set execution in executeSetNodesRecursive');
      this.reinterpolateTextNodes();
    }
  }

  processIfBlocksAfterSetExecution() {
    if (!this.state.scene || !this.state.scene.content) return;
    
    logger.debug('[ENGINE] Processing if/else blocks after set execution');
    
    // Process if nodes (expand them) after set nodes are executed
    let i = 0;
    while (i < this.state.scene.content.length) {
      let node = this.state.scene.content[i];
      if (!node) {
        i++;
        continue;
      }
      if (node.type === 'if') {
        try {
          logger.debug(`[ENGINE] Processing if block at index ${i}: ${node.condition}`);
          const branch = this.handleIf(node);
          this.state.scene.content.splice(i, 1, ...branch);
          logger.debug('[ENGINE] If block processed, new content length:', this.state.scene.content.length);
          continue; // Don't increment i, process the expanded content
        } catch (e) {
          this.state.error = 'If/else error: ' + e.message;
          throw new Error(this.state.error);
        }
      } else {
        i++;
      }
    }
  }

  reinterpolateTextNodes() {
    if (!this.state.scene || !this.state.scene.content) return;
    
    logger.debug('[ENGINE] Re-interpolating text nodes with updated variables');
    
    // Find the first and last set node positions
    let firstSetNodeIndex = -1;
    let lastSetNodeIndex = -1;
    for (let i = 0; i < this.state.scene.content.length; i++) {
      const node = this.state.scene.content[i];
      if (node && node.type === 'set') {
        if (firstSetNodeIndex === -1) firstSetNodeIndex = i;
        lastSetNodeIndex = i;
      }
    }
    
    logger.debug(`[ENGINE] First set node at index: ${firstSetNodeIndex}, Last set node at index: ${lastSetNodeIndex}`);
    
    // Interpolate ALL text nodes with updated variables after set nodes are executed
    for (let i = 0; i < this.state.scene.content.length; i++) {
      const node = this.state.scene.content[i];
      if (node && node.type === 'text') {
        const originalValue = node.value;
        const interpolatedValue = this.interpolateVariables(originalValue);
        if (originalValue !== interpolatedValue) {
          logger.debug(`[ENGINE] Re-interpolation at index ${i}: "${originalValue}" -> "${interpolatedValue}"`);
          node.value = interpolatedValue;
        }
      }
    }
  }

  handleSet(node) {
    if (!node || node.type !== 'set') return;
    const varName = node.var;
    const expr = node.expr;
    let target = null;
    if (this.state.vars.hasOwnProperty(varName)) target = this.state.vars;
    else if (this.state.stats.hasOwnProperty(varName)) target = this.state.stats;
    else if (this.state.inventory.hasOwnProperty(varName)) target = this.state.inventory;
    else {
      target = this.state.vars;
    }
    try {
      // Check if this is a macro call (contains function call syntax)
      const macroMatch = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
      if (macroMatch) {
        const macroName = macroMatch[1];
        const argsStr = macroMatch[2];
        const args = argsStr.split(',').map(arg => arg.trim());
        
        logger.debug(`[ENGINE] MACRO DEBUG: Detected macro call: ${macroName}(${argsStr})`);
        logger.debug(`[ENGINE] MACRO DEBUG: Parsed args:`, args);
        
        // Get macro definition
        const macroDef = this.state.macros[macroName] || this.globalState.macros[macroName];
        if (!macroDef) {
          logger.debug(`[ENGINE] MACRO DEBUG: Available macros:`, Object.keys(this.state.macros), Object.keys(this.globalState.macros));
          throw new Error(`Macro not found: ${macroName}`);
        }
        
        logger.debug(`[ENGINE] MACRO DEBUG: Found macro definition:`, macroDef);
        
        // Execute macro and get return value
        const context = { ...this.state.vars, ...this.state.stats, ...this.state.inventory };
        logger.debug(`[ENGINE] MACRO DEBUG: Context:`, context);
        
        const paramMap = {};
        if (macroDef.params && args && macroDef.params.length === args.length) {
          logger.debug(`[ENGINE] MACRO DEBUG: Processing ${macroDef.params.length} parameters`);
          for (let i = 0; i < macroDef.params.length; i++) {
            // Replace variable names with their values in arguments
            let argValue = args[i];
            argValue = argValue.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
              if (context.hasOwnProperty(name)) {
                return context[name];
              }
              return name;
            });
            paramMap[macroDef.params[i]] = argValue;
          }
        } else if (macroDef.params && macroDef.params.length > 0) {
          logger.debug(`[ENGINE] MACRO DEBUG: Parameter mismatch. Expected: ${macroDef.params.length}, Got: ${args ? args.length : 0}`);
          throw new Error(`Macro argument mismatch for ${macroName}`);
        }
        
        logger.debug(`[ENGINE] MACRO DEBUG: Final paramMap:`, paramMap);
        
        // Execute macro body
        let returnValue = null;
        if (macroDef.body && typeof macroDef.body === 'string') {
          logger.debug(`[ENGINE] MACRO DEBUG: Macro body:`, macroDef.body);
          let lines = macroDef.body.split(/\r?\n/).map(line => line.trim()).filter(l => l.length > 0);
          logger.debug(`[ENGINE] MACRO DEBUG: Parsed lines:`, lines);
          
          for (const l of lines) {
            if (l.startsWith('return ')) {
              let returnExpr = l.substring(7).trim();
              logger.debug(`[ENGINE] MACRO DEBUG: Found return statement: "${returnExpr}"`);
              
              // Replace parameters with their values
              let oldExpr = returnExpr;
              for (const param in paramMap) {
                returnExpr = returnExpr.replace(new RegExp(`\\b${param}\\b`, 'g'), paramMap[param]);
              }
              
              // Replace variable names with their values
              returnExpr = returnExpr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
                if (context.hasOwnProperty(name)) {
                  return context[name];
                }
                return name;
              });
              
              if (oldExpr !== returnExpr) {
                logger.debug(`[ENGINE] MACRO DEBUG: After variable replacement: "${oldExpr}" -> "${returnExpr}"`);
              }
              
              // Evaluate the return expression
              if (!/^[a-zA-Z0-9_+\-*/() .<>=!?\s:"]+$/.test(returnExpr)) {
                logger.debug(`[ENGINE] MACRO DEBUG: Unsafe expression detected: "${returnExpr}"`);
                throw new Error('Unsafe or invalid macro return expression: ' + returnExpr);
              }
              
              returnValue = eval(returnExpr);
              break;
            }
          }
        }
        
        if (returnValue !== null) {
          logger.debug(`[ENGINE] MACRO DEBUG: Setting ${varName} = ${returnValue} (from macro ${macroName})`);
          target[varName] = String(returnValue);
          logger.debug(`[ENGINE] MACRO DEBUG: ${varName} updated to ${target[varName]}`);
        } else {
          logger.debug(`[ENGINE] MACRO DEBUG: No return value found in macro ${macroName}`);
          throw new Error(`Macro ${macroName} did not return a value`);
        }
        // --- AUTO-CLAMPING LOGIC (after macro set) ---
        this._autoClampVars(varName, target);
      } else {
        // Regular expression evaluation (existing logic)
        const context = { ...this.state.vars, ...this.state.stats, ...this.state.inventory };
        
        // Handle string literals (quoted strings)
        if (/^".*"$/.test(expr.trim())) {
          const value = expr.trim().slice(1, -1); // Remove quotes
          if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} = "${value}" (string literal)`);
          target[varName] = value;
          if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} updated to ${target[varName]}`);
          this._autoClampVars(varName, target);
          return;
        }
        
        // Handle boolean literals
        if (expr.trim() === 'true' || expr.trim() === 'false') {
          const value = expr.trim() === 'true';
          if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} = ${value} (boolean literal)`);
          target[varName] = String(value);
          if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} updated to ${target[varName]}`);
          this._autoClampVars(varName, target);
          return;
        }
        
        // Handle variable references and mathematical expressions
        const safeExpr = expr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
          if (context.hasOwnProperty(name)) {
            const value = context[name];
            // If the value is a string that doesn't look like a number or boolean, quote it
            if (typeof value === 'string' && isNaN(Number(value)) && value !== 'true' && value !== 'false') {
              return `"${value}"`;
            }
            return value;
          }
          return name;
        });
        
        // Allow mathematical expressions, comparison operators, quotes, and remaining variable names
        if (!/^[a-zA-Z0-9_+\-*/() .<>=!"\s]+$/.test(safeExpr)) {
          throw new Error('Unsafe or invalid set expression: ' + expr);
        }
        
        const value = eval(safeExpr);
        if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} = ${value} (before: ${target[varName]})`);
        target[varName] = String(value);
        if (ENGINE_DEBUG) logger.debug(`[ENGINE] handleSet: ${varName} updated to ${target[varName]}`);
        // --- AUTO-CLAMPING LOGIC (after regular set) ---
        this._autoClampVars(varName, target);
      }
    } catch (e) {
      this.state.error = 'Set statement error: ' + e.message;
      throw new Error(this.state.error);
    }
    this.handleTags(node);
  }

  // --- AUTO-CLAMPING UTILITY ---
  _autoClampVars(varName, target) {
    // Clamp enemyHealth, enemyDamage, playerDamage to >= 0
    if (["enemyHealth", "enemyDamage", "playerDamage"].includes(varName)) {
      const n = Number(target[varName]);
      if (isNaN(n) || n < 0) {
        target[varName] = "0";
        logger.debug(`[ENGINE] AUTO-CLAMP: ${varName} clamped to 0`);
      }
    }
    // Clamp questProgress to <= 3
    if (varName === "questProgress") {
      const n = Number(target[varName]);
      if (!isNaN(n) && n > 3) {
        target[varName] = "3";
        logger.debug(`[ENGINE] AUTO-CLAMP: questProgress clamped to 3`);
      }
    }
  }

  handleText(node) {
    if (!node || node.type !== 'text') return '';
    this.handleTags(node);
    return this.interpolateVariables(node.value);
  }

  handleIf(node) {
    if (!node || node.type !== 'if') return [];
    // Evaluate the condition in the context of current state
    const context = { ...this.state.vars, ...this.state.stats, ...this.state.inventory };
    let cond = node.condition;
    logger.debug('[ENGINE] Evaluating condition:', {
      original: node.condition,
      context: context,
      has_sword: context.has_sword,
      has_sword_type: typeof context.has_sword
    });
    // Replace 'and' with '&&' and 'or' with '||' for JavaScript evaluation
    cond = cond.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||');
    
    // Replace variable names with their values, properly quoting strings
    cond = cond.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
      if (context.hasOwnProperty(name)) {
        const value = context[name];
        // If the value is a string that doesn't look like a number or boolean, quote it
        if (typeof value === 'string' && isNaN(Number(value)) && value !== 'true' && value !== 'false') {
          return `"${value}"`;
        }
        return value;
      }
      return name;
    });
    logger.debug('[ENGINE] Condition after replacement:', cond);
    let result = false;
    try {
      // Allow letters, quotes, comparison operators, and logical operators for conditions
      if (!/^[a-zA-Z0-9_+\-*/() .<>=!"\s&|]+$/.test(cond)) {
        throw new Error('Unsafe or invalid if condition: ' + node.condition);
      }
      result = eval(cond);
    } catch (e) {
      this.state.error = 'If/else condition error: ' + e.message;
      throw new Error(this.state.error);
    }
    if (result) {
      return node.then || [];
    } else {
      return node.else || [];
    }
  }

  handleMacro(node, args = []) {
    if (!node || node.type !== 'macro') return;
    const macroName = node.name;
    const macroDef = this.state.macros[macroName] || this.globalState.macros[macroName];
    if (!macroDef) {
      this.state.error = `Macro not found: ${macroName}`;
      throw new Error(this.state.error);
    }
    if (this.state.callStack.length > 16) {
      this.state.error = 'Macro call stack overflow';
      throw new Error(this.state.error);
    }
    const paramMap = {};
    if (macroDef.params && args && macroDef.params.length === args.length) {
      for (let i = 0; i < macroDef.params.length; i++) {
        paramMap[macroDef.params[i]] = args[i];
      }
    } else if (macroDef.params && macroDef.params.length > 0) {
      this.state.error = `Macro argument mismatch for ${macroName}`;
      throw new Error(this.state.error);
    }
    this.state.callStack.push(macroName);
    let macroNodes = [];
    if (macroDef.body && typeof macroDef.body === 'string') {
      let lines = macroDef.body.split(/\r?\n/).map(line => line.trim()).filter(l => l.length > 0);
      macroNodes = [];
      for (const l of lines) {
        if (l.startsWith('set ')) macroNodes.push(parseSet(l));
        else if (l.startsWith('text:') || (l.startsWith('"') && l.endsWith('"'))) macroNodes.push(parseText(l));
      }
    }
    for (const node of macroNodes) {
      if (node.type === 'set' && node.expr) {
        for (const param in paramMap) {
          node.expr = node.expr.replace(new RegExp(`\\b${param}\\b`, 'g'), paramMap[param]);
        }
      }
      if (node.type === 'text' && node.value) {
        for (const param in paramMap) {
          node.value = node.value.replace(new RegExp(`\\{${param}\\}`, 'g'), paramMap[param]);
        }
      }
    }
    for (const node of macroNodes) {
      if (node.type === 'set') this.handleSet(node);
      else if (node.type === 'text') this.handleText(node);
    }
    this.state.log.push({ type: 'macro', name: macroName, args });
    this.state.callStack.pop();
  }

  handleTags(node) {
    if (!node || !node.tags || !Array.isArray(node.tags)) return;
    for (const tag of node.tags) {
      if (tag.startsWith('LOG:')) {
        this.state.log.push({ type: 'log', message: tag.substring(4).trim() });
      } else if (tag.startsWith('ACHIEVEMENT:')) {
        const ach = tag.substring(12).trim();
        this.state.achievements[ach] = true;
        this.state.log.push({ type: 'achievement', name: ach });
      } else if (tag.startsWith('inventory ++')) {
        const item = tag.substring(12).trim();
        this.state.inventory[item] = (parseInt(this.state.inventory[item] || '0', 10) + 1).toString();
        this.state.log.push({ type: 'inventory', op: 'add', item });
      } else if (tag.startsWith('inventory --')) {
        const item = tag.substring(12).trim();
        this.state.inventory[item] = Math.max(0, parseInt(this.state.inventory[item] || '0', 10) - 1).toString();
        this.state.log.push({ type: 'inventory', op: 'remove', item });
      } else if (tag.startsWith('EVENT:')) {
        const ev = tag.substring(6).trim();
        this.state.events[ev] = true;
        this.state.log.push({ type: 'event', name: ev });
      } else {
        this.state.log.push({ type: 'tag', value: tag });
      }
    }
  }

  // handleEvent and handleAchievement are stubs for future expansion.
  handleEvent(node) {
    // Not needed for MVP. Events are handled via tags.
  }

  handleAchievement(node) {
    // Not needed for MVP. Achievements are handled via tags.
  }

  interpolateVariables(text) {
    if (typeof text !== 'string') return text;
    const context = { ...this.state.vars, ...this.state.stats, ...this.state.inventory };
    const result = text.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, varName) => {
      if (context.hasOwnProperty(varName)) {
        return context[varName];
      }
      return match;
    });
    return result;
  }

  getMeta() {
    return this.meta;
  }

  getError() {
    return this.state.error;
  }

  getState() {
    // For UI integration: return a snapshot of all engine state
    return {
      scene: this.state.scene,
      sceneId: this.state.sceneId,
      position: this.state.position,
      vars: { ...this.state.vars },
      stats: { ...this.state.stats },
      inventory: { ...this.state.inventory },
      events: { ...this.state.events },
      achievements: { ...this.state.achievements },
      log: [ ...this.state.log ],
      error: this.state.error,
      meta: this.meta,
      currentImage: this.state.currentImage || null,
      currentAudio: this.state.currentAudio || null,
      currentVideo: this.state.currentVideo || null
    };
  }

  reset() {
    this.state = this._initialState();
    this.state.macros = { ...this.globalState.macros };
    this.state.vars = { ...this.globalState.vars };
    this.state.stats = { ...this.globalState.stats };
    this.state.inventory = { ...this.globalState.inventory };
    this.state.events = { ...this.globalState.events };
    this.state.achievements = { ...this.globalState.achievements };
    this.state.log = [];
    this.state.error = null;
  }
}



