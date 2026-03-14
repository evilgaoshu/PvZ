import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

/**
 * 豌豆射手 (状态机版)
 */
export class Peashooter extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new PeashooterIdleState(this));
    this.stateMachine.addState(
      EntityState.ATTACK,
      new PeashooterAttackState(this)
    );
    this.stateMachine.addState(EntityState.DEAD, new PeashooterDeadState(this));
  }

  public fire(): void {
    this.scene.game.events.emit(GameEvents.PROJECTILE_FIRED, {
      x: this.x + 30,
      y: this.y - 15,
      type: this.config.projectileType,
      damage: this.config.attackDamage,
      speed: 400,
      row: this.row,
      source: this,
    });
  }
}

class PeashooterIdleState implements IState {
  constructor(private plant: Peashooter) {}
  enter() {
    this.plant.playAnimation(`${this.plant.getConfig().id}_idle`, true);
  }
  update() {
    // 检查是否有目标进入视野
    this.plant.scene.game.events.emit('plant:check_target', {
      row: this.plant.getRow(),
      plant: this.plant,
    });
  }
  exit() {}
}

class PeashooterAttackState implements IState {
  private lastFireTime: number = 0;
  constructor(private plant: Peashooter) {}
  enter() {
    this.lastFireTime = 0;
  }
  update(time: number) {
    const interval = this.plant.getConfig().attackInterval || 1500;
    if (time - this.lastFireTime >= interval) {
      this.lastFireTime = time;
      this.plant.fire();
    }
  }
  exit() {}
}

class PeashooterDeadState implements IState {
  constructor(private plant: Peashooter) {}
  enter() {
    this.plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: this.plant.getRow(),
      col: this.plant.getCol(),
      plant: this.plant,
    });
    this.plant.destroy();
  }
  update() {}
  exit() {}
}
