/**
 * Structured logging utility for the RAG application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private service: string;

  constructor(service: string = 'rag-backend', level: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? { service: this.service, ...context } : { service: this.service },
      error: error ? {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
  }

  private output(entry: LogEntry): void {
    if (this.shouldLog(entry.level)) {
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatLog(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatLog(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatLog(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.output(this.formatLog(LogLevel.ERROR, message, context, error));
  }

  // Convenience methods for common operations
  logModelLoad(modelName: string, provider?: string): void {
    this.info('Loading chat model', { modelName, provider });
  }

  logRetrieval(query: string, documentCount: number, duration?: number): void {
    this.info('Document retrieval completed', { 
      query: query.substring(0, 100), 
      documentCount, 
      duration 
    });
  }

  logIngestion(documentCount: number, duration?: number): void {
    this.info('Document ingestion completed', { documentCount, duration });
  }

  logGraphExecution(graphName: string, nodeName: string, duration?: number): void {
    this.info('Graph node executed', { graphName, nodeName, duration });
  }

  logError(operation: string, error: Error, context?: LogContext): void {
    this.error(`Error in ${operation}`, error, context);
  }
}

// Create default logger instance
export const logger = new Logger();

// Create specialized loggers for different components
export const createLogger = (service: string, level?: LogLevel): Logger => {
  return new Logger(service, level);
};

// Export log levels for configuration
export { LogLevel as LogLevels };
