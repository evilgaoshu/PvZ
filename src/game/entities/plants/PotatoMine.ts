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
    this.stateMachine.addState(EntityState.IDLE, new PotatoMineUnarmedState(this));
    this.stateMachine.addState(EntityState.ATTACK, new PotatoMineArmedState(this));
    this.stateMachine.addState(EntityState.DEAD, new PotatoMineDeadState(this));
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

class PotatoMineUnarmedState implements IState {
  private timer: number = 0;
  private readonly ARM_TIME = 15000; // 15 seconds to arm

  constructor(private plant: PotatoMine) {}
  enter() {
    this.plant.playAnimation('potato_mine_idle', true);
    this.plant.setAlpha(0.5); // Visual cue that it's unarmed
    this.timer = 0;
    this.plant.setArmed(false);
  }
  update(_t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= this.ARM_TIME) {
      this.plant.stateMachine.changeState(EntityState.ATTACK);
    }
  }
  exit() {}
}

class PotatoMineArmedState implements IState {
  constructor(private plant: PotatoMine) {}
  enter() {
    this.plant.setAlpha(1);
    this.plant.setArmed(true);
    // Play a popup animation
    this.plant.scene.tweens.add({
      targets: this.plant,
      y: this.plant.y - 10,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }
  update() {
    this.plant.scene.game.events.emit('plant:check_target', {
      row: this.plant.getRow(),
      plant: this.plant,
    });
    
    const target = this.plant.getAttackTarget();
    if (target && target.active && this.plant.getIsArmed()) {
      if (Math.abs(target.x - this.plant.x) < 40) {
        this.plant.explode();
        this.plant.stateMachine.changeState(EntityState.DEAD);
      }
    }
  }
  exit() {}
}

class PotatoMineDeadState implements IState {
  constructor(private plant: PotatoMine) {}
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
