import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

export class CherryBomb extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new CherryIdleState());
    this.stateMachine.addState(EntityState.ATTACK, new CherryExplodeState());
    this.stateMachine.addState(EntityState.DEAD, new CherryDeadState());
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

class CherryIdleState implements IState<CherryBomb> {
  private timer: number = 0;
  enter(plant: CherryBomb) {
    plant.playAnimation('cherry_bomb_idle', true);
    this.timer = 0;
  }
  update(plant: CherryBomb, _t: number, delta: number) {
    this.timer += delta;
    if (this.timer >= 1000) plant.stateMachine.changeState(EntityState.ATTACK);
  }
  exit(plant: CherryBomb) {}
}

class CherryExplodeState implements IState<CherryBomb> {
  enter(plant: CherryBomb) {
    plant.explode();
    plant.stateMachine.changeState(EntityState.DEAD);
  }
  update(plant: CherryBomb, time: number, delta: number) {}
  exit(plant: CherryBomb) {}
}

class CherryDeadState implements IState<CherryBomb> {
  enter(plant: CherryBomb) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: CherryBomb, time: number, delta: number) {}
  exit(plant: CherryBomb) {}
}
