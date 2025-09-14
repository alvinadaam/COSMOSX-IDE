// Enhanced Smart Logging System for CosmosX Engine and Player
// Supports debug mode, gameplay mode, and stable mode (noise reduction)

let _LOG_MODE = 'stable'; // Default to minimal logging
let _lastLog = null;
let _lastLogTime = 0;
let _repeatCount = 0;

/**
 * Set the logger mode at runtime.
 * @param {'gameplay'|'debug'|'stable'} mode
 */
export function setLogMode(mode) {
  _LOG_MODE = mode;
}

function formatTime() {
  const d = new Date();
  return d.toISOString().split('T')[1].replace('Z', '');
}

function shouldLogStable(args) {
  // Only suppress if identical log within 1s
  const now = Date.now();
  const logStr = JSON.stringify(args);
  if (logStr === _lastLog && now - _lastLogTime < 1000) {
    _repeatCount++;
    return false;
  } else {
    if (_repeatCount > 0) {
      console.log(`%c[STABLE] [${formatTime()}] (Suppressed ${_repeatCount} duplicate logs)`, 'color: #00b894; font-style:italic;');
      _repeatCount = 0;
    }
    _lastLog = logStr;
    _lastLogTime = now;
    return true;
  }
}

export const logger = {
  info: (...args) => {
    if (_LOG_MODE === 'debug' || _LOG_MODE === 'gameplay') {
      console.log(`%c[INFO] [${formatTime()}]`, 'color: #2e86de; font-weight: bold;', ...args);
    } else if (_LOG_MODE === 'stable' && shouldLogStable(['info', ...args])) {
      console.log(`%c[INFO] [${formatTime()}]`, 'color: #2e86de; font-weight: bold;', ...args);
    }
  },
  debug: (...args) => {
    if (_LOG_MODE === 'debug') {
      if (args.length === 1 && typeof args[0] === 'string') {
        console.log(`%c[DEBUG] [${formatTime()}] ${args[0]}`, 'color: #888; font-style:italic;');
      } else {
        console.log(`%c[DEBUG] [${formatTime()}]`, 'color: #888; font-style:italic;', ...args);
      }
    } else if (_LOG_MODE === 'stable' && shouldLogStable(['debug', ...args])) {
      if (args.length === 1 && typeof args[0] === 'string') {
        console.log(`%c[DEBUG] [${formatTime()}] ${args[0]}`, 'color: #888; font-style:italic;');
      } else {
        console.log(`%c[DEBUG] [${formatTime()}]`, 'color: #888; font-style:italic;', ...args);
      }
    }
  },
  error: (...args) => {
    // Always show errors
    console.error(`%c[ERROR] [${formatTime()}]`, 'color: #e74c3c; font-weight: bold;', ...args);
  },
  /**
   * Log a beautiful banner for major events.
   * @param {string} message
   * @param {'info'|'success'|'error'|'warn'} [type]
   */
  banner: (message, type = 'info') => {
    let color = '#2e86de';
    let emoji = 'ℹ️';
    if (type === 'success') { color = '#27ae60'; emoji = '✅'; }
    if (type === 'error') { color = '#e74c3c'; emoji = '❌'; }
    if (type === 'warn') { color = '#f1c40f'; emoji = '⚠️'; }
    console.log(`%c${emoji} ${message}`, `background: linear-gradient(90deg, ${color} 60%, #fff 100%); color: #fff; font-weight: bold; font-size: 1.15em; padding: 4px 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);`);
  },
  /**
   * Group logs for a phase or section. Use logger.group('Title', () => { ...logs... })
   */
  group: (title, fn) => {
    console.groupCollapsed(`%c${title}`, 'color: #4e8cff; font-weight: bold;');
    try { fn(); } finally { console.groupEnd(); }
  }
};

// Usage:
// import { logger, setLogMode } from './logger.js';
// setLogMode('debug'); // or 'gameplay' or 'stable'
// logger.info('message');
// logger.debug('debug message');
// logger.error('error message');
// logger.banner('CosmosX IDE initialized!', 'success');
// logger.group('Editor Setup', () => { logger.info('...'); ... });

