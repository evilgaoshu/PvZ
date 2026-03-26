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
    this.stateMachine.addState(EntityState.IDLE, new SunflowerIdleState());
    this.stateMachine.addState(EntityState.DEAD, new SunflowerDeadState());
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

class SunflowerIdleState implements IState<Sunflower> {
  private lastProduceTime: number = 0;
  enter(plant: Sunflower) {
    plant.playAnimation(`${plant.getConfig().id}_idle`, true);
    this.lastProduceTime = plant.scene.time.now;
  }
  update(plant: Sunflower, time: number, delta: number) {
    if (time - this.lastProduceTime >= plant.getProduceInterval()) {
      this.lastProduceTime = time;
      plant.produceSun();
    }
  }
  exit(plant: Sunflower) {}
}

class SunflowerDeadState implements IState<Sunflower> {
  enter(plant: Sunflower) {
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: Sunflower, time: number, delta: number) {}
  exit(plant: Sunflower) {}
}
