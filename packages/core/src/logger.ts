export interface Logger {
  fatal: (msg: string) => void
  error: (msg: string, ...args: unknown[]) => void
  warn: (msg: string, ...args: unknown[]) => void
  info: (msg: string, ...args: unknown[]) => void
  debug: (msg: string, ...args: unknown[]) => void
  trace: (msg: string, ...args: unknown[]) => void
}

export const defaultLogger: Logger = {
  fatal(msg) {
    throw new Error(msg)
  },
  error(msg, ...args: unknown[]) {
    console.error(msg, args)
  },
  warn(msg, ...args: unknown[]) {
    console.warn(msg, args)
  },
  info(msg, ...args: unknown[]) {
    console.info(msg, args)
  },
  debug(msg, ...args: unknown[]) {
    console.debug(msg, args)
  },
  trace(msg, ...args: unknown[]) {
    console.info(msg, args)
  }
}
