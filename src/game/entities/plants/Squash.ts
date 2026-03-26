import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState, IGameScene } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Squash extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new SquashIdleState());
    this.stateMachine.addState(EntityState.ATTACK, new SquashAttackState());
    this.stateMachine.addState(EntityState.DEAD, new SquashDeadState());
  }
}

class SquashIdleState implements IState<Squash> {
  enter(plant: Squash) {
    plant.playAnimation('squash_idle', true);
  }
  update(plant: Squash, time: number, delta: number) {
    // Check for target very close
    plant.scene.game.events.emit('plant:check_target', {
      row: plant.getRow(),
      plant: plant,
    });

    const target = plant.getAttackTarget();
    if (target && target.active) {
      // Squash only attacks when zombies are very close (e.g., within 60 pixels)
      if (Math.abs(target.x - plant.x) < 60) {
        plant.stateMachine.changeState(EntityState.ATTACK);
      }
    }
  }
  exit(plant: Squash) {}
}

class SquashAttackState implements IState<Squash> {
  enter(plant: Squash) {
    // Jump animation
    plant.scene.tweens.add({
      targets: plant,
      y: plant.y - 100,
      duration: 300,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        // Deal damage
        const target = plant.getAttackTarget();
        if (target && target.active) {
          (target as any).takeDamage(1800, 'crush');
        } else {
          // Fallback AoE damage if target died while jumping
          plant.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
            x: plant.x,
            y: plant.y,
            damage: 1800,
            type: 'explosion',
          });
        }

        // Shake screen
        plant.scene.cameras.main.shake(150, 0.015);
        plant.stateMachine.changeState(EntityState.DEAD);
      },
    });
  }
  update(plant: Squash, time: number, delta: number) {}
  exit(plant: Squash) {}
}

class SquashDeadState implements IState<Squash> {
  enter(plant: Squash) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Squash, time: number, delta: number) {}
  exit(plant: Squash) {}
}
