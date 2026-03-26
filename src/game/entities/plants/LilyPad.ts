import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class LilyPad extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new LilyIdleState());
    this.stateMachine.addState(EntityState.DEAD, new LilyDeadState());
  }
}

class LilyIdleState implements IState<LilyPad> {
  enter(plant: LilyPad) {
    plant.scene.tweens.add({
      targets: plant,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  update(plant: LilyPad, time: number, delta: number) {}
  exit(plant: LilyPad) {}
}

class LilyDeadState implements IState<LilyPad> {
  enter(plant: LilyPad) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: LilyPad, time: number, delta: number) {}
  exit(plant: LilyPad) {}
}
