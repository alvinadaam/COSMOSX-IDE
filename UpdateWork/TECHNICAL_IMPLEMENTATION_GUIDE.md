# COSMOSX TECHNICAL IMPLEMENTATION GUIDE
## Detailed Implementation Specifications for All Planned Features

---

## 🚀 **PHASE 1: CORE ENGINE ENHANCEMENTS**

### **1.1 Loop Constructs Implementation**

#### **Parser Extensions** (`parser.js`)

**New Node Types**:
```javascript
// Add to parseSceneContent function
if (trimmed.startsWith('loop ')) {
  const loopNode = parseLoop(trimmed, lines, i);
  if (loopNode) content.push(loopNode);
  i = loopNode.nextIndex;
  continue;
}

if (trimmed.startsWith('while ')) {
  const whileNode = parseWhile(trimmed, lines, i);
  if (whileNode) content.push(whileNode);
  i = whileNode.nextIndex;
  continue;
}
```

**Loop Parser Functions**:
```javascript
function parseLoop(line, lines, startIndex) {
  const match = line.match(/loop\s+(\d+)\s*\{/);
  if (!match) return null;
  
  const iterations = parseInt(match[1]);
  let i = startIndex;
  let bodyLines = [];
  let braceCount = 1;
  
  i++;
  while (i < lines.length && braceCount > 0) {
    let l = lines[i];
    if (l.includes('{')) braceCount++;
    if (l.includes('}')) braceCount--;
    if (braceCount === 0) { i++; break; }
    bodyLines.push(l);
    i++;
  }
  
  return {
    loopNode: {
      type: 'loop',
      iterations: iterations,
      body: parseSceneContent(bodyLines)
    },
    nextIndex: i
  };
}

function parseWhile(line, lines, startIndex) {
  const match = line.match(/while\s+(.+?)\s*\{/);
  if (!match) return null;
  
  const condition = match[1];
  let i = startIndex;
  let bodyLines = [];
  let braceCount = 1;
  
  i++;
  while (i < lines.length && braceCount > 0) {
    let l = lines[i];
    if (l.includes('{')) braceCount++;
    if (l.includes('}')) braceCount--;
    if (braceCount === 0) { i++; break; }
    bodyLines.push(l);
    i++;
  }
  
  return {
    whileNode: {
      type: 'while',
      condition: condition,
      body: parseSceneContent(bodyLines)
    },
    nextIndex: i
  };
}
```

#### **Engine Execution** (`engine.js`)

**Loop Handling in autoAdvanceToRenderable**:
```javascript
autoAdvanceToRenderable() {
  while (this.state.position < this.state.scene.content.length) {
    let node = this.state.scene.content[this.state.position];
    
    if (node.type === 'loop') {
      // Process loop node
      this.handleLoop(node);
      continue;
    } else if (node.type === 'while') {
      // Process while node
      this.handleWhile(node);
      continue;
    }
    // ... existing logic
  }
}

handleLoop(node) {
  const iterations = parseInt(node.iterations);
  const body = node.body;
  
  // Expand loop body multiple times
  const expandedContent = [];
  for (let i = 0; i < iterations; i++) {
    // Deep clone body content to avoid reference issues
    const clonedBody = deepClone(body);
    
    // Add loop iteration context
    clonedBody.forEach(item => {
      if (item.type === 'set' && item.expr.includes('loop_index')) {
        item.expr = item.expr.replace('loop_index', i.toString());
      }
    });
    
    expandedContent.push(...clonedBody);
  }
  
  // Replace loop node with expanded content
  this.state.scene.content.splice(this.state.position, 1, ...expandedContent);
}

handleWhile(node) {
  const condition = node.condition;
  const body = node.body;
  
  // Evaluate condition
  const context = { ...this.state.vars, ...this.state.stats, ...this.state.inventory };
  let cond = condition.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
    if (context.hasOwnProperty(name)) return context[name];
    return name;
  });
  
  let result = false;
  try {
    if (!/^[-+*/() 0-9.<>=!\s]+$/.test(cond)) {
      throw new Error('Unsafe while condition: ' + condition);
    }
    result = eval(cond);
  } catch (e) {
    this.state.error = 'While condition error: ' + e.message;
    throw new Error(this.state.error);
  }
  
  if (result) {
    // Expand while body
    const clonedBody = deepClone(body);
    this.state.scene.content.splice(this.state.position, 1, ...clonedBody);
  } else {
    // Skip while node
    this.state.position++;
  }
}
```

#### **Syntax Highlighting** (`coslang-syntax.js`)

**Add Loop Keywords**:
```javascript
// Add to tokenizer root array
[/^loop\s+\d+\s*\{/, 'keyword.loop'],
[/^while\s+.+\s*\{/, 'keyword.loop'],

// Add to theme rules
{ token: 'keyword.loop', foreground: 'ff69b4', fontStyle: 'bold' },
```

### **1.2 Enhanced Macro System**

#### **Macro Return Values** (`engine.js`)

**Enhanced Macro Handling**:
```javascript
handleMacro(node, args = []) {
  // ... existing validation code ...
  
  let returnValue = null;
  if (macroDef.body && typeof macroDef.body === 'string') {
    let lines = macroDef.body.split(/\r?\n/).map(line => line.trim()).filter(l => l.length > 0);
    
    for (const l of lines) {
      if (l.startsWith('return ')) {
        let returnExpr = l.substring(7).trim();
        
        // Replace parameters with their values
        for (const param in paramMap) {
          returnExpr = returnExpr.replace(new RegExp(`\\b${param}\\b`, 'g'), paramMap[param]);
        }
        
        // Replace variable names with their values
        returnExpr = returnExpr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (name) => {
          if (context.hasOwnProperty(name)) return context[name];
          return name;
        });
        
        // Evaluate the return expression safely
        if (!/^[-+*/() 0-9.\s?<>:]+$/.test(returnExpr)) {
          throw new Error('Unsafe macro return expression: ' + returnExpr);
        }
        
        returnValue = eval(returnExpr);
        break;
      }
    }
  }
  
  return returnValue;
}
```

**Macro Call in Set Statements**:
```javascript
handleSet(node) {
  // ... existing code ...
  
  // Check if this is a macro call
  const macroMatch = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
  if (macroMatch) {
    const macroName = macroMatch[1];
    const argsStr = macroMatch[2];
    const args = argsStr.split(',').map(arg => arg.trim());
    
    // Execute macro and get return value
    const returnValue = this.handleMacro({ name: macroName, params: args }, args);
    
    if (returnValue !== null) {
      target[varName] = String(returnValue);
    } else {
      throw new Error(`Macro ${macroName} did not return a value`);
    }
  }
  // ... existing expression handling ...
}
```

### **1.3 Web Worker Integration**

#### **Worker Setup** (`web-worker-setup.js`)

**Create New File**:
```javascript
// web-worker-setup.js
export class WebWorkerManager {
  constructor() {
    this.workers = new Map();
    this.workerId = 0;
  }
  
  createWorker(script, options = {}) {
    const workerId = `worker_${this.workerId++}`;
    
    // Create worker with error handling
    const worker = new Worker(script, options);
    
    worker.onerror = (error) => {
      console.error(`Worker ${workerId} error:`, error);
    };
    
    worker.onmessageerror = (error) => {
      console.error(`Worker ${workerId} message error:`, error);
    };
    
    this.workers.set(workerId, worker);
    return { workerId, worker };
  }
  
  terminateWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerId);
    }
  }
  
  terminateAll() {
    this.workers.forEach(worker => worker.terminate());
    this.workers.clear();
  }
}
```

#### **Parser Worker** (`parser-worker.js`)

**Create New File**:
```javascript
// parser-worker.js
importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/editor/editor.main.js');

self.onmessage = function(e) {
  const { type, data, id } = e.data;
  
  try {
    switch (type) {
      case 'parse':
        const result = parseCosLang(data.coslangText);
        self.postMessage({ type: 'parse_result', result, id });
        break;
        
      case 'validate':
        const diagnostics = validateStory(data.ast);
        self.postMessage({ type: 'validation_result', diagnostics, id });
        break;
        
      case 'analyze':
        const analysis = analyzeStory(data.ast);
        self.postMessage({ type: 'analysis_result', analysis, id });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message, 
      stack: error.stack, 
      id 
    });
  }
};

// Import parser functions (simplified for worker)
function parseCosLang(text) {
  // Simplified parser implementation for worker
  // This would be a streamlined version of the main parser
}

function validateStory(ast) {
  // Story validation logic
}

function analyzeStory(ast) {
  // Story analysis logic
}
```

#### **Integration with Engine** (`engine.js`)

**Worker Integration**:
```javascript
import { WebWorkerManager } from './web-worker-setup.js';

export class CosmosEngine {
  constructor(ast) {
    // ... existing initialization ...
    
    this.workerManager = new WebWorkerManager();
    this.setupWorkers();
  }
  
  setupWorkers() {
    // Create parser worker
    const { workerId, worker } = this.workerManager.createWorker('./parser-worker.js');
    this.parserWorker = { workerId, worker };
    
    // Setup message handling
    worker.onmessage = (e) => this.handleWorkerMessage(e);
  }
  
  handleWorkerMessage(e) {
    const { type, result, diagnostics, analysis, error, id } = e.data;
    
    switch (type) {
      case 'parse_result':
        this.handleParseResult(result, id);
        break;
      case 'validation_result':
        this.handleValidationResult(diagnostics, id);
        break;
      case 'analysis_result':
        this.handleAnalysisResult(analysis, id);
        break;
      case 'error':
        console.error('Worker error:', error);
        break;
    }
  }
  
  // Async parsing method
  async parseAsync(coslangText) {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      
      // Setup response handler
      const responseHandler = (e) => {
        if (e.data.id === requestId) {
          if (e.data.type === 'parse_result') {
            resolve(e.data.result);
          } else if (e.data.type === 'error') {
            reject(new Error(e.data.error));
          }
          // Clean up handler
          this.parserWorker.worker.removeEventListener('message', responseHandler);
        }
      };
      
      this.parserWorker.worker.addEventListener('message', responseHandler);
      
      // Send parse request
      this.parserWorker.worker.postMessage({
        type: 'parse',
        coslangText,
        id: requestId
      });
    });
  }
}
```

---

## 🎨 **PHASE 2: IDE ENHANCEMENTS**

### **2.1 Intelligent Code Completion**

#### **Enhanced Autocomplete** (`autocomplete-enhanced.js`)

**Create New File**:
```javascript
// autocomplete-enhanced.js
export class EnhancedAutocomplete {
  constructor(ide) {
    this.ide = ide;
    this.context = this.buildContext();
  }
  
  buildContext() {
    return {
      variables: this.extractVariables(),
      scenes: this.extractScenes(),
      assets: this.extractAssets(),
      macros: this.extractMacros(),
      patterns: this.extractPatterns()
    };
  }
  
  extractVariables() {
    if (!this.ide.engine) return [];
    
    const state = this.ide.engine.getState();
    const variables = [];
    
    // Extract from vars
    Object.keys(state.vars || {}).forEach(key => {
      variables.push({ name: key, type: 'var', value: state.vars[key] });
    });
    
    // Extract from stats
    Object.keys(state.stats || {}).forEach(key => {
      variables.push({ name: key, type: 'stat', value: state.stats[key] });
    });
    
    // Extract from inventory
    Object.keys(state.inventory || {}).forEach(key => {
      variables.push({ name: key, type: 'inventory', value: state.inventory[key] });
    });
    
    return variables;
  }
  
  extractScenes() {
    if (!this.ide.engine || !this.ide.engine.ast) return [];
    
    return Object.keys(this.ide.engine.ast.scenes || {}).map(id => ({
      id,
      description: this.getSceneDescription(id)
    }));
  }
  
  extractAssets() {
    if (!this.ide.assetManager) return [];
    
    const assets = [];
    this.ide.assetManager.assets.images.forEach(img => {
      assets.push({ name: img.name, type: 'image', url: img.url });
    });
    this.ide.assetManager.assets.audio.forEach(audio => {
      assets.push({ name: audio.name, type: 'audio', url: audio.url });
    });
    
    return assets;
  }
  
  getCompletions(position, model) {
    const line = model.getLineContent(position.lineNumber);
    const word = this.getCurrentWord(position, model);
    
    const completions = [];
    
    // Context-aware completions
    if (this.isInChoiceContext(line)) {
      completions.push(...this.getChoiceCompletions());
    } else if (this.isInSetContext(line)) {
      completions.push(...this.getSetCompletions());
    } else if (this.isInIfContext(line)) {
      completions.push(...this.getIfCompletions());
    } else if (this.isInAssetContext(line)) {
      completions.push(...this.getAssetCompletions());
    }
    
    // Variable completions
    completions.push(...this.getVariableCompletions(word));
    
    // Scene completions
    completions.push(...this.getSceneCompletions(word));
    
    // Macro completions
    completions.push(...this.getMacroCompletions(word));
    
    return completions;
  }
  
  isInChoiceContext(line) {
    return line.trim().startsWith('choice');
  }
  
  isInSetContext(line) {
    return line.trim().startsWith('set');
  }
  
  isInIfContext(line) {
    return line.trim().startsWith('if') || line.includes('} else');
  }
  
  isInAssetContext(line) {
    return line.trim().startsWith('show') || line.trim().startsWith('play');
  }
  
  getChoiceCompletions() {
    return [
      {
        label: 'choice "Choice text" -> target_scene',
        insertText: 'choice "${1:Choice text}" -> ${2:target_scene}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Player choice with scene navigation',
        documentation: 'Creates a player choice that navigates to another scene'
      }
    ];
  }
  
  getSetCompletions() {
    return [
      {
        label: 'set variable = expression',
        insertText: 'set ${1:variable} = ${2:expression}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Variable assignment',
        documentation: 'Assigns a value to a variable'
      }
    ];
  }
  
  getVariableCompletions(word) {
    return this.context.variables
      .filter(v => v.name.toLowerCase().includes(word.toLowerCase()))
      .map(v => ({
        label: v.name,
        insertText: v.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: `${v.type}: ${v.value}`,
        documentation: `Variable of type ${v.type}`
      }));
  }
  
  getSceneCompletions(word) {
    return this.context.scenes
      .filter(s => s.id.toLowerCase().includes(word.toLowerCase()))
      .map(s => ({
        label: s.id,
        insertText: s.id,
        kind: monaco.languages.CompletionItemKind.Reference,
        detail: 'Scene reference',
        documentation: s.description || `Scene: ${s.id}`
      }));
  }
}
```

#### **Integration with Monaco** (`monaco-setup.js`)

**Enhanced Monaco Setup**:
```javascript
// Add to monaco-setup.js
import { EnhancedAutocomplete } from './autocomplete-enhanced.js';

// After editor creation
if (window.ide) {
  const enhancedAutocomplete = new EnhancedAutocomplete(window.ide);
  
  // Register enhanced autocomplete
  monaco.languages.registerCompletionItemProvider('coslang', {
    provideCompletionItems: (model, position) => {
      return enhancedAutocomplete.getCompletions(position, model);
    }
  });
}
```

### **2.2 Story Flow Visualizer**

#### **Flow Visualization Component** (`story-flow-visualizer.js`)

**Create New File**:
```javascript
// story-flow-visualizer.js
export class StoryFlowVisualizer {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.svg = null;
    this.nodes = new Map();
    this.edges = [];
    this.simulation = null;
    
    this.init();
  }
  
  init() {
    this.createSVG();
    this.loadStoryData();
    this.createSimulation();
    this.render();
  }
  
  createSVG() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 1200 800');
    
    // Add zoom support
    const zoom = d3.zoom()
      .on('zoom', (event) => {
        this.svg.selectAll('g').attr('transform', event.transform);
      });
    
    this.svg.call(zoom);
  }
  
  loadStoryData() {
    if (!this.engine || !this.engine.ast) return;
    
    const scenes = this.engine.ast.scenes;
    
    // Create nodes
    Object.keys(scenes).forEach((sceneId, index) => {
      const scene = scenes[sceneId];
      const node = {
        id: sceneId,
        x: 100 + (index % 4) * 250,
        y: 100 + Math.floor(index / 4) * 200,
        type: this.getSceneType(scene),
        content: scene.content || [],
        choices: this.extractChoices(scene)
      };
      
      this.nodes.set(sceneId, node);
    });
    
    // Create edges from choices
    this.nodes.forEach(node => {
      node.choices.forEach(choice => {
        if (this.nodes.has(choice.target)) {
          this.edges.push({
            source: node.id,
            target: choice.target,
            label: choice.text
          });
        }
      });
    });
  }
  
  getSceneType(scene) {
    if (scene.content) {
      const hasChoices = scene.content.some(item => item.type === 'choice');
      const hasText = scene.content.some(item => item.type === 'text');
      
      if (hasChoices && hasText) return 'interactive';
      if (hasChoices) return 'choice';
      if (hasText) return 'text';
    }
    return 'empty';
  }
  
  extractChoices(scene) {
    if (!scene.content) return [];
    
    return scene.content
      .filter(item => item.type === 'choice')
      .map(choice => ({
        text: choice.text,
        target: choice.target,
        tags: choice.tags || []
      }));
  }
  
  createSimulation() {
    this.simulation = d3.forceSimulation(Array.from(this.nodes.values()))
      .force('link', d3.forceLink(this.edges).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(600, 400))
      .force('collision', d3.forceCollide().radius(50));
  }
  
  render() {
    // Render edges
    const edges = this.svg.append('g')
      .selectAll('line')
      .data(this.edges)
      .enter()
      .append('line')
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');
    
    // Render nodes
    const nodes = this.svg.append('g')
      .selectAll('g')
      .data(Array.from(this.nodes.values()))
      .enter()
      .append('g')
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this)));
    
    // Add node circles
    nodes.append('circle')
      .attr('r', 30)
      .attr('fill', d => this.getNodeColor(d.type))
      .attr('stroke', '#333')
      .attr('stroke-width', 2);
    
    // Add node labels
    nodes.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');
    
    // Add edge labels
    this.svg.append('g')
      .selectAll('text')
      .data(this.edges)
      .enter()
      .append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .attr('font-size', '10px');
    
    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      edges
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }
  
  getNodeColor(type) {
    const colors = {
      'interactive': '#4CAF50',
      'choice': '#FF9800',
      'text': '#2196F3',
      'empty': '#9E9E9E'
    };
    return colors[type] || '#9E9E9E';
  }
  
  dragstarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  dragended(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
```

---

## 🔧 **PHASE 3: PLATFORM FEATURES**

### **3.1 Plugin System**

#### **Plugin Architecture** (`plugin-system.js`)

**Create New File**:
```javascript
// plugin-system.js
export class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.api = this.createAPI();
  }
  
  createAPI() {
    return {
      // Story lifecycle hooks
      onStoryLoad: (callback) => this.registerHook('storyLoad', callback),
      onSceneChange: (callback) => this.registerHook('sceneChange', callback),
      onChoiceMade: (callback) => this.registerHook('choiceMade', callback),
      
      // Engine modification hooks
      onVariableSet: (callback) => this.registerHook('variableSet', callback),
      onConditionEvaluate: (callback) => this.registerHook('conditionEvaluate', callback),
      
      // UI modification hooks
      onRenderScene: (callback) => this.registerHook('renderScene', callback),
      onRenderChoice: (callback) => this.registerHook('renderChoice', callback),
      
      // Utility functions
      getStoryData: () => this.engine?.getState(),
      getCurrentScene: () => this.engine?.state?.sceneId,
      setVariable: (name, value) => this.engine?.setVariable(name, value),
      logMessage: (message) => console.log(`[Plugin] ${message}`)
    };
  }
  
  registerHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }
  
  executeHook(hookName, data) {
    const callbacks = this.hooks.get(hookName) || [];
    callbacks.forEach(callback => {
      try {
        callback(data, this.api);
      } catch (error) {
        console.error(`Plugin hook error in ${hookName}:`, error);
      }
    });
  }
  
  registerPlugin(plugin) {
    if (typeof plugin.install !== 'function') {
      throw new Error('Plugin must have an install function');
    }
    
    try {
      plugin.install(this.api);
      this.plugins.set(plugin.name, plugin);
      console.log(`Plugin ${plugin.name} registered successfully`);
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.name}:`, error);
    }
  }
  
  unregisterPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin && typeof plugin.uninstall === 'function') {
      try {
        plugin.uninstall(this.api);
      } catch (error) {
        console.error(`Plugin uninstall error:`, error);
      }
    }
    
    this.plugins.delete(pluginName);
  }
  
  // Integration with engine
  setEngine(engine) {
    this.engine = engine;
    
    // Hook into engine events
    if (engine) {
      // Override engine methods to add hooks
      this.hookIntoEngine(engine);
    }
  }
  
  hookIntoEngine(engine) {
    // Hook into scene loading
    const originalLoadScene = engine.loadScene.bind(engine);
    engine.loadScene = (sceneId) => {
      const result = originalLoadScene(sceneId);
      this.executeHook('sceneChange', { sceneId, engine: engine });
      return result;
    };
    
    // Hook into choice handling
    const originalChoose = engine.choose.bind(engine);
    engine.choose = (index) => {
      const result = originalChoose(index);
      this.executeHook('choiceMade', { index, engine: engine });
      return result;
    };
    
    // Hook into variable setting
    const originalHandleSet = engine.handleSet.bind(engine);
    engine.handleSet = (node) => {
      const result = originalHandleSet(node);
      this.executeHook('variableSet', { node, engine: engine });
      return result;
    };
  }
}
```

#### **Example Plugin** (`example-plugin.js`)

**Create New File**:
```javascript
// example-plugin.js
export class ExamplePlugin {
  constructor() {
    this.name = 'ExamplePlugin';
    this.version = '1.0.0';
    this.description = 'Example plugin demonstrating plugin system capabilities';
  }
  
  install(api) {
    // Register hooks
    api.onStoryLoad((storyData) => {
      api.logMessage('Story loaded: ' + storyData.meta.title);
    });
    
    api.onSceneChange((data) => {
      api.logMessage('Scene changed to: ' + data.sceneId);
    });
    
    api.onChoiceMade((data) => {
      api.logMessage('Choice made: ' + data.index);
    });
    
    // Add custom functionality
    this.addCustomFeatures(api);
  }
  
  uninstall(api) {
    // Cleanup if needed
    api.logMessage('ExamplePlugin uninstalled');
  }
  
  addCustomFeatures(api) {
    // Add custom variables
    api.onVariableSet((data) => {
      if (data.node.var === 'health') {
        // Auto-heal when health is very low
        const health = parseInt(data.node.expr);
        if (health < 5) {
          api.setVariable('health', '10');
          api.logMessage('Auto-healed player due to low health');
        }
      }
    });
    
    // Add custom scene rendering
    api.onRenderScene((data) => {
      // Add custom UI elements
      this.addCustomUI(data);
    });
  }
  
  addCustomUI(data) {
    // Example: Add a custom status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'custom-status-bar';
    statusBar.innerHTML = `
      <div class="status-item">
        <span class="label">Custom Status:</span>
        <span class="value">Active</span>
      </div>
    `;
    
    // Insert into the scene
    const sceneContainer = document.querySelector('.story-container');
    if (sceneContainer) {
      sceneContainer.appendChild(statusBar);
    }
  }
}
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core Engine (Weeks 1-8)**
- [ ] **Loop Constructs**
  - [ ] Parser extensions for `loop` and `while`
  - [ ] Engine execution logic for loops
  - [ ] Syntax highlighting updates
  - [ ] Comprehensive testing

- [ ] **Enhanced Macros**
  - [ ] Return value support in macros
  - [ ] Macro calls in set statements
  - [ ] Parameter validation and error handling
  - [ ] Performance optimization

- [ ] **Web Worker Integration**
  - [ ] Worker manager setup
  - [ ] Parser worker implementation
  - [ ] Engine integration
  - [ ] Error handling and fallbacks

### **Phase 2: IDE Experience (Weeks 9-20)**
- [ ] **Intelligent Autocomplete**
  - [ ] Context-aware completion engine
  - [ ] Variable and scene suggestions
  - [ ] Monaco editor integration
  - [ ] Performance optimization

- [ ] **Story Flow Visualizer**
  - [ ] D3.js visualization component
  - [ ] Interactive node manipulation
  - [ ] Real-time updates
  - [ ] Export capabilities

- [ ] **Advanced Debugging**
  - [ ] Performance profiler
  - [ ] State inspector
  - [ ] Variable timeline
  - [ ] Error analysis tools

### **Phase 3: Platform Features (Weeks 21-32)**
- [ ] **Plugin System**
  - [ ] Plugin architecture
  - [ ] Hook system
  - [ ] API design
  - [ ] Example plugins

- [ ] **Cloud Integration**
  - [ ] Story hosting
  - [ ] User accounts
  - [ ] Story sharing
  - [ ] Community features

---

## 🔍 **TESTING STRATEGY**

### **Unit Testing**
```javascript
// Example test for loop constructs
describe('Loop Constructs', () => {
  test('should parse loop statements correctly', () => {
    const input = 'loop 3 { text: "Hello" }';
    const result = parseLoop(input);
    expect(result.type).toBe('loop');
    expect(result.iterations).toBe(3);
  });
  
  test('should execute loop body multiple times', () => {
    const engine = new CosmosEngine(ast);
    engine.loadScene('test_scene');
    
    // Verify loop execution
    expect(engine.state.vars.loop_counter).toBe(3);
  });
});
```

### **Integration Testing**
```javascript
// Example integration test
describe('Engine Integration', () => {
  test('should handle complex story with loops and macros', () => {
    const story = loadTestStory('complex-story.coslang');
    const engine = new CosmosEngine(story);
    
    // Test complete story flow
    engine.start('start');
    
    // Verify all scenes are reachable
    const reachableScenes = engine.getReachableScenes();
    expect(reachableScenes).toContain('end');
  });
});
```

### **Performance Testing**
```javascript
// Example performance test
describe('Performance', () => {
  test('should handle large stories efficiently', () => {
    const largeStory = generateLargeStory(1000); // 1000 scenes
    const startTime = performance.now();
    
    const engine = new CosmosEngine(largeStory);
    engine.start('start');
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(1000); // Should load in under 1 second
  });
});
```

---

## 📚 **RESOURCES & DEPENDENCIES**

### **Required Libraries**
- **D3.js**: For story flow visualization
- **Monaco Editor**: Enhanced editor capabilities
- **Web Workers**: Background processing
- **Test Framework**: Jest or Mocha for testing

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Webpack**: Module bundling and optimization
- **Babel**: Modern JavaScript support

### **Documentation**
- **JSDoc**: API documentation
- **Storybook**: Component documentation
- **API Blueprint**: API specification
- **User Guides**: End-user documentation

---

*This implementation guide provides the technical foundation for all planned COSMOSX enhancements. Each section includes working code examples and integration patterns.*
