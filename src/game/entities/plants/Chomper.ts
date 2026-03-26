import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Chomper extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new ChomperIdleState());
    this.stateMachine.addState(EntityState.ATTACK, new ChomperAttackState());
    this.stateMachine.addState(EntityState.DEAD, new ChomperDeadState());
  }
}

class ChomperIdleState implements IState<Chomper> {
  enter(plant: Chomper) {
    plant.playAnimation('chomper_idle', true);
  }
  update(plant: Chomper, time: number, delta: number) {
    plant.scene.game.events.emit('plant:check_target', {
      row: plant.getRow(),
      plant: plant,
    });
  }
  exit(plant: Chomper) {}
}

class ChomperAttackState implements IState<Chomper> {
  private timer: number = 0;
  enter(plant: Chomper) {
    plant.playAnimation('chomper_attack', false);
    this.timer = 0;
  }
  update(plant: Chomper, _t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 2000) plant.stateMachine.changeState(EntityState.IDLE);
  }
  exit(plant: Chomper) {}
}

class ChomperDeadState implements IState<Chomper> {
  enter(plant: Chomper) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Chomper, time: number, delta: number) {}
  exit(plant: Chomper) {}
}
