import { GridSystem } from '../systems/GridSystem';
import { EconomySystem } from '../systems/EconomySystem';

/**
 * 简单的测试框架
 */
export class TestRunner {
  private tests: { name: string; fn: () => void | Promise<void> }[] = [];
  private results: { name: string; passed: boolean; error?: Error }[] = [];

  /**
   * 添加测试用例
   */
  public test(name: string, fn: () => void | Promise<void>): void {
    this.tests.push({ name, fn });
  }

  /**
   * 运行所有测试
   */
  public async runAll(): Promise<void> {
    console.log('🧪 开始运行测试...\n');

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.results.push({ name, passed: true });
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.push({ name, passed: false, error: error as Error });
        console.error(`❌ ${name}`);
        console.error(`   ${(error as Error).message}`);
      }
    }

    this.printSummary();
  }

  /**
   * 打印测试结果汇总
   */
  private printSummary(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log('\n📊 测试结果汇总');
    console.log(`   总计: ${total}`);
    console.log(`   通过: ${passed}`);
    console.log(`   失败: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 所有测试通过!');
    } else {
      console.log('\n⚠️ 部分测试失败');
    }
  }
}

/**
   * 断言相等
   */
  export function assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, but got ${actual}`
      );
    }
  }

  /**
   * 断言为真
   */
  export function assertTrue(value: boolean, message?: string): void {
    if (!value) {
      throw new Error(message || `Expected true, but got ${value}`);
    }
  }

  /**
   * 断言不为空
   */
  export function assertNotNull<T>(value: T, message?: string): void {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected non-null value, but got ${value}`);
    }
  }

  /**
   * 断言抛出错误
   */
  export function assertThrows(fn: () => void, message?: string): void {
    let threw = false;
    try {
      fn();
    } catch {
      threw = true;
    }

    if (!threw) {
      throw new Error(message || 'Expected function to throw, but it did not');
    }
  }

  /**
   * 网格系统测试
   */
  export function runGridSystemTests(scene: Phaser.Scene): void {
    const runner = new TestRunner();

    runner.test('GridSystem - 坐标转换', () => {
      const grid = new GridSystem(scene);

      // 测试屏幕坐标转网格坐标
      const pos = grid.screenToGrid(290, 130); // 第一格的中心附近
      assertNotNull(pos);
      assertEqual(pos!.row, 0);
      assertEqual(pos!.col, 0);

      // 测试越界返回null
      const outOfBounds = grid.screenToGrid(0, 0);
      assertEqual(outOfBounds, null);

      grid.destroy();
    });

    runner.test('GridSystem - 边界检查', () => {
      const grid = new GridSystem(scene);

      // 有效格子
      assertTrue(grid.isValidCell(0, 0), 'Should be valid');
      assertTrue(grid.isValidCell(4, 8), 'Should be valid');

      // 无效格子
      assertEqual(grid.isValidCell(-1, 0), false);
      assertEqual(grid.isValidCell(0, -1), false);
      assertEqual(grid.isValidCell(5, 0), false);
      assertEqual(grid.isValidCell(0, 9), false);

      grid.destroy();
    });

    runner.test('GridSystem - 种植检查', () => {
      const grid = new GridSystem(scene);

      // 空格子可以种植
      assertTrue(grid.canPlant(0, 0), 'Empty cell should be plantable');

      // 种植后不能重复种植
      grid.setPlant(0, 0, 'sunflower');
      assertEqual(grid.canPlant(0, 0), false);

      // 移除后可以种植
      grid.removePlant(0, 0);
      assertTrue(grid.canPlant(0, 0), 'Should be plantable after removal');

      grid.destroy();
    });

    runner.runAll();
  }

  /**
   * 经济系统测试
   */
  export function runEconomySystemTests(scene: Phaser.Scene): void {
    const runner = new TestRunner();

    runner.test('EconomySystem - 初始阳光', () => {
      const economy = new EconomySystem(scene);

      assertEqual(economy.getSun(), 150);

      economy.destroy();
    });

    runner.test('EconomySystem - 添加阳光', () => {
      const economy = new EconomySystem(scene);

      economy.addSun(50, 'falling');
      assertEqual(economy.getSun(), 200);

      economy.destroy();
    });

    runner.test('EconomySystem - 消费阳光', () => {
      const economy = new EconomySystem(scene);

      // 足够阳光时可以消费
      assertTrue(economy.spend(100));
      assertEqual(economy.getSun(), 50);

      // 阳光不足时不能消费
      assertEqual(economy.spend(100), false);
      assertEqual(economy.getSun(), 50);

      economy.destroy();
    });

    runner.test('EconomySystem - 阳光上限', () => {
      const economy = new EconomySystem(scene);

      // 添加大量阳光
      economy.addSun(10000, 'falling');

      // 不超过上限
      assertEqual(economy.getSun() <= 9990, true);

      economy.destroy();
    });

    runner.runAll();
  }

  /**
   * 运行所有测试
   */
  export function runAllTests(scene: Phaser.Scene): void {
    console.log('=================================');
    console.log('🎮 Plants vs Zombies - 测试套件');
    console.log('=================================\n');

    runGridSystemTests(scene);
    console.log('');
    runEconomySystemTests(scene);
  }
