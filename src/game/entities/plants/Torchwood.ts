import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Torchwood extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new TorchwoodIdleState(this));
    this.stateMachine.addState(EntityState.DEAD, new TorchwoodDeadState(this));
  }
}

class TorchwoodIdleState implements IState {
  constructor(private plant: Torchwood) {}
  enter() {
    this.plant.playAnimation('torchwood_idle', true);
  }
  update() {}
  exit() {}
}

class TorchwoodDeadState implements IState {
  constructor(private plant: Torchwood) {}
  enter() {
    this.plant.scene.game.events.emit('projectile:plant_removed', {
      row: this.plant.getRow(),
      col: this.plant.getCol(),
      plant: this.plant,
    });
    this.plant.destroy();
  }
  update() {}
  exit() {}
}
