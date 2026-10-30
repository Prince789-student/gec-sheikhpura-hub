/**
 * GEC Sheikhpura Student Life Hub - Centralized Safe Logging Utility (Phase 8)
 *
 * Provides privacy-conscious operational logging with strict data redaction:
 * - Redacts passwords, API keys, auth tokens, bearer headers, and PII.
 * - In-memory ring buffer (capped at 50 entries) for administrative diagnostics.
 * - Does not display raw stack traces or internal DB errors to public visitors.
 */

(function () {
  const MAX_LOG_ENTRIES = 50;
  const logBuffer = [];

  // Patterns to redact
  const REDACT_PATTERNS = [
    { regex: /password["']?\s*[:=]\s*["']?([^"',\s&]+)/gi, replacement: 'password: [REDACTED]' },
    { regex: /bearer\s+([a-zA-Z0-9_\-\.]+)/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
    { regex: /apikey["']?\s*[:=]\s*["']?([^"',\s&]+)/gi, replacement: 'apikey: [REDACTED]' },
    { regex: /eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, replacement: '[REDACTED_JWT]' },
    { regex: /\b(\+91[\-\s]?)?[6-9]\d{9}\b/g, replacement: '[REDACTED_PHONE]' }
  ];

  function redactString(str) {
    if (typeof str !== 'string') return str;
    let sanitized = str;
    for (const rule of REDACT_PATTERNS) {
      sanitized = sanitized.replace(rule.regex, rule.replacement);
    }
    return sanitized;
  }

  function redactData(data) {
    if (!data) return data;
    if (typeof data === 'string') return redactString(data);
    if (typeof data === 'number' || typeof data === 'boolean') return data;
    if (data instanceof Error) {
      return {
        name: data.name,
        message: redactString(data.message),
        // Do not leak internal line numbers or file paths to untrusted observers
      };
    }
    if (Array.isArray(data)) {
      return data.map(item => redactData(item));
    }
    if (typeof data === 'object') {
      const sanitized = {};
      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('key')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = redactData(data[key]);
        }
      }
      return sanitized;
    }
    return '[COMPLEX_DATA]';
  }

  function appendToBuffer(level, message, context) {
    const entry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: redactString(String(message || '')),
      context: context ? redactData(context) : null
    };

    logBuffer.unshift(entry);
    if (logBuffer.length > MAX_LOG_ENTRIES) {
      logBuffer.pop();
    }
    return entry;
  }

  const Logger = {
    info(message, context) {
      const entry = appendToBuffer('INFO', message, context);
      console.log(`[INFO] ${entry.message}`, entry.context || '');
      return entry;
    },

    warn(message, context) {
      const entry = appendToBuffer('WARN', message, context);
      console.warn(`[WARN] ${entry.message}`, entry.context || '');
      return entry;
    },

    error(message, context) {
      const entry = appendToBuffer('ERROR', message, context);
      console.error(`[ERROR] ${entry.message}`, entry.context || '');
      return entry;
    },

    debug(message, context) {
      // In production or demo, debug only stores in memory
      const entry = appendToBuffer('DEBUG', message, context);
      return entry;
    },

    getLogs(filterLevel) {
      if (!filterLevel || filterLevel === 'ALL') return [...logBuffer];
      return logBuffer.filter(entry => entry.level === filterLevel.toUpperCase());
    },

    clearLogs() {
      logBuffer.length = 0;
      return true;
    },

    redact: redactData
  };

  // Export globally
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
  }
  if (typeof window !== 'undefined') {
    window.Logger = Logger;
  }
})();
