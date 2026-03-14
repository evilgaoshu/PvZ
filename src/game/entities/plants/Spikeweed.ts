import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Spikeweed extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
    // Spikeweed can't be eaten normally
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new SpikeweedIdleState(this));
    this.stateMachine.addState(EntityState.DEAD, new SpikeweedDeadState(this));
  }
}

class SpikeweedIdleState implements IState {
  private lastAttackTime: number = 0;
  constructor(private plant: Spikeweed) {}
  enter() {
    this.plant.playAnimation('spikeweed_idle', true);
  }
  update(time: number) {
    // Damage zombies walking over it
    if (time - this.lastAttackTime >= 1000) {
      let hit = false;
      const zombies = (this.plant.scene as any).zombiesByRow?.get(
        this.plant.getRow()
      );
      if (zombies) {
        for (const z of zombies) {
          if (Math.abs(z.x - this.plant.x) < 40) {
            z.takeDamage(20, 'normal'); // Deal damage
            hit = true;
          }
        }
      }
      if (hit) {
        this.lastAttackTime = time;
        // Small spike animation
        this.plant.scene.tweens.add({
          targets: this.plant,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
      }
    }
  }
  exit() {}
}

class SpikeweedDeadState implements IState {
  constructor(private plant: Spikeweed) {}
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
