import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { EntityState, GameEvents } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Torchwood extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new TorchwoodIdleState());
    this.stateMachine.addState(EntityState.DEAD, new TorchwoodDeadState());
  }
}

class TorchwoodIdleState implements IState<Torchwood> {
  enter(plant: Torchwood) {
    plant.playAnimation('torchwood_idle', true);
  }
  update(plant: Torchwood, time: number, delta: number) {}
  exit(plant: Torchwood) {}
}

class TorchwoodDeadState implements IState<Torchwood> {
  enter(plant: Torchwood) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Torchwood, time: number, delta: number) {}
  exit(plant: Torchwood) {}
}
