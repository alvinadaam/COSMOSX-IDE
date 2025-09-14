import { parseCosLang } from '../parser.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function testParser() {
  // 1. Scene with vars, stats, inventory
  const coslang1 = `
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
text: "Welcome!"
}
`;
  const ast1 = parseCosLang(coslang1);
  assert(ast1.scenes.intro.vars.hp === '10', 'Vars parsed');
  assert(ast1.scenes.intro.stats.strength === '3', 'Stats parsed');
  assert(ast1.scenes.intro.inventory.sword === '1', 'Inventory parsed');
  assert(ast1.scenes.intro.content[0].type === 'text', 'Text node parsed');

  // 2. Choices, set, tags
  const coslang2 = `
scene test {
choice "Go left" -> left [explore]
set hp = hp - 1 [damage]
text: "You lose 1 HP." [narration]
}
`;
  const ast2 = parseCosLang(coslang2);
  assert(ast2.scenes.test.content[0].type === 'choice', 'Choice parsed');
  assert(ast2.scenes.test.content[0].tags[0] === 'explore', 'Choice tag parsed');
  assert(ast2.scenes.test.content[1].type === 'set', 'Set parsed');
  assert(ast2.scenes.test.content[1].tags[0] === 'damage', 'Set tag parsed');
  assert(ast2.scenes.test.content[2].type === 'text', 'Text parsed');
  assert(ast2.scenes.test.content[2].tags[0] === 'narration', 'Text tag parsed');

  // 3. If/else (including nesting)
  const coslang3 = `
scene logic {
if hp > 0 {
  text: "Alive"
  if gold > 0 {
    text: "Rich"
  }
} else {
  text: "Dead"
}
}
`;
  const ast3 = parseCosLang(coslang3);
  const ifNode = ast3.scenes.logic.content[0];
  console.log('DEBUG ifNode.then:', ifNode.then, ifNode.then[0], ifNode.then[1]);
  assert(ifNode.type === 'if', 'If node parsed');
  assert(ifNode.then[0].type === 'text', 'If-then text parsed');
  assert(ifNode.then[1].type === 'if', 'Nested if parsed');
  console.log('DEBUG ifNode.else:', ifNode.else, ifNode.else[0]);
  assert(ifNode.else[0].type === 'text', 'Else text parsed');

  // 4. Macro definition
  const coslang4 = `
scene macrotest {
macro heal(amount) {
  set hp = hp + amount
  text: "Healed!"
}
}
`;
  const ast4 = parseCosLang(coslang4);
  const macroNode = ast4.scenes.macrotest.content[0];
  assert(macroNode.type === 'macro', 'Macro node parsed');
  assert(macroNode.name === 'heal', 'Macro name parsed');
  assert(macroNode.params[0] === 'amount', 'Macro param parsed');
  assert(macroNode.body.includes('set hp = hp + amount'), 'Macro body parsed');

  // 5. Edge cases: empty scene, comments
  const coslang5 = `
// This is a comment
scene empty {
// nothing here
}
`;
  const ast5 = parseCosLang(coslang5);
  assert(Array.isArray(ast5.scenes.empty.content), 'Empty scene content array');
  assert(ast5.scenes.empty.content.length === 0, 'Empty scene has no content');

  console.log('All parser tests passed!');
}

// Auto-run in browser if loaded directly
if (typeof window !== 'undefined') {
  try {
    testParser();
  } catch (e) {
    console.error('Parser test failed:', e);
  }
} 