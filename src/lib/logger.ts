/**
 * Logger utility for controlled logging in production
 * Only logs in development mode unless explicitly configured
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class Logger {
  private config: LoggerConfig

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: 'info',
      ...config,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : ''
    const formattedMessage = `${timestamp} [${level.toUpperCase()}] ${prefix}${message}`

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console

        break
      case 'info':
        // eslint-disable-next-line no-console

        break
      case 'warn':
        // eslint-disable-next-line no-console
        break
      case 'error':
        // eslint-disable-next-line no-console
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args)
  }

  createChild(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    })
  }
}

// Default logger instance
export const logger = new Logger()

// Create specialized loggers for different modules
export const authLogger = logger.createChild('auth')
export const apiLogger = logger.createChild('api')
export const dbLogger = logger.createChild('db')
export const uploadLogger = logger.createChild('upload')

export default logger
