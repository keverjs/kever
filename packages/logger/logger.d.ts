declare class Logger {
  private format
  private logDir
  private levalFile
  private levalLog
  private isDependentOutput
  init(config?: LoggerConfig): void
  info(message: string): void
  error(message: string): void
  warn(message: string): void
  private _emit
  private _formatLog
}

export declare const logger: Logger

declare interface LoggerConfig {
  format?: string
  logDir?: string
  levalFile?: 0 | 1 | 2 | 3
  levalLog?: 0 | 1 | 2 | 3
  isDependentOutput?: boolean
}

export {}
