import Phaser from 'phaser';
import type { ZombieConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';

/**
 * 僵尸基类
 * 所有僵尸实体的抽象基类
 */
export abstract class Zombie extends Phaser.Physics.Arcade.Sprite {
  // 配置
  protected config: ZombieConfig;

  // 状态
  protected currentHealth: number;
  protected currentSpeed: number;
  protected entityState: EntityState = EntityState.WALK;
  protected isAlive: boolean = true;
  protected isSlowed: boolean = false;
  protected slowedEndTime: number = 0;

  // 音频管理器
  protected audioManager: AudioManager | null = null;

  // 位置
  protected row: number = 0;

  // 攻击相关
  protected attackTarget: Plant | null = null;
  protected lastAttackTime: number = 0;
  protected isAttacking: boolean = false;

  // 呻吟计时器
  protected nextGroanTime: number = 0;

  // 护甲
  protected currentArmor: number = 0;

  // 特殊能力标记
  protected usedSpecialAbility: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ZombieConfig
  ) {
    super(scene, x, y, config.spriteSheet);

    this.config = config;
    this.currentHealth = config.health;
    this.currentSpeed = config.speed;
    this.currentArmor = config.armor || 0;

    // 获取音频管理器
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;

    // 添加到场景和物理系统
    scene.add.existing(this);
    scene.physics.add.existing(this);

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

    // 添加阴影
    VisualEffects.addShadow(this.scene, this);

    // 开始行走
    this.startWalking();
  }

  /**
   * 设置物理
   */
  protected setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // 设置碰撞体
    body.setSize(40, 80);
    body.setOffset(10, 10);

    // 设置初始速度（向左移动）
    this.setVelocityX(-this.currentSpeed);

    // 禁用重力
    body.allowGravity = false;
  }

  /**
   * 设置动画
   */
  protected setupAnimations(): void {
    // 子类实现
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

    // 检查减速效果
    if (this.isSlowed && time >= this.slowedEndTime) {
      this.removeSlow();
    }

    // 检查是否到达房屋（最左侧）
    if (this.x < 180) {
      this.scene.game.events.emit('zombie:reached_house', this);
      return;
    }

    // 随机呻吟（每5-15秒一次）
    if (time >= this.nextGroanTime) {
      if (Math.random() < 0.3) {
        this.audioManager?.playSfx(SoundEffect.ZOMBIE_GROAN);
      }
      this.nextGroanTime = time + Phaser.Math.Between(5000, 15000);
    }

    // 更新行为
    if (this.isAttacking) {
      this.updateAttack(time);
    } else {
      this.updateMovement(time, delta);
    }
  }

  /**
   * 更新移动
   */
  protected updateMovement(time: number, delta: number): void {
    // 基础移动速度
    let speed = this.currentSpeed;

    // 应用减速效果
    if (this.isSlowed) {
      speed *= 0.5;
    }

    // 向左移动
    this.setVelocityX(-speed);

    // 检查是否可以触发特殊能力
    this.checkSpecialAbility();
  }

  /**
   * 检查特殊能力
   */
  protected checkSpecialAbility(): void {
    // 子类实现
  }

  /**
   * 开始行走
   */
  protected startWalking(): void {
    this.entityState = EntityState.WALK;
    this.isAttacking = false;
    this.playWalkAnimation();
  }

  /**
   * 开始攻击植物
   */
  public startAttacking(target: Plant): void {
    if (this.isAttacking || !this.isAlive) return;

    this.isAttacking = true;
    this.attackTarget = target;
    this.entityState = EntityState.EAT;

    // 停止移动
    this.setVelocityX(0);

    // 播放攻击动画
    this.playAttackAnimation();
  }

  /**
   * 停止攻击
   */
  public stopAttacking(): void {
    if (!this.isAttacking) return;

    this.isAttacking = false;
    this.attackTarget = null;
    this.startWalking();
  }

  /**
   * 更新攻击
   */
  protected updateAttack(time: number): void {
    if (!this.attackTarget || !this.attackTarget.active) {
      this.stopAttacking();
      return;
    }

    // 检查攻击间隔
    const attackInterval = this.config.attackInterval;
    if (time - this.lastAttackTime < attackInterval) return;

    this.lastAttackTime = time;

    // 造成伤害
    this.attackTarget.takeDamage(this.config.damage);

    // 播放咬击动画
    this.playBiteAnimation();

    // 播放音效
    this.audioManager?.playSfx(SoundEffect.ZOMBIE_EATING);
  }

  /**
   * 受到伤害
   */
  public takeDamage(amount: number, damageType: string = 'normal'): void {
    if (!this.isAlive) return;

    // 先减少护甲
    if (this.currentArmor > 0) {
      if (this.currentArmor >= amount) {
        this.currentArmor -= amount;
        this.showArmorHitEffect();
        return;
      } else {
        amount -= this.currentArmor;
        this.currentArmor = 0;
        this.onArmorBreak();
      }
    }

    // 减少生命值
    this.currentHealth -= amount;

    // 显示伤害效果
    this.showDamageEffect();
    
    // 使用统一的漂浮文字
    VisualEffects.floatText(this.scene, this.x, this.y - 40, `-${Math.round(amount)}`, {
      color: '#ef4444',
      fontSize: '18px'
    });

    // 播放打击粒子效果
    VisualEffects.createSplat(this.scene, this.x, this.y, 0xffcccc, 5);

    // 检查死亡
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  /**
   * 护甲被打破
   */
  protected onArmorBreak(): void {
    // 播放护甲破碎效果
    VisualEffects.createSplat(this.scene, this.x, this.y, 0xdddddd, 10);
    VisualEffects.shakeCamera(this.scene, 0.003, 100);
  }

  /**
   * 显示护甲受击效果
   */
  protected showArmorHitEffect(): void {
    // 播放金属击中音效
    this.audioManager?.playSfx(SoundEffect.METAL_HIT);

    // 使用统一的闪烁效果
    VisualEffects.flashSprite(this, 0xcccccc, 80);
    
    // 缩放回弹
    VisualEffects.bounceScale(this, 1.05, 100);
  }

  /**
   * 显示伤害效果
   */
  protected showDamageEffect(): void {
    // 闪烁红色
    VisualEffects.flashSprite(this, 0xff0000, 100);

    this.scene.time.delayedCall(110, () => {
      // 如果有减速，恢复蓝色
      if (this.isSlowed && this.active) {
        this.setTint(0x88ccff);
      }
    });
  }

  /**
   * 显示伤害数字
   */
  protected showDamageNumber(amount: number): void {
    // 已被 VisualEffects.floatText 替代
  }

  /**
   * 减速效果
   */
  public applySlow(duration: number = 3000): void {
    if (this.isSlowed) {
      // 延长减速时间
      this.slowedEndTime += duration;
      return;
    }

    this.isSlowed = true;
    this.slowedEndTime = this.scene.time.now + duration;

    // 蓝色色调
    this.setTint(0x88ccff);

    // 减速粒子效果
    const ice = this.scene.add.ellipse(this.x, this.y, 50, 80, 0x88ccff, 0.3);
    this.scene.tweens.add({
      targets: ice,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        ice.destroy();
      }
    });
  }

  /**
   * 移除减速
   */
  protected removeSlow(): void {
    this.isSlowed = false;
    this.clearTint();

    // 恢复速度
    this.currentSpeed = this.config.speed;
  }

  /**
   * 死亡
   */
  protected die(): void {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.entityState = EntityState.DEAD;

    // 停止移动
    this.setVelocityX(0);

    // 播放僵尸死亡音效
    this.audioManager?.playSfx(SoundEffect.ZOMBIE_DIE);

    // 屏幕微抖动
    VisualEffects.shakeCamera(this.scene, 0.005, 200);

    // 发送死亡事件
    this.scene.game.events.emit(GameEvents.ZOMBIE_DIED, {
      zombie: this,
      position: { x: this.x, y: this.y },
      row: this.row,
      type: this.config.id
    });

    // 播放死亡动画
    this.playDeathAnimation();

    // 销毁
    this.scene.time.delayedCall(1000, () => {
      this.destroy();
    });
  }

  /**
   * 播放行走动画
   */
  protected playWalkAnimation(): void {
    const animKey = `${this.config.id}_walk`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, true);
    }
  }

  /**
   * 播放攻击动画
   */
  protected playAttackAnimation(): void {
    const animKey = `${this.config.id}_eat`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, true);
    }
  }

  /**
   * 播放咬击动画效果
   */
  protected playBiteAnimation(): void {
    // 头部向前动画
    this.scene.tweens.add({
      targets: this,
      x: this.x + 5,
      duration: 100,
      yoyo: true
    });
  }

  /**
   * 播放死亡动画
   */
  protected playDeathAnimation(): void {
    // 播放死亡动画
    const animKey = `${this.config.id}_die`;
    if (this.anims.exists(animKey)) {
      this.play(animKey, false);
    }

    // 倒地效果
    this.scene.tweens.add({
      targets: this,
      angle: -90,
      alpha: 0,
      duration: 800,
      ease: 'Power2'
    });
  }

  /**
   * 设置行
   */
  public setRow(row: number): void {
    this.row = row;
    this.setData('row', row);
  }

  /**
   * 获取行
   */
  public getRow(): number {
    return this.row;
  }

  /**
   * 获取配置
   */
  public getConfig(): ZombieConfig {
    return this.config;
  }

  /**
   * 获取当前生命值
   */
  public getHealth(): number {
    return this.currentHealth;
  }

  /**
   * 获取护甲值
   */
  public getArmor(): number {
    return this.currentArmor;
  }

  /**
   * 是否存活
   */
  public isZombieAlive(): boolean {
    return this.isAlive;
  }

  /**
   * 是否被减速
   */
  public getIsSlowed(): boolean {
    return this.isSlowed;
  }

  /**
   * 是否正在攻击
   */
  public getIsAttacking(): boolean {
    return this.isAttacking;
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.attackTarget = null;
    super.destroy(fromScene);
  }
}

// 导入Plant类型用于类型引用
import { Plant } from '../plants/Plant';
