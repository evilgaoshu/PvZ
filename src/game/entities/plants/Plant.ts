import Phaser from 'phaser';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';
import { IEntityRenderer, SpineRenderer, SpriteRenderer } from '../EntityRenderer';

export enum DamageState { HEALTHY, HURT, CRITICAL }

/**
 * 植物基类
 * 所有植物实体的抽象基类
 */
export abstract class Plant extends Phaser.GameObjects.Sprite {
  protected config: PlantConfig;
  protected renderer: IEntityRenderer | null = null;

  protected row: number = 0;
  protected col: number = 0;
  protected currentHealth: number;
  protected entityState: EntityState = EntityState.IDLE;
  protected isAlive: boolean = true;
  protected damageState: DamageState = DamageState.HEALTHY;

  protected audioManager: AudioManager | null = null;
  protected lastAttackTime: number = 0;
  protected attackTarget: Phaser.GameObjects.Sprite | null = null;
  protected isCooldown: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config.spriteSheet);
    this.config = config;
    this.currentHealth = config.health;
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;

    this.initRenderer();
    scene.add.existing(this);
    this.init();
  }

  private initRenderer(): void {
    const spineKey = (this.config as any).spineKey;
    if (spineKey && (this.scene as any).spine) {
      this.renderer = new SpineRenderer(this.scene, this.x, this.y, spineKey, spineKey);
      this.setAlpha(0);
    } else {
      this.renderer = new SpriteRenderer(this);
    }
  }

  protected init(): void {
    this.setupPhysics();
    this.setupAnimations();
    VisualEffects.addShadow(this.scene, this);
    this.playIdleAnimation();
  }

  protected setupPhysics(): void {
    this.scene.physics.add.existing(this, true);
    (this.body as Phaser.Physics.Arcade.StaticBody).setSize(60, 80).setOffset(2, 10);
  }

  protected setupAnimations(): void {}

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.renderer instanceof SpineRenderer) {
      const obj = this.renderer.getObject();
      obj.setPosition(this.x, this.y).setDepth(this.depth);
    }
  }

  public update(time: number, delta: number): void {
    if (!this.isAlive) return;
    if (this.canAttack()) {
      this.checkForTarget();
      if (this.attackTarget && this.isTargetInRange()) this.attack(time);
    }
    this.updateSpecialAbility(time, delta);
  }

  protected canAttack(): boolean {
    return this.config.attackDamage !== undefined && this.config.attackDamage > 0;
  }

  protected isTargetInRange(): boolean {
    if (!this.attackTarget || !this.attackTarget.active) return false;
    const targetRow = this.attackTarget.getData('row') as number;
    return targetRow === this.row && this.attackTarget.x > this.x;
  }

  protected checkForTarget(): void {
    this.scene.game.events.emit('plant:check_target', { row: this.row, plant: this });
  }

  public setAttackTarget(target: Phaser.GameObjects.Sprite | null): void {
    this.attackTarget = target;
  }

  protected attack(time: number): void {
    if (this.isCooldown) return;
    if (time - this.lastAttackTime < (this.config.attackInterval || 1500)) return;

    this.lastAttackTime = time;
    this.entityState = EntityState.ATTACK;
    this.playAttackAnimation();
    this.fireProjectile();

    this.scene.time.delayedCall(300, () => {
      if (this.isAlive) { this.entityState = EntityState.IDLE; this.playIdleAnimation(); }
    });
  }

  protected fireProjectile(): void {
    if (!this.config.projectileType) return;
    this.scene.game.events.emit(GameEvents.PROJECTILE_FIRED, {
      x: this.x + 20, y: this.y - 10, type: this.config.projectileType,
      damage: this.config.attackDamage || 20, speed: 300, row: this.row, source: this
    });
    this.scene.game.events.emit('audio:play', 'shoot');
  }

  protected updateSpecialAbility(_time: number, _delta: number): void {}

  public takeDamage(amount: number): void {
    if (!this.isAlive) return;
    if (Math.random() < 0.3) this.audioManager?.playSfx(SoundEffect.SPLAT);

    this.currentHealth -= amount;
    this.updateDamageState();
    this.showDamageEffect();

    if (this.currentHealth <= 0) this.die();
  }

  private updateDamageState(): void {
    const healthPercent = this.currentHealth / this.config.health;
    let newState = DamageState.HEALTHY;
    if (healthPercent < 0.35) newState = DamageState.CRITICAL;
    else if (healthPercent < 0.7) newState = DamageState.HURT;

    if (newState !== this.damageState) {
      this.damageState = newState;
      this.onDamageStateChange(newState);
    }
  }

  protected onDamageStateChange(state: DamageState): void {
    // 基础反馈：受伤越重颜色越深
    if (state === DamageState.HURT) this.renderer?.setTint(0xdddddd);
    else if (state === DamageState.CRITICAL) this.renderer?.setTint(0xaaaaaa);
  }

  protected showDamageEffect(): void {
    if (this.renderer instanceof SpriteRenderer) VisualEffects.flashSprite(this, 0xffffff, 80);
    VisualEffects.bounceScale(this, 1.05, 100);
  }

  public die(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.entityState = EntityState.DEAD;
    this.scene.game.events.emit(GameEvents.PLANT_REMOVED, { row: this.row, col: this.col, plant: this });
    this.playDeathAnimation();
    this.scene.time.delayedCall(500, () => { this.renderer?.destroy(); this.destroy(); });
  }

  protected playIdleAnimation(): void { this.renderer?.play(`${this.config.id}_idle`, true); }
  protected playAttackAnimation(): void { this.renderer?.play(`${this.config.id}_attack`, false); }
  protected playDeathAnimation(): void {
    const target = this.renderer instanceof SpriteRenderer ? this : (this.renderer as any).getObject();
    this.scene.tweens.add({ targets: target, scaleX: 0.1, scaleY: 0.1, alpha: 0, duration: 400 });
  }

  public setGridPosition(r: number, c: number): void { this.row = r; this.col = c; }
  public getRow(): number { return this.row; }
  public getCol(): number { return this.col; }
  public isPlantAlive(): boolean { return this.isAlive; }
  public getMaxHealth(): number { return this.config.health; }
}
