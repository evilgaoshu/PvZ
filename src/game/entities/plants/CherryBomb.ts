import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class CherryBomb extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new CherryIdleState(this));
    this.stateMachine.addState(
      EntityState.ATTACK,
      new CherryExplodeState(this)
    );
    this.stateMachine.addState(EntityState.DEAD, new CherryDeadState(this));
  }
  public explode(): void {
    this.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
      x: this.x,
      y: this.y,
      damage: 1800,
      type: 'explosion',
    });
    this.scene.cameras.main.shake(200, 0.01);
  }
}

class CherryIdleState implements IState {
  private timer: number = 0;
  constructor(private plant: CherryBomb) {}
  enter() {
    this.plant.playAnimation('cherry_bomb_idle', true);
    this.timer = 0;
  }
  update(_t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 1000)
      this.plant.stateMachine.changeState(EntityState.ATTACK);
  }
  exit() {}
}

class CherryExplodeState implements IState {
  constructor(private plant: CherryBomb) {}
  enter() {
    this.plant.explode();
    this.plant.stateMachine.changeState(EntityState.DEAD);
  }
  update() {}
  exit() {}
}

class CherryDeadState implements IState {
  constructor(private plant: CherryBomb) {}
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
