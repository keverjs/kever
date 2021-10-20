import chalk, { Chalk } from 'chalk'
import { logHandler } from './writeFile'
import { _processDate } from './utils'

interface LoggerConfig {
  format?: string
  logDir?: string
  /**
   * @description 输出文件日志的等级： 0 不输出任何等级的日志；1 输出[log,error,warn]等级的日志；2 输出[warn, error]等级的日志；3 输出[error]等级的日志
   */
  levalFile?: 0 | 1 | 2 | 3
  /**
   * @description 输出控制台日志的等级： 0 不输出任何等级的日志；1 输出[log,error,warn]等级的日志；2 输出[warn, error]等级的日志；3 输出[error]等级的日志
   */
  levalLog?: 0 | 1 | 2 | 3
  /**
   * @description 是否独立输出不同类型的日志，不同类型存放在不同文件夹下, 默认关闭
   */
  isDependentOutput?: boolean
}

const LEVAL_TYPE: Record<number, Array<string>> = {
  0: [],
  1: ['info', 'warn', 'error', 'debug'],
  2: ['warn', 'error'],
  3: ['error'],
}

class Logger {
  // 日志文件中的格式
  private format = '[kever:{type}]: yyyy-mm-dd hh:mm:ss content'
  // 输出日志文件的位置
  private logDir = `${process.cwd()}/log`
  // 输出日志文件中日志的优先级
  private levalFile: 0 | 1 | 2 | 3 = 1
  // 输出控制台日志的优先级
  private levalLog: 0 | 1 | 2 | 3 = 1
  private isDependentOutput = false
  /**
   * @description 初始化日志配置
   * @param config
   */
  init(config: LoggerConfig = {}) {
    Object.assign(this, config)
  }
  /**
   * @description 正常输出
   * @param message
   */
  info(message: string) {
    this._emit(message, 'blue', 'info')
  }
  /**
   * @description 正常输出
   * @param message
   */
  debug(message: string) {
    this._emit(message, 'blue', 'debug')
  }
  /**
   * @description 错误
   * @param message
   */
  error(message: string) {
    this._emit(message, 'red', 'error')
  }
  /**
   * @description 警告
   * @param message
   */
  warn(message: string) {
    this._emit(message, 'yellow', 'warn')
  }
  private _emit(
    message: string,
    color: 'blue' | 'red' | 'yellow',
    type: 'info' | 'error' | 'warn' | 'debug'
  ) {
    const formatMessage = this._formatLog(message, type)
    const content: string = chalk[color](formatMessage)
    if (LEVAL_TYPE[this.levalFile].includes(type)) {
      logHandler(formatMessage, this.logDir, type, this.isDependentOutput)
    }
    LEVAL_TYPE[this.levalLog].includes(type) && console[type](content)
  }
  private _formatLog(content: string, type: string): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = _processDate(date.getMonth() + 1)
    const day: number | string = _processDate(date.getDate())
    const hour = _processDate(date.getHours())
    const minute = _processDate(date.getMinutes())
    const second = _processDate(date.getSeconds())
    return `[kever|${type}]: ${year}-${month}-${day} ${hour}:${minute}:${second} | ${content}`
  }
}
const logger = new Logger()
export { logger }
