// ScenesList.js
// UI-only helper for extracting scene info for display in the IDE sidebar or other UI components.
// No DOM, no styles, no business logic.

/**
 * Extracts a list of scenes with metadata for UI display.
 * @param {object} engineOrAst - CosmosEngine instance or AST object
 * @returns {Array<{id: string, vars?: object, stats?: object, inventory?: object, description: string, meta?: object}>}
 */
export function getScenesList(engineOrAst) {
  // Accept either engine instance or raw AST
  let ast = null;
  let scenes = {};
  
  try {
    if (engineOrAst && engineOrAst.ast) {
      // It's a CosmosEngine instance
      ast = engineOrAst.ast;
    } else if (engineOrAst && engineOrAst.scenes) {
      // It's a raw AST object
      ast = engineOrAst;
    } else {
      console.warn('Invalid engine or AST provided to getScenesList:', engineOrAst);
      return [];
    }
  } catch (e) {
    console.warn('Error accessing AST in getScenesList:', e);
    return [];
  }
  
  if (!ast) {
    console.warn('No AST found in getScenesList');
    return [];
  }
  
  // Get scenes from the AST
  if (ast.scenes) {
    scenes = ast.scenes;
  } else {
    console.warn('No scenes property found in AST:', ast);
    return [];
  }
  
  try {
    const sceneList = [];
    
    // Convert scenes object to array
    for (const sceneId in scenes) {
      const scene = scenes[sceneId];
      
      if (!scene || !sceneId) {
        console.warn('Invalid scene found:', scene);
        continue;
      }
      
      // Extract description from the first text block
      let description = '';
      if (scene.content && Array.isArray(scene.content)) {
        const firstTextBlock = scene.content.find(n => n && n.type === 'text');
        if (firstTextBlock && firstTextBlock.value) {
          description = firstTextBlock.value;
          // Truncate long descriptions
          if (description.length > 100) {
            description = description.substring(0, 97) + '...';
          }
        }
      }
      
      const sceneInfo = {
        id: sceneId,
        vars: scene.vars || {},
        stats: scene.stats || {},
        inventory: scene.inventory || {},
        description: description,
        // Export any scene-level metadata (extend as needed)
        meta: scene.meta || {}
      };
      
      sceneList.push(sceneInfo);
    }
    
    return sceneList;
    
  } catch (e) {
    console.warn('Error processing scenes in getScenesList:', e);
    return [];
  }
} 