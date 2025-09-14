// Player-specific logger that imports from the shared engine logger
// This ensures compatibility between player and engine

import { logger } from '../../js/cosmosx-engine/logger.js';

export default logger;
export { logger }; 