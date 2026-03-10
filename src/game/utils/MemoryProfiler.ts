/**
 * 内存分析器
 * 用于检测和诊断内存问题
 */
export class MemoryProfiler {
  private snapshots: { label: string; memory: number; objects: Map<string, number> }[] = [];
  private isRunning: boolean = false;
  private intervalId: number | null = null;

  /**
   * 开始内存监控
   */
  public start(interval: number = 5000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = window.setInterval(() => {
      this.takeSnapshot('auto');
    }, interval);

    console.log('📊 内存监控已启动');
  }

  /**
   * 停止内存监控
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('📊 内存监控已停止');
  }

  /**
   * 拍摄内存快照
   */
  public takeSnapshot(label: string = 'manual'): void {
    const memory = this.getCurrentMemory();
    const objects = this.countGameObjects();

    this.snapshots.push({
      label: `${label}_${Date.now()}`,
      memory,
      objects
    });

    // 限制快照数量
    if (this.snapshots.length > 50) {
      this.snapshots.shift();
    }

    console.log(`📸 内存快照 [${label}]: ${memory.toFixed(2)} MB`);
  }

  /**
   * 获取当前内存使用
   */
  public getCurrentMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  /**
   * 统计游戏对象
   */
  private countGameObjects(): Map<string, number> {
    const counts = new Map<string, number>();

    // 这些需要在游戏场景中调用
    // 这里只是一个示例框架
    counts.set('GameObjects', 0);
    counts.set('Sprites', 0);
    counts.set('Containers', 0);

    return counts;
  }

  /**
   * 分析内存趋势
   */
  public analyzeTrend(): { isLeaking: boolean; growthRate: number } {
    if (this.snapshots.length < 2) {
      return { isLeaking: false, growthRate: 0 };
    }

    const recent = this.snapshots.slice(-10);
    const first = recent[0].memory;
    const last = recent[recent.length - 1].memory;
    const growthRate = (last - first) / recent.length;

    // 如果平均每次增长超过0.5MB，认为可能有泄漏
    const isLeaking = growthRate > 0.5;

    return { isLeaking, growthRate };
  }

  /**
   * 生成内存报告
   */
  public generateReport(): string {
    if (this.snapshots.length === 0) {
      return '没有内存快照数据';
    }

    const lines: string[] = [];
    lines.push('=== 内存分析报告 ===\n');

    const trend = this.analyzeTrend();
    lines.push(`趋势: ${trend.isLeaking ? '⚠️ 可能泄漏' : '✅ 正常'}`);
    lines.push(`增长率: ${trend.growthRate.toFixed(2)} MB/快照\n`);

    lines.push('快照历史:');
    this.snapshots.forEach((snapshot, index) => {
      lines.push(`  ${index + 1}. ${snapshot.label}: ${snapshot.memory.toFixed(2)} MB`);
    });

    const current = this.getCurrentMemory();
    lines.push(`\n当前内存: ${current.toFixed(2)} MB`);

    return lines.join('\n');
  }

  /**
   * 检查内存泄漏
   */
  public checkMemoryLeak(): void {
    const trend = this.analyzeTrend();

    if (trend.isLeaking) {
      console.warn('⚠️ 检测到可能的内存泄漏!');
      console.warn(`   平均增长: ${trend.growthRate.toFixed(2)} MB/快照`);
      console.warn('   建议检查: 未清理的事件监听、定时器、游戏对象');
    }
  }

  /**
   * 清理快照
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    console.log('🧹 内存快照已清理');
  }

  /**
   * 导出数据
   */
  public exportData(): string {
    return JSON.stringify(this.snapshots, null, 2);
  }
}

// 全局内存分析器实例
export const memoryProfiler = new MemoryProfiler();
