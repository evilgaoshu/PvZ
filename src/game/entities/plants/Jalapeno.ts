import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Jalapeno extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new JalapenoIdleState(this));
    this.stateMachine.addState(
      EntityState.ATTACK,
      new JalapenoExplodeState(this)
    );
    this.stateMachine.addState(EntityState.DEAD, new JalapenoDeadState(this));
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

class JalapenoIdleState implements IState {
  private timer: number = 0;
  constructor(private plant: Jalapeno) {}
  enter() {
    this.plant.playAnimation('jalapeno_idle', true);
    this.timer = 0;
  }
  update(_t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 800) {
      // 稍微延迟爆炸
      this.plant.stateMachine.changeState(EntityState.ATTACK);
    }
  }
  exit() {}
}

class JalapenoExplodeState implements IState {
  constructor(private plant: Jalapeno) {}
  enter() {
    this.plant.explode();
    this.plant.stateMachine.changeState(EntityState.DEAD);
  }
  update() {}
  exit() {}
}

class JalapenoDeadState implements IState {
  constructor(private plant: Jalapeno) {}
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
