import { parseCosLang } from '../parser.js';
import { CosmosEngine } from '../engine.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function testEngine() {
  const coslang = `
  title: "Test Story"
  author: "Test Author"
  version: "1.0"
scene intro {
  vars {
    hp = 10
    gold = 5
  }
  stats {
    strength = 3
  }
  inventory {
    sword = 1
  }
  text: "Hello, world!"
  set hp = 10
  choice "Go" -> next
}
scene next {
  text: "You advanced."
}
`;
  const ast = parseCosLang(coslang);
  const engine = new CosmosEngine(ast);
  engine.start('intro');
  // Metadata
  assert(engine.getMeta().title === 'Test Story', 'Metadata: title');
  assert(engine.getMeta().author === 'Test Author', 'Metadata: author');
  assert(engine.getMeta().version === '1.0', 'Metadata: version');
  // State
  assert(engine.state.vars.hp === '10', 'Vars: hp');
  assert(engine.state.stats.strength === '3', 'Stats: strength');
  assert(engine.state.inventory.sword === '1', 'Inventory: sword');
  // Content navigation
  let node = engine.getCurrentContent();
  assert(node.type === 'text', 'First node is text');
  engine.advance();
  node = engine.getCurrentContent();
  assert(node.type === 'set', 'Second node is set');
  engine.advance();
  node = engine.getCurrentContent();
  assert(node.type === 'choice', 'Third node is choice');
  // Choice handling and scene navigation
  engine.choose(0); // Choose the first (and only) choice
  node = engine.getCurrentContent();
  assert(engine.state.sceneId === 'next', 'Scene navigation: now in next scene');
  assert(node.type === 'text' && node.value.includes('advanced'), 'Scene navigation: correct content in next scene');
  console.log('Engine test: choice handling and scene navigation passed!');

  // If/else logic test
  const coslangIf = `
scene logic {
  vars {
    hp = 5
  }
  if hp > 0 {
    text: "Alive"
  } else {
    text: "Dead"
  }
}
`;
  const astIf = parseCosLang(coslangIf);
  const engineIf = new CosmosEngine(astIf);
  engineIf.start('logic');
  engineIf.advance(); // Process the if node
  let nodeIf = engineIf.getCurrentContent();
  // Should flatten the if and only show the correct branch
  assert(nodeIf.type === 'text', 'If/else: first node is text');
  assert(nodeIf.value.includes('Alive'), 'If/else: correct branch executed (Alive)');
  // Dead branch: use a separate CosLang string with hp = 0
  const coslangIfDead = `
scene logic {
  vars {
    hp = 0
  }
  if hp > 0 {
    text: "Alive"
  } else {
    text: "Dead"
  }
}
`;
  const astIfDead = parseCosLang(coslangIfDead);
  const engineIfDead = new CosmosEngine(astIfDead);
  engineIfDead.start('logic');
  engineIfDead.advance(); // Process the if node
  let nodeIfDead = engineIfDead.getCurrentContent();
  assert(nodeIfDead.type === 'text', 'If/else: first node is text (Dead branch)');
  assert(nodeIfDead.value.includes('Dead'), 'If/else: correct branch executed (Dead)');
  console.log('Engine test: if/else logic passed!');

  // Error handling stub
  try {
    engine.loadScene('notfound');
  } catch (e) {
    assert(engine.getError() && engine.getError().includes('not found'), 'Error handling: scene not found');
  }
  // Stubs
  assert(typeof engine.handleText === 'function', 'Stub: handleText');
  assert(typeof engine.handleChoice === 'function', 'Stub: handleChoice');
  assert(typeof engine.handleSet === 'function', 'Stub: handleSet');
  assert(typeof engine.handleIf === 'function', 'Stub: handleIf');
  assert(typeof engine.handleMacro === 'function', 'Stub: handleMacro');
  assert(typeof engine.handleTags === 'function', 'Stub: handleTags');
  assert(typeof engine.handleEvent === 'function', 'Stub: handleEvent');
  assert(typeof engine.handleAchievement === 'function', 'Stub: handleAchievement');
  assert(typeof engine.reset === 'function', 'Stub: reset');
  console.log('Engine expanded skeleton test passed!');

  // Tag handling test
  const coslangTags = `
scene tagtest {
  set hp = 1 [LOG: HP set, ACHIEVEMENT: Survivor]
  text: "You found a sword." [inventory ++sword]
  set hp = 0 [EVENT: KnockedOut]
  choice "Take gold" -> tagtest2 [LOG: Gold taken]
}
scene tagtest2 {
  text: "End."
}
`;
  const astTags = parseCosLang(coslangTags);
  const engineTags = new CosmosEngine(astTags);
  engineTags.start('tagtest');
  // set hp = 1 [LOG: HP set, ACHIEVEMENT: Survivor]
  let nodeTag = engineTags.getCurrentContent();
  engineTags.handleSet(nodeTag);
  console.log('DEBUG log:', engineTags.state.log);
  assert(engineTags.state.log.some(e => e.type === 'log' && e.message === 'HP set'), 'Tag: LOG processed');
  assert(engineTags.state.achievements['Survivor'] === true, 'Tag: ACHIEVEMENT processed');
  engineTags.advance();
  // text: "You found a sword." [inventory ++sword]
  nodeTag = engineTags.getCurrentContent();
  engineTags.handleText(nodeTag);
  assert(engineTags.state.inventory['sword'] === '1', 'Tag: inventory ++ processed');
  engineTags.advance();
  // set hp = 0 [EVENT: KnockedOut]
  nodeTag = engineTags.getCurrentContent();
  engineTags.handleSet(nodeTag);
  assert(engineTags.state.events['KnockedOut'] === true, 'Tag: EVENT processed');
  engineTags.advance();
  // choice "Take gold" -> tagtest2 [LOG: Gold taken]
  nodeTag = engineTags.getCurrentContent();
  engineTags.handleChoice(nodeTag);
  assert(engineTags.state.log.some(e => e.type === 'log' && e.message === 'Gold taken'), 'Tag: LOG on choice processed');
  console.log('Engine test: tag handling passed!');

  // Error handling tests
  // 1. Missing scene
  try {
    const engineErr = new CosmosEngine(ast);
    engineErr.loadScene('notfound');
    assert(false, 'Error: missing scene should throw');
  } catch (e) {
    assert(e.message.includes('Scene not found'), 'Error: missing scene message');
  }
  // 2. Invalid set expression
  try {
    const coslangErr = `scene err { set hp = alert('bad') }`;
    const astErr = parseCosLang(coslangErr);
    const engineErr2 = new CosmosEngine(astErr);
    engineErr2.start('err');
    let nodeErr = engineErr2.getCurrentContent();
    engineErr2.handleSet(nodeErr);
    assert(false, 'Error: invalid set expression should throw');
  } catch (e) {
    assert(
      e.message.includes('invalid set expression'),
      'Error: invalid set expression message'
    );
  }
  // 3. Missing macro
  try {
    const coslangMacro = `scene m { macroCall() }`;
    const astMacro = parseCosLang(coslangMacro);
    const engineMacro = new CosmosEngine(astMacro);
    engineMacro.start('m');
    engineMacro.handleMacro({ type: 'macro', name: 'notfound', params: [], body: '' });
    assert(false, 'Error: missing macro should throw');
  } catch (e) {
    assert(e.message.includes('Macro not found'), 'Error: missing macro message');
  }
  // 4. Invalid choice index
  try {
    const engineChoice = new CosmosEngine(ast);
    engineChoice.start('intro');
    engineChoice.choose(99);
    assert(false, 'Error: invalid choice index should throw');
  } catch (e) {
    assert(e.message.includes('Invalid choice index'), 'Error: invalid choice index message');
  }
  console.log('Engine test: error handling passed!');

  // Macro execution test
  const coslangMacro = `
scene macrotest {
  macro heal(amount) {
    set hp = hp + amount [LOG: Healed]
    text: "Healed {amount}!"
  }
  vars {
    hp = 5
  }
  set hp = 10
}
`;
  const astMacro = parseCosLang(coslangMacro);
  const engineMacro = new CosmosEngine(astMacro);
  engineMacro.start('macrotest');
  engineMacro.advance(); // skip text node
  let setNode = engineMacro.getCurrentContent();
  engineMacro.handleSet(setNode); // execute set hp = 10
  engineMacro.advance(); // move past set node
  // Now call the macro
  engineMacro.handleMacro({ type: 'macro', name: 'heal' }, ['3']);
  // hp should be 13
  assert(engineMacro.state.vars.hp === '13', 'Macro: hp updated');
  // Log should include 'Healed'
  assert(engineMacro.state.log.some(e => e.type === 'log' && e.message === 'Healed'), 'Macro: LOG processed');
  // Macro log should include macro call
  assert(engineMacro.state.log.some(e => e.type === 'macro' && e.name === 'heal'), 'Macro: macro call logged');
  console.log('Engine test: macro execution passed!');
}

if (typeof window !== 'undefined') {
  try {
    testEngine();
  } catch (e) {
    console.error('Engine test failed:', e);
  }
} 