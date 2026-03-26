import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState, IGameScene } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Spikeweed extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
    // Spikeweed can't be eaten normally
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new SpikeweedIdleState());
    this.stateMachine.addState(EntityState.DEAD, new SpikeweedDeadState());
  }
}

class SpikeweedIdleState implements IState<Spikeweed> {
  private lastAttackTime: number = 0;
  enter(plant: Spikeweed) {
    plant.playAnimation('spikeweed_idle', true);
  }
  update(plant: Spikeweed, time: number, delta: number) {
    // Damage zombies walking over it
    if (time - this.lastAttackTime >= 1000) {
      let hit = false;
      const gameScene = plant.scene as unknown as IGameScene;
      const zombies = gameScene.zombiesByRow?.get(plant.getRow());
      if (zombies) {
        for (const z of zombies) {
          if (Math.abs(z.x - plant.x) < 40) {
            z.takeDamage(20, 'normal'); // Deal damage
            hit = true;
          }
        }
      }
      if (hit) {
        this.lastAttackTime = time;
        // Small spike animation
        plant.scene.tweens.add({
          targets: plant,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
      }
    }
  }
  exit(plant: Spikeweed) {}
}

class SpikeweedDeadState implements IState<Spikeweed> {
  enter(plant: Spikeweed) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Spikeweed, time: number, delta: number) {}
  exit(plant: Spikeweed) {}
}
