import Phaser from 'phaser';
import { GameEvents } from '@/types/index';

/**
 * 战斗系统
 * 处理攻击、伤害计算、碰撞检测等战斗逻辑
 */
export class CombatSystem {
  private scene: Phaser.Scene;

  // 碰撞组
  private projectileGroup: Phaser.Physics.Arcade.Group | null = null;
  private zombieGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.init();
  }

  /**
   * 初始化
   */
  private init(): void {
    // 创建物理组
    this.projectileGroup = this.scene.physics.add.group();
    this.zombieGroup = this.scene.physics.add.group();

    // 设置碰撞检测
    this.setupCollisions();

    // 监听事件
    this.setupEventListeners();

    console.log('CombatSystem initialized');
  }

  /**
   * 设置碰撞检测
   */
  private setupCollisions(): void {
    if (!this.projectileGroup || !this.zombieGroup) return;

    // 投射物与僵尸的碰撞
    this.scene.physics.add.overlap(
      this.projectileGroup,
      this.zombieGroup,
      (obj1, obj2) => {
        const projectile = obj1 as Phaser.Physics.Arcade.Image;
        const zombie = obj2 as Phaser.Physics.Arcade.Sprite;
        this.onProjectileHit(projectile, zombie);
      }
    );
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 注意：PROJECTILE_FIRED 事件由 GameScene 处理，不在此处重复监听
    // 避免生成重复的投射物

    // 监听僵尸生成
    this.scene.game.events.on(GameEvents.ZOMBIE_SPAWNED, (data: {
      zombieType: string;
      row: number;
      position: { x: number; y: number };
    }) => {
      // 僵尸生成后注册到战斗系统
      console.log(`CombatSystem registered zombie: ${data.zombieType}`);
    });
  }

  /**
   * 投射物击中僵尸
   */
  private onProjectileHit(
    projectile: Phaser.Physics.Arcade.Image,
    zombie: Phaser.Physics.Arcade.Sprite
  ): void {
    // 获取投射物数据
    const damage = projectile.getData('damage') as number;
    const projectileType = projectile.getData('type') as string;

    // 对僵尸造成伤害
    this.damageZombie(zombie, damage, projectileType);

    // 销毁投射物
    projectile.destroy();

    // 发送击中事件
    this.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
      target: zombie,
      damage,
      type: projectileType
    });
  }

  /**
   * 对僵尸造成伤害
   */
  private damageZombie(zombie: Phaser.Physics.Arcade.Sprite, damage: number, type: string): void {
    // 获取当前生命值
    let health = zombie.getData('health') as number;
    health -= damage;

    // 更新生命值
    zombie.setData('health', health);

    // 显示伤害数字
    this.showDamageNumber(zombie.x, zombie.y, damage);

    // 检查死亡
    if (health <= 0) {
      this.killZombie(zombie);
    } else {
      // 受伤动画/效果
      this.playHitEffect(zombie);
    }
  }

  /**
   * 击杀僵尸
   */
  private killZombie(zombie: Phaser.Physics.Arcade.Sprite): void {
    // 播放死亡动画
    this.scene.tweens.add({
      targets: zombie,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 300,
      onComplete: () => {
        zombie.destroy();
      }
    });

    // 发送僵尸死亡事件
    this.scene.game.events.emit(GameEvents.ZOMBIE_DIED, {
      zombie: zombie,
      position: { x: zombie.x, y: zombie.y },
      row: zombie.getData('row')
    });
  }

  /**
   * 显示伤害数字
   */
  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y - 20, damage.toString(), {
      fontSize: '16px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);

    // 向上飘动动画
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * 播放击中效果
   */
  private playHitEffect(target: Phaser.Physics.Arcade.Sprite): void {
    // 闪烁效果
    this.scene.tweens.add({
      targets: target,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1
    });
  }

  /**
   * 检查僵尸是否到达房屋
   */
  public checkZombieReachedHouse(zombie: Phaser.GameObjects.Sprite): boolean {
    // 检查僵尸是否到达最左侧（房屋位置）
    return zombie.x < 200;
  }

  /**
   * 更新
   */
  public update(delta: number): void {
    // 更新战斗逻辑
    // 例如：自动攻击、技能冷却等
  }

  /**
   * 清理
   */
  public destroy(): void {
    // 销毁组
    this.projectileGroup?.destroy();
    this.zombieGroup?.destroy();
  }
}
