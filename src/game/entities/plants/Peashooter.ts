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
    this.stateMachine.addState(EntityState.IDLE, new PeashooterIdleState());
    this.stateMachine.addState(EntityState.ATTACK, new PeashooterAttackState());
    this.stateMachine.addState(EntityState.DEAD, new PeashooterDeadState());
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

class PeashooterIdleState implements IState<Peashooter> {
  enter(plant: Peashooter) {
    plant.playAnimation(`${plant.getConfig().id}_idle`, true);
  }
  update(plant: Peashooter, time: number, delta: number) {
    // 检查是否有目标进入视野
    plant.scene.game.events.emit('plant:check_target', {
      row: plant.getRow(),
      plant: plant,
    });
  }
  exit(plant: Peashooter) {}
}

class PeashooterAttackState implements IState<Peashooter> {
  private lastFireTime: number = 0;
  enter(plant: Peashooter) {
    this.lastFireTime = 0;
  }
  update(plant: Peashooter, time: number, delta: number) {
    // 持续检查目标是否依然存在于该行
    plant.scene.game.events.emit('plant:check_target', {
      row: plant.getRow(),
      plant: plant,
    });

    if (!plant.getAttackTarget()) {
      plant.stateMachine.changeState(EntityState.IDLE);
      return;
    }

    const interval = plant.getConfig().attackInterval || 1500;
    if (time - this.lastFireTime >= interval) {
      this.lastFireTime = time;
      plant.fire();
    }
  }
  exit(plant: Peashooter) {}
}

class PeashooterDeadState implements IState<Peashooter> {
  enter(plant: Peashooter) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Peashooter, time: number, delta: number) {}
  exit(plant: Peashooter) {}
}
