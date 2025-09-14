/**
 * CosLang AST (Abstract Syntax Tree) Structure
 * This file defines the data structures used by the parser and engine.
 * All CosLang features must be representable in this AST.
 */

/**
 * @typedef {Object} CosLangStoryAST
 * @property {Object} meta - Story metadata (title, author, version)
 * @property {Object.<string, SceneNode>} scenes - Map of sceneId to SceneNode
 */

/**
 * @typedef {Object} SceneNode
 * @property {string} id - Scene identifier
 * @property {ContentNode[]} content - Array of content nodes (text, set, choice, if, etc.)
 * @property {Object} [vars] - Scene-level variables (optional)
 * @property {Object} [stats] - Scene-level stats (optional)
 * @property {Object} [inventory] - Scene-level inventory (optional)
 */

/**
 * @typedef {Object} TextNode
 * @property {"text"} type
 * @property {string} value
 * @property {string[]} [tags] - Optional inline tags
 */

/**
 * @typedef {Object} SetNode
 * @property {"set"} type
 * @property {string} var
 * @property {string} expr
 * @property {string[]} [tags] - Optional inline tags
 */

/**
 * @typedef {Object} ChoiceNode
 * @property {"choice"} type
 * @property {string} text
 * @property {string} target
 * @property {string[]} [tags] - Optional inline tags
 */

/**
 * @typedef {Object} IfNode
 * @property {"if"} type
 * @property {string} condition
 * @property {ContentNode[]} then
 * @property {ContentNode[]} [else]
 */

/**
 * @typedef {Object} MacroNode
 * @property {"macro"} type
 * @property {string} name
 * @property {string[]} args
 */

/**
 * @typedef {TextNode | SetNode | ChoiceNode | IfNode | MacroNode} ContentNode
 */

/**
 * @typedef {Object} CosLangMeta
 * @property {string} title
 * @property {string} author
 * @property {string} version
 */

// Example export for use in parser/engine (optional, for type hints)
// module.exports = {};



