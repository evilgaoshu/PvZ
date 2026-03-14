import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, ECONOMY_CONFIG, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

/**
 * 向日葵 (状态机版)
 */
export class Sunflower extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new SunflowerIdleState(this));
    this.stateMachine.addState(EntityState.DEAD, new SunflowerDeadState(this));
  }

  /**
   * 生产阳光的逻辑
   */
  public produceSun(): void {
    this.playAnimation(`${this.config.id}_produce`, false);

    this.scene.time.delayedCall(500, () => {
      const sunAmount =
        this.config.produceAmount || ECONOMY_CONFIG.SUNFLOWER.PRODUCE_AMOUNT;
      this.scene.game.events.emit('economy:spawn_plant_sun', {
        x: this.x,
        y: this.y - 30,
        amount: sunAmount,
      });
    });
  }

  public getProduceInterval(): number {
    return (
      this.config.produceInterval || ECONOMY_CONFIG.SUNFLOWER.PRODUCE_INTERVAL
    );
  }
}

class SunflowerIdleState implements IState {
  private lastProduceTime: number = 0;
  constructor(private plant: Sunflower) {}
  enter() {
    this.plant.playAnimation(`${this.plant.getConfig().id}_idle`, true);
    this.lastProduceTime = this.plant.scene.time.now;
  }
  update(time: number) {
    if (time - this.lastProduceTime >= this.plant.getProduceInterval()) {
      this.lastProduceTime = time;
      this.plant.produceSun();
    }
  }
  exit() {}
}

class SunflowerDeadState implements IState {
  constructor(private plant: Sunflower) {}
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
