/**
 * 集中日志管理类
 */
export class Logger {
  private static isEnabled: boolean = true;

  /**
   * 设置日志开关
   */
  public static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 普通日志
   */
  public static log(message: any, ...optionalParams: any[]): void {
    if (this.isEnabled) {
      console.log(message, ...optionalParams);
    }
  }

  /**
   * 信息日志
   */
  public static info(message: any, ...optionalParams: any[]): void {
    if (this.isEnabled) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  }

  /**
   * 警告日志
   */
  public static warn(message: any, ...optionalParams: any[]): void {
    if (this.isEnabled) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  }

  /**
   * 错误日志
   */
  public static error(message: any, ...optionalParams: any[]): void {
    if (this.isEnabled) {
      console.error(`[ERROR] ${message}`, ...optionalParams);
    }
  }

  /**
   * 调试日志 (仅在非生产环境下显示)
   */
  public static debug(message: any, ...optionalParams: any[]): void {
    if (this.isEnabled && process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  }
}
