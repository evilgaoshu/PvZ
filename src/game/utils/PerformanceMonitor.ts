/**
 * 性能监控器
 * 用于监控游戏性能指标
 */
export class PerformanceMonitor {
  private fps: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsHistory: number[] = [];
  private readonly maxHistorySize: number = 60;

  // 内存使用（仅Chrome/Edge）
  private memoryUsage: number = 0;

  // 对象计数
  private objectCounts: Map<string, number> = new Map();

  // 是否启用
  private enabled: boolean = true;

  constructor() {
    this.lastTime = performance.now();
  }

  /**
   * 更新FPS
   */
  public update(): void {
    if (!this.enabled) return;

    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.fpsHistory.push(this.fps);

      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;

      // 更新内存使用
      this.updateMemoryUsage();
    }
  }

  /**
   * 更新内存使用
   */
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
    }
  }

  /**
   * 设置对象计数
   */
  public setObjectCount(type: string, count: number): void {
    this.objectCounts.set(type, count);
  }

  /**
   * 增加对象计数
   */
  public incrementObjectCount(type: string): void {
    const current = this.objectCounts.get(type) || 0;
    this.objectCounts.set(type, current + 1);
  }

  /**
   * 减少对象计数
   */
  public decrementObjectCount(type: string): void {
    const current = this.objectCounts.get(type) || 0;
    if (current > 0) {
      this.objectCounts.set(type, current - 1);
    }
  }

  /**
   * 获取FPS
   */
  public getFPS(): number {
    return this.fps;
  }

  /**
   * 获取平均FPS
   */
  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * 获取最低FPS
   */
  public getMinFPS(): number {
    return Math.min(...this.fpsHistory);
  }

  /**
   * 获取内存使用
   */
  public getMemoryUsage(): number {
    return this.memoryUsage;
  }

  /**
   * 获取对象计数
   */
  public getObjectCount(type: string): number {
    return this.objectCounts.get(type) || 0;
  }

  /**
   * 获取所有对象计数
   */
  public getAllObjectCounts(): Record<string, number> {
    const result: Record<string, number> = {};
    this.objectCounts.forEach((count, type) => {
      result[type] = count;
    });
    return result;
  }

  /**
   * 重置
   */
  public reset(): void {
    this.fps = 0;
    this.frameCount = 0;
    this.fpsHistory = [];
    this.objectCounts.clear();
    this.lastTime = performance.now();
  }

  /**
   * 启用/禁用
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 获取性能报告
   */
  public getReport(): string {
    const lines: string[] = [];
    lines.push('=== 性能报告 ===');
    lines.push(
      `FPS: ${this.fps} (平均: ${this.getAverageFPS()}, 最低: ${this.getMinFPS()})`
    );
    lines.push(`内存: ${this.memoryUsage.toFixed(2)} MB`);
    lines.push('对象计数:');
    this.objectCounts.forEach((count, type) => {
      lines.push(`  ${type}: ${count}`);
    });
    return lines.join('\n');
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();
