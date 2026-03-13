/**
 * 错误处理器
 * 统一处理游戏中的错误和异常
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: ((error: Error, context: string) => void)[] = [];
  private isDebug: boolean = false;

  private constructor() {
    this.setupGlobalErrorHandling();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling(): void {
    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandled_promise');
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'global');
    });
  }

  /**
   * 处理错误
   */
  public handleError(error: any, context: string): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // 记录错误
    console.error(`[${context}] Error:`, errorObj);

    // 通知监听器
    this.errorListeners.forEach((listener) => {
      try {
        listener(errorObj, context);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });

    // 调试模式显示详细错误
    if (this.isDebug) {
      this.showErrorDialog(errorObj, context);
    }
  }

  /**
   * 包装函数以捕获错误
   */
  public wrap<T extends (...args: any[]) => any>(
    fn: T,
    context: string
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, context);
        return undefined;
      }
    };
  }

  /**
   * 包装异步函数
   */
  public wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: string
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
    return async (
      ...args: Parameters<T>
    ): Promise<ReturnType<T> | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        return undefined;
      }
    };
  }

  /**
   * 添加错误监听器
   */
  public addListener(listener: (error: Error, context: string) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * 移除错误监听器
   */
  public removeListener(
    listener: (error: Error, context: string) => void
  ): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * 设置调试模式
   */
  public setDebug(debug: boolean): void {
    this.isDebug = debug;
  }

  /**
   * 显示错误对话框
   */
  private showErrorDialog(error: Error, context: string): void {
    // 创建错误提示
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a2e;
      color: #ef4444;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #ef4444;
      max-width: 500px;
      z-index: 9999;
      font-family: monospace;
    `;
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a2e;
      color: #ef4444;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #ef4444;
      max-width: 500px;
      z-index: 9999;
      font-family: monospace;
    `;

    // 使用 textContent 避免 XSS
    const title = document.createElement('h3');
    title.style.margin = '0 0 10px 0';
    title.textContent = `⚠️ Error: ${context}`;

    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-word';
    pre.textContent = error.message;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
      margin-top: 10px;
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => errorDiv.remove();

    errorDiv.appendChild(title);
    errorDiv.appendChild(pre);
    errorDiv.appendChild(closeBtn);
    document.body.appendChild(errorDiv);
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

/**
 * 装饰器：捕获方法错误
 */
export function CatchErrors(context?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const ctx = context || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        // 处理异步方法
        if (result instanceof Promise) {
          return result.catch((error) => {
            errorHandler.handleError(error, ctx);
            throw error;
          });
        }

        return result;
      } catch (error) {
        errorHandler.handleError(error, ctx);
        throw error;
      }
    };

    return descriptor;
  };
}
