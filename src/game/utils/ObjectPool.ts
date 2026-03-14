import Phaser from 'phaser';
import { Pea, SnowPea, FirePea } from '@entities/projectiles/Projectile';

/**
 * 对象池管理器
 * 用于复用游戏对象，减少GC压力
 */
export class ObjectPool<
  T extends Phaser.GameObjects.GameObject & {
    setVisible: (visible: boolean) => void;
    setActive: (active: boolean) => void;
  },
> {
  private scene: Phaser.Scene;
  private pool: T[] = [];
  private active: T[] = [];
  private createFn: (scene: Phaser.Scene) => T;
  private resetFn: (obj: T) => void;
  private maxSize: number = 50;

  constructor(
    scene: Phaser.Scene,
    createFn: (scene: Phaser.Scene) => T,
    resetFn: (obj: T) => void,
    maxSize: number = 50
  ) {
    this.scene = scene;
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * 获取对象
   */
  public get(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
      this.resetFn(obj);
      obj.setActive(true);
      obj.setVisible(true);
    } else {
      obj = this.createFn(this.scene);
    }

    this.active.push(obj);
    return obj;
  }

  /**
   * 回收对象
   */
  public recycle(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
    }

    const body = (
      obj as Phaser.GameObjects.GameObject & {
        body?: { enable?: boolean; stop?: () => void };
      }
    ).body;
    if (body?.stop) {
      body.stop();
    }
    if (body && 'enable' in body) {
      body.enable = false;
    }

    // 如果池未满，回收对象
    if (this.pool.length < this.maxSize) {
      obj.setActive(false);
      obj.setVisible(false);
      this.pool.push(obj);
    } else {
      // 池已满，销毁对象
      obj.destroy();
    }
  }

  /**
   * 回收所有活动对象
   */
  public recycleAll(): void {
    while (this.active.length > 0) {
      this.recycle(this.active[0]);
    }
  }

  /**
   * 清理
   */
  public destroy(): void {
    this.recycleAll();
    this.pool.forEach((obj) => obj.destroy());
    this.pool = [];
    this.active = [];
  }

  /**
   * 获取活动对象数量
   */
  public getActiveCount(): number {
    return this.active.length;
  }

  /**
   * 获取池大小
   */
  public getPoolSize(): number {
    return this.pool.length;
  }
}

/**
 * 投射物池
 */
export class ProjectilePool {
  private peaPool: ObjectPool<Pea>;
  private snowPeaPool: ObjectPool<SnowPea>;
  private firePeaPool: ObjectPool<FirePea>;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 豌豆池
    this.peaPool = new ObjectPool<Pea>(
      scene,
      (s) => new Pea(s, -100, -100),
      (p) => {
        p.setPosition(-100, -100);
        p.setVelocityX(0);
        p.setAlpha(1);
        p.setScale(1);
        p.setAngle(0);
        p.clearTint();
        const body = p.body as Phaser.Physics.Arcade.Body | undefined;
        if (body) {
          body.enable = true;
        }
      },
      30
    );

    // 冰冻豌豆池
    this.snowPeaPool = new ObjectPool<SnowPea>(
      scene,
      (s) => new SnowPea(s, -100, -100),
      (p) => {
        p.setPosition(-100, -100);
        p.setVelocityX(0);
        p.setAlpha(1);
        p.setScale(1);
        p.setAngle(0);
        p.setTint(0xaaddff);
        const body = p.body as Phaser.Physics.Arcade.Body | undefined;
        if (body) {
          body.enable = true;
        }
      },
      20
    );

    // 火焰豌豆池
    this.firePeaPool = new ObjectPool<FirePea>(
      scene,
      (s) => new FirePea(s, -100, -100),
      (p) => {
        p.setPosition(-100, -100);
        p.setVelocityX(0);
        p.setAlpha(1);
        p.setScale(1);
        p.setAngle(0);
        p.clearTint();
        const body = p.body as Phaser.Physics.Arcade.Body | undefined;
        if (body) {
          body.enable = true;
        }
      },
      20
    );
  }

  /**
   * 获取投射物
   */
  public get(type: 'pea' | 'snow_pea' | 'fire_pea'): Pea | SnowPea | FirePea {
    if (type === 'snow_pea') {
      return this.snowPeaPool.get();
    }
    if (type === 'fire_pea') {
      return this.firePeaPool.get();
    }
    return this.peaPool.get();
  }

  /**
   * 回收投射物
   */
  public recycle(projectile: Pea | SnowPea | FirePea): void {
    if (projectile instanceof SnowPea) {
      this.snowPeaPool.recycle(projectile);
    } else if (projectile instanceof FirePea) {
      this.firePeaPool.recycle(projectile);
    } else {
      this.peaPool.recycle(projectile);
    }
  }

  /**
   * 清理
   */
  public destroy(): void {
    this.peaPool.destroy();
    this.snowPeaPool.destroy();
    this.firePeaPool.destroy();
  }
}
