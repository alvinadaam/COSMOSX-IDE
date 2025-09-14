// CosLang Parser Skeleton
// This file contains function stubs and structure for the new CosLang parser.
// Each function should be implemented and tested incrementally.

import { logger } from '../../logger.js';
import { cosmosAssets } from '../CosmosAssets/assets.js';

/**
 * Parse a CosLang story file into an AST.
 * @param {string} coslangText
 * @returns {CosLangStoryAST}
 */
function parseCosLang(coslangText) {
  const lines = coslangText.split(/\r?\n/);
  let i = 0;
  const meta = { title: '', author: '', version: '' };
  const scenes = {};
  let assets = [];
  let globalVars = {};
  let globalStats = {};
  let globalInventory = {};

  // --- Collect all assets blocks anywhere in the file ---
  let assetLines = [];
  for (let j = 0; j < lines.length; j++) {
    let line = lines[j].trim();
    if (line.startsWith('assets {')) {
      j++;
      while (j < lines.length && !lines[j].trim().startsWith('}')) {
        let l = lines[j].trim();
        if (l && !l.startsWith('//')) assetLines.push(l);
        j++;
      }
      // skip closing }
    }
  }
  assets = parseAssetsBlock(assetLines);

  // --- Parse metadata and scenes as before ---
  i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line || line.startsWith('//')) { i++; continue; }
    if (line.startsWith('title:')) {
      meta.title = line.substring(6).trim().replace(/^['"]|['"]$/g, '');
      i++; continue;
    }
    if (line.startsWith('author:')) {
      meta.author = line.substring(7).trim().replace(/^['"]|['"]$/g, '');
      i++; continue;
    }
    if (line.startsWith('version:')) {
      meta.version = line.substring(8).trim().replace(/^['"]|['"]$/g, '');
      i++; continue;
    }
    if (line.startsWith('vars {')) {
      // Parse global vars block
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) {
            let value = m[2].trim();
            // Parse value types properly
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            globalVars[m[1]] = value;
          }
        }
        i++;
      }
      i++; // skip closing }
      continue;
    }
    if (line.startsWith('stats {')) {
      // Parse global stats block
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) {
            let value = m[2].trim();
            // Parse value types properly
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            globalStats[m[1]] = value;
          }
        }
        i++;
      }
      i++; // skip closing }
      continue;
    }
    if (line.startsWith('inventory {')) {
      // Parse global inventory block
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) {
            let value = m[2].trim();
            // Parse value types properly
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            globalInventory[m[1]] = value;
          }
        }
        i++;
      }
      i++; // skip closing }
      continue;
    }
    if (line.startsWith('scene ') && line.includes('{')) {
      const match = line.match(/scene\s+(\w+)\s*\{/);
      if (!match) throw new Error(`Malformed scene declaration at line ${i+1}`);
      const sceneId = match[1];
      let sceneLines = [];
      let braceCount = 1;
      i++;
      while (i < lines.length && braceCount > 0) {
        let l = lines[i];
        if (l.includes('{')) braceCount++;
        if (l.includes('}')) braceCount--;
        if (braceCount > 0) sceneLines.push(l);
        i++;
      }
      const scene = parseScene(sceneLines);
      scene.id = sceneId;
      scenes[sceneId] = scene;
      continue;
    }
    i++;
  }
  // Register assets in CosmosAssetsRegistry
  assets.forEach(a => cosmosAssets.addAsset(a.type, a.name, a.value, a.settings));
  
  // Add global variables to meta
  meta.vars = globalVars;
  meta.stats = globalStats;
  meta.inventory = globalInventory;
  
  return { meta, scenes, assets };
}

function parseAssetsBlock(lines) {
  // Each line: type name = "value" { settings }
  const assets = [];
  for (let line of lines) {
    if (!line) continue;
    // Match: type name = "value" { ... }
    const assetMatch = line.match(/^(image|audio|video)\s+(\w+)\s*=\s*"([^"]+)"(\s*\{([^}]*)\})?/);
    if (!assetMatch) continue;
    const [, type, name, value, , settingsRaw] = assetMatch;
    let settings = {};
    if (settingsRaw) {
      // Parse settings: key: value, ...
      // Allow values to be strings, numbers, booleans, variables, or expressions
      settingsRaw.split(',').forEach(pair => {
        let [k, v] = pair.split(':').map(s => s && s.trim());
        if (k && v !== undefined) {
          // Remove quotes from string values
          if (/^".*"$/.test(v)) v = v.slice(1, -1);
          // Try to parse as number or boolean, else keep as string/expression
          else if (v === 'true') v = true;
          else if (v === 'false') v = false;
          else if (!isNaN(Number(v))) v = Number(v);
          settings[k] = v;
        }
      });
    }
    assets.push({ type, name, value, settings });
  }
  return assets;
}

function parseScene(lines) {
  // Support scene-level vars, stats, inventory, and content
  let i = 0;
  let vars = {};
  let stats = {};
  let inventory = {};
  let contentLines = [];
  while (i < lines.length) {
    let line = lines[i];
    if (!line || line.startsWith('//')) { i++; continue; }
    if (line.startsWith('vars {')) {
      // Parse vars block
      let block = {};
      i++;
      while (i < lines.length && !lines[i].startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) block[m[1]] = m[2];
        }
        i++;
      }
      vars = block;
      i++; // skip closing }
      continue;
    }
    if (line.startsWith('stats {')) {
      // Parse stats block
      let block = {};
      i++;
      while (i < lines.length && !lines[i].startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) block[m[1]] = m[2];
        }
        i++;
      }
      stats = block;
      i++;
      continue;
    }
    if (line.startsWith('inventory {')) {
      // Parse inventory block
      let block = {};
      i++;
      while (i < lines.length && !lines[i].startsWith('}')) {
        let l = lines[i].trim();
        if (l && !l.startsWith('//')) {
          const m = l.match(/(\w+)\s*=\s*(.+)/);
          if (m) block[m[1]] = m[2];
        }
        i++;
      }
      inventory = block;
      i++;
      continue;
    }
    // Everything else is scene content
    contentLines.push(line.trim());
    i++;
  }
  const content = parseSceneContent(contentLines);
  return {
    id: '', // Will be set by parseCosLang
    vars: Object.keys(vars).length ? vars : undefined,
    stats: Object.keys(stats).length ? stats : undefined,
    inventory: Object.keys(inventory).length ? inventory : undefined,
    content
  };
}

function parseSceneContent(lines) {
  const content = [];
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    // Skip already-parsed nodes (objects)
    if (typeof line === 'object' && line !== null) {
      content.push(line);
      i++;
      continue;
    }
    if (!line || line.startsWith('//')) { i++; continue; }
    // Robust matching for set/text (trim whitespace)
    const trimmed = line.trim();
    // --- Asset commands (robust, before unknown fallback) ---
    let assetMatch;
    if ((assetMatch = trimmed.match(/^show\s+image\s+([\w-]+|"[^"]+")/i))) {
      const name = assetMatch[1].replace(/^"|"$/g, '');
      console.debug('[CosmosAssetsParser] Parsed show_image:', name);
      content.push({ type: 'show_image', name });
      i++;
      continue;
    }
    if ((assetMatch = trimmed.match(/^play\s+audio\s+([\w-]+|"[^"]+")/i))) {
      const name = assetMatch[1].replace(/^"|"$/g, '');
      console.debug('[CosmosAssetsParser] Parsed play_audio:', name);
      content.push({ type: 'play_audio', name });
      i++;
      continue;
    }
    if ((assetMatch = trimmed.match(/^show\s+video\s+([\w-]+|"[^"]+")/i))) {
      const name = assetMatch[1].replace(/^"|"$/g, '');
      console.debug('[CosmosAssetsParser] Parsed show_video:', name);
      content.push({ type: 'show_video', name });
      i++;
      continue;
    }
    if (trimmed.startsWith('if ') && trimmed.endsWith('{')) {
      const { ifNode, nextIndex } = parseIfBlock(lines, i);
      if (ifNode) content.push(ifNode);
      i = nextIndex;
      continue;
    }
    if (trimmed.startsWith('choice ')) {
      const choiceNode = parseChoice(trimmed);
      if (choiceNode) content.push(choiceNode);
      i++;
      continue;
    }
    if (trimmed.startsWith('set ')) {
      const setNode = parseSet(trimmed);
      if (setNode) content.push(setNode);
      i++;
      continue;
    }
    // --- Multi-line text support ---
    if (trimmed.startsWith('text:')) {
      let textValue = trimmed.substring(5).trim();
      if (textValue.startsWith('"') && !textValue.endsWith('"')) {
        // Multi-line quoted text
        let multiLine = textValue.slice(1) + '\n';
        i++;
        while (i < lines.length) {
          let nextLine = lines[i];
          if (nextLine.trim().endsWith('"')) {
            multiLine += nextLine.trim().slice(0, -1);
            break;
          } else {
            multiLine += nextLine + '\n';
          }
          i++;
        }
        content.push({ type: 'text', value: multiLine });
        i++;
        continue;
      } else {
        // Single-line text or already closed quoted text
        const textNode = parseText(trimmed);
        if (textNode) content.push(textNode);
        i++;
        continue;
      }
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const textNode = parseText(trimmed);
      if (textNode) content.push(textNode);
      i++;
      continue;
    }
    if (trimmed.startsWith('macro ')) {
      const { macroNode, nextIndex } = parseMacro(trimmed, lines, i);
      if (macroNode) content.push(macroNode);
      i = nextIndex;
      continue;
    }
    // If line is not recognized, push as unknown node for debugging
    if (window.LOG_MODE === 'debug') logger.debug('Unknown line in parseSceneContent:', line);
    content.push({ type: 'unknown', raw: line });
    i++;
  }
  if (window.LOG_MODE === 'debug') logger.debug('parseSceneContent final result for scene:', content);
  return content;
}

function parseIfBlock(lines, startIndex) {
  let i = startIndex;
  let line = lines[i];
  let condition;
  
  if (window.LOG_MODE === 'debug') logger.debug('parseIfBlock starting at index', startIndex, 'with line:', line);
  
  // Handle both 'if condition {' and 'else if condition {' formats
  if (line.trim().startsWith('else if ')) {
    condition = line.substring(8, line.indexOf('{')).trim(); // Remove 'else if ' and ' {'
  } else {
    condition = line.substring(2, line.indexOf('{')).trim(); // Remove 'if ' and ' {'
  }
  
  if (window.LOG_MODE === 'debug') logger.debug('parseIfBlock condition:', condition);
  
  i++;
  let thenBlock = [];
  let elseBlock = [];
  let braceCount = 1;
  // Parse then block
  while (i < lines.length && braceCount > 0) {
    let l = lines[i];
    // Handle '} else if ... {' as a block transition
    if (typeof l === 'string' && /^\}\s*else if .+\{$/.test(l)) {
      if (window.LOG_MODE === 'debug') logger.debug('Found } else if ... { at line:', l, 'index:', i);
      braceCount--; // close then block
      // Parse the else if as a new if block and assign to elseBlock
      const elseIfLine = l.replace(/^\}\s*/, '');
      const elseIfLines = [elseIfLine, ...lines.slice(i + 1)];
      if (window.LOG_MODE === 'debug') logger.debug('Calling parseIfBlock recursively with elseIfLines:', elseIfLines);
      const { ifNode: elseIfNode, nextIndex: elseIfNextIndex } = parseIfBlock(elseIfLines, 0);
      elseBlock = [elseIfNode];
      // Skip the parsed else if block and continue with the rest
      if (window.LOG_MODE === 'debug') logger.debug('Skipping', elseIfNextIndex, 'lines after else if');
      i += elseIfNextIndex;
      break;
    }
    // Handle '} else {' as a block transition
    if (typeof l === 'string' && /^\}\s*else\s*\{$/.test(l)) {
      braceCount--; // close then block
      i++; // move to else block
      // Now parse else block
      let elseBraceCount = 1;
      while (i < lines.length && elseBraceCount > 0) {
        let el = lines[i];
        if (typeof el === 'object' && el !== null) {
          elseBlock.push(el);
          i++;
          continue;
        }
        if (el && el.startsWith && el.startsWith('if ') && el.endsWith('{')) {
          const { ifNode, nextIndex } = parseIfBlock(lines, i);
          elseBlock.push(ifNode);
          i = nextIndex;
          continue;
        }
        if (el && el.includes && el.includes('{')) elseBraceCount++;
        if (el && el.includes && el.includes('}')) elseBraceCount--;
        if (elseBraceCount === 0) { i++; break; }
        if (el !== undefined) elseBlock.push(el);
        i++;
      }
      break;
    }
    if (typeof l === 'object' && l !== null) {
      thenBlock.push(l);
      i++;
      continue;
    }
    if (l && l.startsWith && l.startsWith('if ') && l.endsWith('{')) {
      const { ifNode, nextIndex } = parseIfBlock(lines, i);
      thenBlock.push(ifNode);
      i = nextIndex;
      continue;
    }
    if (l && l.includes && l.includes('{')) braceCount++;
    if (l && l.includes && l.includes('}')) braceCount--;
    if (braceCount === 0) { i++; break; }
    if (l !== undefined) thenBlock.push(l);
    i++;
  }
  // Check for else block (if not already handled by '} else {' or '} else if ... {')
  while (i < lines.length && (!lines[i] || (typeof lines[i] === 'string' && lines[i].startsWith('//')))) i++;
  if (i < lines.length && typeof lines[i] === 'string') {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('else if ') && trimmed.endsWith('{')) {
      // Parse the else if as a new if block and assign to elseBlock
      const elseIfLines = [lines[i], ...lines.slice(i + 1)];
      const { ifNode: elseIfNode, nextIndex: elseIfNextIndex } = parseIfBlock(elseIfLines, 0);
      elseBlock = [elseIfNode];
      // Skip the parsed else if block and continue with the rest
      i += (elseIfNextIndex + 1);
    } else if (trimmed.startsWith('else {')) {
      i++;
      let elseBraceCount = 1;
      while (i < lines.length && elseBraceCount > 0) {
        let l = lines[i];
        if (typeof l === 'object' && l !== null) {
          elseBlock.push(l);
          i++;
          continue;
        }
        if (l && l.startsWith && l.startsWith('if ') && l.endsWith('{')) {
          const { ifNode, nextIndex } = parseIfBlock(lines, i);
          elseBlock.push(ifNode);
          i = nextIndex;
          continue;
        }
        // Handle '} else {' inside else block (should not happen, but for safety)
        if (typeof l === 'string' && /^\}\s*else\s*\{$/.test(l)) {
          elseBraceCount--;
          i++;
          break;
        }
        if (l && l.includes && l.includes('{')) elseBraceCount++;
        if (l && l.includes && l.includes('}')) elseBraceCount--;
        if (elseBraceCount === 0) { i++; break; }
        if (l !== undefined) elseBlock.push(l);
        i++;
      }
    }
  }
  if (window.LOG_MODE === 'debug') logger.debug('parseIfBlock returning nextIndex:', i, 'condition:', condition);
  return {
    ifNode: {
      type: 'if',
      condition,
      then: Array.isArray(thenBlock) ? parseSceneContent(thenBlock) : [],
      else: Array.isArray(elseBlock) ? parseSceneContent(elseBlock) : []
    },
    nextIndex: i
  };
}

function parseChoice(line) {
  const { lineWithoutTags, tags } = extractTags(line);
  const match = lineWithoutTags.match(/choice\s+"([^"]+)"\s*->\s*(\w+)/);
  if (!match) return { type: 'error', message: 'Malformed choice line: ' + line };
  return {
    type: 'choice',
    text: match[1],
    target: match[2],
    tags: tags.length > 0 ? tags : undefined
  };
}

function parseSet(line) {
  const { lineWithoutTags, tags } = extractTags(line);
  const match = lineWithoutTags.match(/set\s+(\w+)\s*=\s*(.+)/);
  if (!match) return { type: 'error', message: 'Malformed set line: ' + line };
  return {
    type: 'set',
    var: match[1],
    expr: match[2].trim(),
    tags: tags.length > 0 ? tags : undefined
  };
}

function parseText(line) {
  // Extract tags
  const { lineWithoutTags, tags } = extractTags(line);
  let value = '';
  if (lineWithoutTags.startsWith('text:')) {
    value = lineWithoutTags.substring(5).trim();
  } else if (lineWithoutTags.startsWith('"') && lineWithoutTags.endsWith('"')) {
    value = lineWithoutTags;
  } else {
    value = lineWithoutTags;
  }
  return {
    type: 'text',
    value,
    tags: tags.length > 0 ? tags : undefined
  };
}

function parseMacro(line, lines, startIndex) {
  // Parse macro definition: macro name(params) { ... }
  // If called from parseSceneContent, only line is passed; if called for block, lines and startIndex are passed
  let macroLine = line.trim();
  let i = startIndex !== undefined ? startIndex : 0;
  if (!macroLine.startsWith('macro ')) return null;
  const match = macroLine.match(/macro\s+(\w+)\s*\(([^)]*)\)\s*\{/);
  if (!match) return null;
  const name = match[1];
  const params = match[2].split(',').map(s => s.trim()).filter(Boolean);
  let bodyLines = [];
  let braceCount = 1;
  if (startIndex !== undefined) {
    i++;
    while (i < lines.length && braceCount > 0) {
      let l = lines[i].trim();
      if (l.includes('{')) braceCount++;
      if (l.includes('}')) braceCount--;
      if (braceCount === 0) { i++; break; }
      bodyLines.push(l);
      i++;
    }
    return {
      macroNode: {
        type: 'macro',
        name,
        params,
        body: bodyLines.join('\n') // Use real newlines
      },
      nextIndex: i
    };
  } else {
    // Single-line macro (not recommended, but for compatibility)
    return {
      type: 'macro',
      name,
      params,
      body: ''
    };
  }
}

function extractTags(line) {
  // Extract [tag] blocks from the line
  const tagMatches = [...line.matchAll(/\[([^\]]+)\]/g)];
  // Split tags on commas and trim whitespace
  const tags = tagMatches
    .map(m => m[1].split(',').map(t => t.trim()))
    .flat();
  const lineWithoutTags = line.replace(/\s*\[[^\]]+\]/g, '').trim();
  return { lineWithoutTags, tags };
}

export {
  parseCosLang,
  parseScene,
  parseSceneContent,
  parseIfBlock,
  parseChoice,
  parseSet,
  parseText,
  parseMacro,
  extractTags
};



