export interface Logger {
  fatal: (msg: string) => void
  error: (msg: string) => void
  warn: (msg: string) => void
  info: (msg: string) => void
  debug: (msg: string) => void
}

export const defaultLogger: Logger = {
  fatal(msg) {
    throw new Error(msg)
  },
  error(msg) {
    console.error(msg)
  },
  warn(msg) {
    console.warn(msg)
  },
  info(msg) {
    console.info(msg)
  },
  debug(msg) {
    console.debug(msg)
  },
}
