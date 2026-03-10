import Phaser from 'phaser';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState, GRID_CONFIG } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 植物基类
 * 所有植物实体的抽象基类
 */
export abstract class Plant extends Phaser.GameObjects.Sprite {
  // 配置
  protected config: PlantConfig;

  // 位置
  protected row: number;
  protected col: number;

  // 状态
  protected currentHealth: number;
  protected entityState: EntityState = EntityState.IDLE;
  protected isAlive: boolean = true;

  // 音频管理器
  protected audioManager: AudioManager | null = null;

  // 攻击相关
  protected lastAttackTime: number = 0;
  protected attackTarget: Phaser.GameObjects.Sprite | null = null;

  // 动画
  protected animations: Map<string, Phaser.Animations.Animation> = new Map();

  // 冷却相关
  protected isCooldown: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PlantConfig
  ) {
    super(scene, x, y, config.spriteSheet);

    this.config = config;
    this.currentHealth = config.health;
    this.row = 0;
    this.col = 0;

    // 获取音频管理器
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;

    // 添加到场景
    scene.add.existing(this);

    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  protected init(): void {
    this.setupPhysics();
    this.setupAnimations();
    this.setupEventListeners();

    // 播放空闲动画
    this.playIdleAnimation();
  }

  /**
   * 设置物理
   */
  protected setupPhysics(): void {
    // 添加到物理系统
    this.scene.physics.add.existing(this, true);

    // 设置碰撞体
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(60, 80);
    body.setOffset(2, 10);
  }

  /**
   * 设置动画
   */
  protected setupAnimations(): void {
    // 子类实现具体动画
  }

  /**
   * 设置事件监听
   */
  protected setupEventListeners(): void {
    // 子类可重写
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // 检查是否需要攻击
    if (this.canAttack()) {
      this.checkForTarget();
      if (this.attackTarget && this.isTargetInRange()) {
        this.attack(time);
      }
    }

    // 更新特殊能力
    this.updateSpecialAbility(time, delta);
  }

  /**
   * 检查是否可以攻击
   */
  protected canAttack(): boolean {
    return this.config.attackDamage !== undefined && this.config.attackDamage > 0;
  }

  /**
   * 检查目标是否在范围内
   */
  protected isTargetInRange(): boolean {
    if (!this.attackTarget || !this.attackTarget.active) return false;

    const targetRow = this.attackTarget.getData('row') as number;
    return targetRow === this.row && this.attackTarget.x > this.x;
  }

  /**
   * 寻找攻击目标
   */
  protected checkForTarget(): void {
    // 通过游戏事件请求获取目标
    this.scene.game.events.emit('plant:check_target', {
      row: this.row,
      plant: this
    });
  }

  /**
   * 设置攻击目标
   */
  public setAttackTarget(target: Phaser.GameObjects.Sprite | null): void {
    this.attackTarget = target;
  }

  /**
   * 攻击
   */
  protected attack(time: number): void {
    if (this.isCooldown) return;

    const attackInterval = this.config.attackInterval || 1500; // 配置中已是毫秒
    if (time - this.lastAttackTime < attackInterval) return;

    this.lastAttackTime = time;
    this.entityState = EntityState.ATTACK;
    this.playAttackAnimation();

    // 发射投射物
    this.fireProjectile();

    // 攻击后回到空闲状态
    this.scene.time.delayedCall(300, () => {
      if (this.isAlive) {
        this.entityState = EntityState.IDLE;
        this.playIdleAnimation();
      }
    });
  }

  /**
   * 发射投射物
   */
  protected fireProjectile(): void {
    if (!this.config.projectileType) return;

    this.scene.game.events.emit(GameEvents.PROJECTILE_FIRED, {
      x: this.x + 20,
      y: this.y - 10,
      type: this.config.projectileType,
      damage: this.config.attackDamage || 20,
      speed: 300,
      row: this.row,
      source: this
    });

    // 播放射击音效
    this.scene.game.events.emit('audio:play', 'shoot');
  }

  /**
   * 更新特殊能力
   */
  protected updateSpecialAbility(_time: number, _delta: number): void {
    // 子类实现
  }

  /**
   * 受到伤害
   */
  public takeDamage(amount: number): void {
    if (!this.isAlive) return;

    // 播放被攻击音效（随机播放，避免过于频繁）
    if (Math.random() < 0.3) {
      this.audioManager?.playSfx(SoundEffect.SPLAT);
    }

    this.currentHealth -= amount;
    this.showDamageEffect();

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  /**
   * 显示受伤效果
   */
  protected showDamageEffect(): void {
    // 闪烁效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1
    });
  }

  /**
   * 死亡
   */
  public die(): void {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.entityState = EntityState.DEAD;

    // 发送死亡事件
    this.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: this.row,
      col: this.col,
      plant: this
    });

    // 死亡动画
    this.playDeathAnimation();

    // 销毁
    this.scene.time.delayedCall(500, () => {
      this.destroy();
    });
  }

  /**
   * 播放空闲动画
   */
  protected playIdleAnimation(): void {
    const animKey = `${this.config.id}_idle`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, true);
    }
  }

  /**
   * 播放攻击动画
   */
  protected playAttackAnimation(): void {
    const animKey = `${this.config.id}_attack`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, false);
    }
  }

  /**
   * 播放受伤动画
   */
  protected playHurtAnimation(): void {
    const animKey = `${this.config.id}_hurt`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, false);
    }
  }

  /**
   * 播放死亡动画
   */
  protected playDeathAnimation(): void {
    // 缩放消失效果
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 400,
      ease: 'Power2'
    });
  }

  /**
   * 设置网格位置
   */
  public setGridPosition(row: number, col: number): void {
    this.row = row;
    this.col = col;
  }

  /**
   * 获取网格行
   */
  public getRow(): number {
    return this.row;
  }

  /**
   * 获取网格列
   */
  public getCol(): number {
    return this.col;
  }

  /**
   * 获取配置
   */
  public getConfig(): PlantConfig {
    return this.config;
  }

  /**
   * 获取当前生命值
   */
  public getHealth(): number {
    return this.currentHealth;
  }

  /**
   * 获取最大生命值
   */
  public getMaxHealth(): number {
    return this.config.health;
  }

  /**
   * 是否存活
   */
  public isPlantAlive(): boolean {
    return this.isAlive;
  }

  /**
   * 获取状态
   */
  public getEntityState(): EntityState {
    return this.entityState;
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
