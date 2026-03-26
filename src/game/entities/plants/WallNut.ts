import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { IState } from '../../utils/StateMachine';

/**
 * 坚果墙 (状态机版)
 */
export class WallNut extends Plant {
  private crackOverlay: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected init(): void {
    super.init();
    this.crackOverlay = this.scene.add.image(this.x, this.y, 'effects/cracks');
    this.crackOverlay.setAlpha(0);
    this.crackOverlay.setDepth(this.depth + 0.1);
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.IDLE, new WallNutIdleState());
    this.stateMachine.addState(EntityState.DEAD, new WallNutDeadState());
  }

  protected onDamageStateChange(state: any): void {
    if (!this.crackOverlay) return;
    if (state === 1) {
      // HURT
      this.crackOverlay.setAlpha(0.5);
    } else if (state === 2) {
      // CRITICAL
      this.crackOverlay.setAlpha(1);
    }
  }

  public getCrackOverlay() {
    return this.crackOverlay;
  }
}

class WallNutIdleState implements IState<WallNut> {
  enter(plant: WallNut) {
    plant.playAnimation('wallnut_idle', true);
  }
  update(plant: WallNut, time: number, delta: number) {
    if (plant.getCrackOverlay()) {
      plant.getCrackOverlay()!.setPosition(plant.x, plant.y);
    }
  }
  exit(plant: WallNut) {}
}

class WallNutDeadState implements IState<WallNut> {
  enter(plant: WallNut) {
    if (plant.getCrackOverlay()) plant.getCrackOverlay()!.destroy();
    plant.scene.game.events.emit(GameEvents.PLANT_REMOVED, {
      row: plant.getRow(),
      col: plant.getCol(),
      plant: plant,
    });
    plant.destroy();
  }
  update(plant: WallNut, time: number, delta: number) {}
  exit(plant: WallNut) {}
}
