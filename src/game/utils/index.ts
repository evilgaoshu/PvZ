// 工具类导出
export { ObjectPool, ProjectilePool } from './ObjectPool';
export { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';
export { ErrorHandler, errorHandler, CatchErrors } from './ErrorHandler';
export { MemoryProfiler, memoryProfiler } from './MemoryProfiler';

// 数学工具函数
export const MathUtils = {
  /**
   * 限制数值在范围内
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 线性插值
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * 随机整数
   */
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 随机选择数组元素
   */
  randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * 计算两点距离
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * 角度转弧度
   */
  degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },

  /**
   * 弧度转角度
   */
  radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
  },
};

// 字符串工具函数
export const StringUtils = {
  /**
   * 格式化数字（填充零）
   */
  padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  },

  /**
   * 截断字符串
   */
  truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  },

  /**
   * 首字母大写
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};

// 数组工具函数
export const ArrayUtils = {
  /**
   * 洗牌算法
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 去重
   */
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  /**
   * 按属性分组
   */
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const group = String(item[key]);
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
      },
      {} as Record<string, T[]>
    );
  },
};

// 调试工具
export const DebugUtils = {
  /**
   * 测量函数执行时间
   */
  measureTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * 异步测量函数执行时间
   */
  async measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * 打印对象结构
   */
  inspect(obj: any, depth: number = 3): string {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (depth <= 0) return '...';
        if (typeof value === 'function') return '[Function]';
        if (value instanceof Map) return { type: 'Map', size: value.size };
        if (value instanceof Set) return { type: 'Set', size: value.size };
        return value;
      },
      2
    );
  },
};
