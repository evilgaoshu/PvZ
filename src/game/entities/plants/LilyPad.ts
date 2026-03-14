import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class LilyPad extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new LilyIdleState(this));
    this.stateMachine.addState(EntityState.DEAD, new LilyDeadState(this));
  }
}

class LilyIdleState implements IState {
  constructor(private plant: LilyPad) {}
  enter() {
    this.plant.scene.tweens.add({
      targets: this.plant,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  update() {}
  exit() {}
}

class LilyDeadState implements IState {
  constructor(private plant: LilyPad) {}
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
