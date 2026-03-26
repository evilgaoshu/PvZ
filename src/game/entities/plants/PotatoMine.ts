import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class PotatoMine extends Plant {
  private isArmed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new PotatoMineUnarmedState());
    this.stateMachine.addState(EntityState.ATTACK, new PotatoMineArmedState());
    this.stateMachine.addState(EntityState.DEAD, new PotatoMineDeadState());
  }

  public setArmed(armed: boolean): void {
    this.isArmed = armed;
  }

  public getIsArmed(): boolean {
    return this.isArmed;
  }

  public explode(): void {
    this.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
      x: this.x,
      y: this.y,
      damage: 1800,
      type: 'explosion',
    });
    this.scene.cameras.main.shake(150, 0.01);
  }
}

class PotatoMineUnarmedState implements IState<PotatoMine> {
  private timer: number = 0;
  private readonly ARM_TIME = 15000; // 15 seconds to arm

  enter(plant: PotatoMine) {
    plant.playAnimation('potato_mine_idle', true);
    plant.setAlpha(0.5); // Visual cue that it's unarmed
    this.timer = 0;
    plant.setArmed(false);
  }
  update(plant: PotatoMine, _t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= this.ARM_TIME) {
      plant.stateMachine.changeState(EntityState.ATTACK);
    }
  }
  exit(plant: PotatoMine) {}
}

class PotatoMineArmedState implements IState<PotatoMine> {
  enter(plant: PotatoMine) {
    plant.setAlpha(1);
    plant.setArmed(true);
    // Play a popup animation
    plant.scene.tweens.add({
      targets: plant,
      y: plant.y - 10,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }
  update(plant: PotatoMine, time: number, delta: number) {
    plant.scene.game.events.emit('plant:check_target', {
      row: plant.getRow(),
      plant: plant,
    });

    const target = plant.getAttackTarget();
    if (target && target.active && plant.getIsArmed()) {
      if (Math.abs(target.x - plant.x) < 40) {
        plant.explode();
        plant.stateMachine.changeState(EntityState.DEAD);
      }
    }
  }
  exit(plant: PotatoMine) {}
}

class PotatoMineDeadState implements IState<PotatoMine> {
  enter(plant: PotatoMine) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: PotatoMine, time: number, delta: number) {}
  exit(plant: PotatoMine) {}
}
