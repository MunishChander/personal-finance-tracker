/**
 * Logger utility for server-side logging
 * Provides structured logging with timestamps and log levels
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry;
  let output = `[${timestamp}] ${level}: ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    output += ` | Context: ${JSON.stringify(context)}`;
  }
  
  if (error) {
    output += `\n  Error: ${error.message}`;
    if (error.stack) {
      output += `\n  Stack: ${error.stack}`;
    }
  }
  
  return output;
}

/**
 * Log a message with specified level
 */
function log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
  
  const formattedLog = formatLogEntry(entry);
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(formattedLog);
      break;
    case LogLevel.WARN:
      console.warn(formattedLog);
      break;
    case LogLevel.INFO:
      console.info(formattedLog);
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.debug(formattedLog);
      }
      break;
  }
}

/**
 * Logger object with convenience methods
 */
export const logger = {
  error: (message: string, context?: Record<string, any>, error?: Error) => {
    log(LogLevel.ERROR, message, context, error);
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    log(LogLevel.WARN, message, context);
  },
  
  info: (message: string, context?: Record<string, any>) => {
    log(LogLevel.INFO, message, context);
  },
  
  debug: (message: string, context?: Record<string, any>) => {
    log(LogLevel.DEBUG, message, context);
  },
};

export default logger;
