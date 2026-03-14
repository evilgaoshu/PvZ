import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Chomper extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new ChomperIdleState(this));
    this.stateMachine.addState(
      EntityState.ATTACK,
      new ChomperAttackState(this)
    );
    this.stateMachine.addState(EntityState.DEAD, new ChomperDeadState(this));
  }
}

class ChomperIdleState implements IState {
  constructor(private plant: Chomper) {}
  enter() {
    this.plant.playAnimation('chomper_idle', true);
  }
  update() {
    this.plant.scene.game.events.emit('plant:check_target', {
      row: this.plant.getRow(),
      plant: this.plant,
    });
  }
  exit() {}
}

class ChomperAttackState implements IState {
  private timer: number = 0;
  constructor(private plant: Chomper) {}
  enter() {
    this.plant.playAnimation('chomper_attack', false);
    this.timer = 0;
  }
  update(_t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 2000)
      this.plant.stateMachine.changeState(EntityState.IDLE);
  }
  exit() {}
}

class ChomperDeadState implements IState {
  constructor(private plant: Chomper) {}
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
