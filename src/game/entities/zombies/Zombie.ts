import Phaser from 'phaser';
import type { ZombieConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';
import { IEntityRenderer, SpineRenderer, SpriteRenderer } from '../EntityRenderer';
import { Plant } from '../plants/Plant';

/**
 * 僵尸基类
 * 所有僵尸实体的抽象基类
 */
export abstract class Zombie extends Phaser.Physics.Arcade.Sprite {
  protected config: ZombieConfig;
  protected renderer: IEntityRenderer | null = null;

  protected currentHealth: number;
  protected currentSpeed: number;
  protected entityState: EntityState = EntityState.WALK;
  protected isAlive: boolean = true;
  protected isSlowed: boolean = false;
  protected slowedEndTime: number = 0;
  protected hasLostHead: boolean = false;
  protected isSwimming: boolean = false;
  private duckyTube: Phaser.GameObjects.Image | null = null;

  protected audioManager: AudioManager | null = null;
  protected row: number = 0;
  protected attackTarget: Plant | null = null;
  protected lastAttackTime: number = 0;
  protected isAttacking: boolean = false;
  protected nextGroanTime: number = 0;
  protected currentArmor: number = 0;
  protected usedSpecialAbility: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config.spriteSheet);
    this.config = config;
    this.currentHealth = config.health;
    this.currentSpeed = config.speed;
    this.currentArmor = config.armor || 0;
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;

    this.initRenderer();
    scene.add.existing(this);
    scene.physics.add.existing(this);
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
    this.startWalking();
  }

  protected setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 80).setOffset(10, 10);
    this.setVelocityX(-this.currentSpeed);
    body.allowGravity = false;
  }

  protected setupAnimations(): void {}

  public update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // 1. 同步渲染器位置
    if (this.renderer instanceof SpineRenderer) {
      const obj = this.renderer.getObject();
      obj.setPosition(this.x, this.y).setDepth(this.depth);
    }

    // 2. 水域逻辑
    this.handleWaterLogic();

    // 3. 救生圈同步
    if (this.duckyTube && this.active) {
      this.duckyTube.setPosition(this.x, this.y + 20);
      this.duckyTube.setDepth(this.depth + 0.1);
    }

    if (this.isSlowed && time >= this.slowedEndTime) this.removeSlow();
    if (this.x < 180) { this.scene.game.events.emit('zombie:reached_house', this); return; }

    if (time >= this.nextGroanTime) {
      if (Math.random() < 0.3) this.audioManager?.playSfx(SoundEffect.ZOMBIE_GROAN);
      this.nextGroanTime = time + Phaser.Math.Between(5000, 15000);
    }

    if (this.isAttacking) this.updateAttack(time);
    else this.updateMovement(time, delta);
  }

  private handleWaterLogic(): void {
    const gridSystem = (this.scene as any).gridSystem;
    if (!gridSystem) return;

    // 根据当前物理坐标转换网格坐标，获取实时地形
    const gridPos = gridSystem.screenToGrid(this.x, this.y);
    const inWater = gridPos ? gridSystem.getTerrainType(gridPos.row, gridPos.col) === 'water' : false;

    if (inWater && !this.isSwimming) {
      this.enterWater();
    } else if (!inWater && this.isSwimming) {
      this.exitWater();
    }
  }

  private enterWater(): void {
    this.isSwimming = true;
    if (!this.duckyTube) {
      this.duckyTube = this.scene.add.image(this.x, this.y + 20, 'zombies/ducky_tube');
    }
    this.duckyTube.setVisible(true);
    // 播放水花粒子效果
    VisualEffects.createSplat(this.scene, this.x, this.y + 20, 0x0ea5e9, 15);
  }

  private exitWater(): void {
    this.isSwimming = false;
    this.duckyTube?.setVisible(false);
  }

  public takeDamage(amount: number, type: string = 'normal'): void {
    if (!this.isAlive) return;

    if (this.currentArmor > 0) {
      this.currentArmor -= amount;
      if (this.currentArmor <= 0) {
        this.currentHealth += this.currentArmor;
        this.currentArmor = 0;
        this.onArmorBreak();
      }
    } else {
      this.currentHealth -= amount;
    }

    if (this.currentHealth <= this.config.health * 0.3 && !this.hasLostHead) {
      this.loseHead();
    }

    this.showDamageEffect();
    if (this.currentHealth <= 0) this.die();
  }

  protected loseHead(): void {
    this.hasLostHead = true;
    const head = this.scene.add.image(this.x, this.y - 30, 'zombies/head');
    head.setDepth(this.depth + 1);
    this.scene.tweens.add({
      targets: head,
      x: this.x + Phaser.Math.Between(20, 60),
      y: this.y + 40,
      angle: 360,
      duration: 800,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(2000, () => head.destroy());
      }
    });
    this.audioManager?.playSfx(SoundEffect.SPLAT);
  }

  protected onArmorBreak(): void {
    VisualEffects.createSplat(this.scene, this.x, this.y, 0x94a3b8, 10);
  }

  protected die(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.entityState = EntityState.DEAD;
    this.setVelocityX(0);
    this.audioManager?.playSfx(SoundEffect.ZOMBIE_DIE);
    VisualEffects.shakeCamera(this.scene, 0.005, 200);
    this.renderer?.play(`${this.config.id}_die`, false);
    
    if (this.duckyTube) this.duckyTube.destroy();

    this.scene.tweens.add({
      targets: this.renderer instanceof SpriteRenderer ? this : (this.renderer as any).getObject(),
      angle: -90, alpha: 0, duration: 800,
      onComplete: () => { this.renderer?.destroy(); this.destroy(); }
    });
  }

  protected showDamageEffect(): void {
    VisualEffects.flashSprite(this, 0xffffff, 80);
    if (!(this.renderer instanceof SpineRenderer)) VisualEffects.bounceScale(this, 1.05, 100);
  }

  public startWalking(): void {
    this.entityState = EntityState.WALK;
    this.isAttacking = false;
    this.attackTarget = null;
    this.setVelocityX(-this.currentSpeed);
    this.renderer?.play(`${this.config.id}_walk`, true);
  }

  public startAttacking(target: Plant): void {
    if (this.hasLostHead) return;
    this.isAttacking = true;
    this.attackTarget = target;
    this.setVelocityX(0);
    this.renderer?.play(`${this.config.id}_eat`, true);
  }

  protected updateAttack(time: number): void {
    if (!this.attackTarget || !this.attackTarget.active || !this.attackTarget.isPlantAlive()) {
      this.startWalking();
      return;
    }
    if (time - this.lastAttackTime >= this.config.attackInterval) {
      this.lastAttackTime = time;
      this.attackTarget.takeDamage(this.config.damage);
      this.playBiteAnimation();
    }
  }

  protected playBiteAnimation(): void {
    this.scene.tweens.add({
      targets: this.renderer instanceof SpriteRenderer ? this : (this.renderer as any).getObject(),
      x: '+=5', duration: 50, yoyo: true
    });
  }

  protected updateMovement(_time: number, _delta: number): void {
    this.setVelocityX(-this.currentSpeed);
    this.checkSpecialAbility();
  }

  protected checkSpecialAbility(): void {}

  public applySlow(duration: number): void {
    this.isSlowed = true;
    this.slowedEndTime = this.scene.time.now + duration;
    this.currentSpeed = this.config.speed * 0.5;
    this.setTint(0x00ffff);
  }

  protected removeSlow(): void {
    this.isSlowed = false;
    this.clearTint();
    this.currentSpeed = this.config.speed;
  }

  public getRow(): number { return this.row; }
  public setRow(row: number): void { this.row = row; }
  public isZombieAlive(): boolean { return this.isAlive; }
}
