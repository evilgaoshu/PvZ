import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class Squash extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new SquashIdleState(this));
    this.stateMachine.addState(EntityState.ATTACK, new SquashAttackState(this));
    this.stateMachine.addState(EntityState.DEAD, new SquashDeadState(this));
  }
}

class SquashIdleState implements IState {
  constructor(private plant: Squash) {}
  enter() {
    this.plant.playAnimation('squash_idle', true);
  }
  update() {
    // Check for target very close
    this.plant.scene.game.events.emit('plant:check_target', {
      row: this.plant.getRow(),
      plant: this.plant,
    });

    const target = this.plant.getAttackTarget();
    if (target && target.active) {
      // Squash only attacks when zombies are very close (e.g., within 60 pixels)
      if (Math.abs(target.x - this.plant.x) < 60) {
        this.plant.stateMachine.changeState(EntityState.ATTACK);
      }
    }
  }
  exit() {}
}

class SquashAttackState implements IState {
  constructor(private plant: Squash) {}
  enter() {
    // Jump animation
    this.plant.scene.tweens.add({
      targets: this.plant,
      y: this.plant.y - 100,
      duration: 300,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        // Deal damage
        const target = this.plant.getAttackTarget();
        if (target && target.active) {
          (target as any).takeDamage(1800, 'crush');
        } else {
          // Fallback AoE damage if target died while jumping
          this.plant.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
            x: this.plant.x,
            y: this.plant.y,
            damage: 1800,
            type: 'explosion',
          });
        }

        // Shake screen
        this.plant.scene.cameras.main.shake(150, 0.015);
        this.plant.stateMachine.changeState(EntityState.DEAD);
      },
    });
  }
  update() {}
  exit() {}
}

class SquashDeadState implements IState {
  constructor(private plant: Squash) {}
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
