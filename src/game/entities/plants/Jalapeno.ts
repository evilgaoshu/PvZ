import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Jalapeno extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new JalapenoIdleState());
    this.stateMachine.addState(EntityState.ATTACK, new JalapenoExplodeState());
    this.stateMachine.addState(EntityState.DEAD, new JalapenoDeadState());
  }

  public explode(): void {
    // 触发本行爆炸
    this.scene.game.events.emit('projectile:lane_explosion', {
      row: this.row,
      damage: 1800,
    });

    // 视觉震动
    this.scene.cameras.main.shake(300, 0.02);
  }
}

class JalapenoIdleState implements IState<Jalapeno> {
  private timer: number = 0;
  enter(plant: Jalapeno) {
    plant.playAnimation('jalapeno_idle', true);
    this.timer = 0;
  }
  update(plant: Jalapeno, _t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 800) {
      // 稍微延迟爆炸
      plant.stateMachine.changeState(EntityState.ATTACK);
    }
  }
  exit(plant: Jalapeno) {}
}

class JalapenoExplodeState implements IState<Jalapeno> {
  enter(plant: Jalapeno) {
    plant.explode();
    plant.stateMachine.changeState(EntityState.DEAD);
  }
  update(plant: Jalapeno, time: number, delta: number) {}
  exit(plant: Jalapeno) {}
}

class JalapenoDeadState implements IState<Jalapeno> {
  enter(plant: Jalapeno) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Jalapeno, time: number, delta: number) {}
  exit(plant: Jalapeno) {}
}
