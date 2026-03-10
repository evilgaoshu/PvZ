import Phaser from 'phaser';
import { GameEvents } from '@/types/index';

/**
 * 投射物基类
 */
export abstract class Projectile extends Phaser.Physics.Arcade.Image {
  protected damage: number = 20;
  protected speed: number = 300;
  protected row: number = 0;
  protected source: Phaser.GameObjects.GameObject | null = null;
  protected isSlowing: boolean = false;
  protected projectileType: string = 'normal';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'projectile'
  ) {
    super(scene, x, y, texture);

    // 添加到场景和物理系统
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.init();
  }

  /**
   * 初始化
   */
  protected init(): void {
    // 设置碰撞体
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 20);
    body.allowGravity = false;

    // 向右飞行
    this.setVelocityX(this.speed);
  }

  /**
   * 设置投射物数据
   */
  public setProjectileData(data: {
    damage: number;
    speed: number;
    row: number;
    source?: Phaser.GameObjects.GameObject;
    type?: string;
  }): void {
    this.damage = data.damage;
    this.speed = data.speed;
    this.row = data.row;
    this.source = data.source || null;
    this.projectileType = data.type || 'normal';

    // 更新速度
    this.setVelocityX(this.speed);
  }

  /**
   * 更新
   */
  public update(): void {
    // 检查是否超出屏幕
    if (this.x > 900) {
      this.destroy();
      return;
    }

    // 旋转效果
    this.rotation += 0.2;
  }

  /**
   * 击中目标
   */
  public hit(target: Phaser.Physics.Arcade.Sprite): void {
    // 发送命中事件
    this.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
      projectile: this,
      target: target,
      damage: this.damage,
      type: this.projectileType,
      isSlowing: this.isSlowing,
      row: this.row
    });

    // 播放命中效果
    this.playHitEffect();

    // 销毁
    this.destroy();
  }

  /**
   * 播放命中效果
   */
  protected playHitEffect(): void {
    // 基础命中效果
    const hit = this.scene.add.ellipse(this.x, this.y, 30, 30, 0xffffff, 0.5);

    this.scene.tweens.add({
      targets: hit,
      scaleX: 0.5,
      scaleY: 0.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        hit.destroy();
      }
    });
  }

  /**
   * 获取伤害
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * 获取类型
   */
  public getProjectileType(): string {
    return this.projectileType;
  }

  /**
   * 是否带减速效果
   */
  public getIsSlowing(): boolean {
    return this.isSlowing;
  }

  /**
   * 获取行
   */
  public getRow(): number {
    return this.row;
  }
}

/**
 * 豌豆
 */
export class Pea extends Projectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 创建豌豆图形
    this.createPeaGraphics(0x4ade80);
  }

  /**
   * 创建豌豆图形
   */
  private createPeaGraphics(color: number): void {
    const graphics = this.scene.add.graphics();

    // 豌豆主体 - 绿色圆形
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 8);

    // 高光
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillCircle(-3, -3, 3);

    // 生成纹理
    graphics.generateTexture('pea', 20, 20);
    graphics.destroy();

    // 设置纹理
    this.setTexture('pea');
  }

  /**
   * 播放命中效果
   */
  protected playHitEffect(): void {
    // 绿色飞溅效果
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const particle = this.scene.add.ellipse(
        this.x,
        this.y,
        8,
        8,
        0x4ade80,
        0.8
      );

      const distance = Phaser.Math.Between(15, 30);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}

/**
 * 冰冻豌豆
 */
export class SnowPea extends Projectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.isSlowing = true;
    this.projectileType = 'snow_pea';

    // 创建冰冻豌豆图形
    this.createSnowPeaGraphics();
  }

  /**
   * 创建冰冻豌豆图形
   */
  private createSnowPeaGraphics(): void {
    const graphics = this.scene.add.graphics();

    // 冰冻豌豆主体 - 蓝白色
    graphics.fillStyle(0xaaddff, 1);
    graphics.fillCircle(0, 0, 8);

    // 内部白色
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(0, 0, 5);

    // 冰晶装饰
    graphics.fillStyle(0xffffff, 0.8);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = Math.cos(angle) * 6;
      const py = Math.sin(angle) * 6;
      graphics.fillCircle(px, py, 2);
    }

    // 生成纹理
    graphics.generateTexture('snow_pea', 20, 20);
    graphics.destroy();

    // 设置纹理
    this.setTexture('snow_pea');

    // 添加光晕效果
    this.setTint(0xaaddff);
  }

  /**
   * 播放命中效果
   */
  protected playHitEffect(): void {
    // 冰霜飞溅效果
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.ellipse(
        this.x,
        this.y,
        10,
        10,
        0xaaddff,
        0.8
      );

      const distance = Phaser.Math.Between(20, 40);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 冰霜扩散
    const frost = this.scene.add.ellipse(this.x, this.y, 60, 60, 0xaaddff, 0.3);
    this.scene.tweens.add({
      targets: frost,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        frost.destroy();
      }
    });
  }
}
