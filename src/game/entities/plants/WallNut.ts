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
    this.stateMachine.addState(EntityState.IDLE, new WallNutIdleState(this));
    this.stateMachine.addState(EntityState.DEAD, new WallNutDeadState(this));
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

class WallNutIdleState implements IState {
  constructor(private plant: WallNut) {}
  enter() {
    this.plant.playAnimation('wallnut_idle', true);
  }
  update() {
    if (this.plant.getCrackOverlay()) {
      this.plant.getCrackOverlay()!.setPosition(this.plant.x, this.plant.y);
    }
  }
  exit() {}
}

class WallNutDeadState implements IState {
  constructor(private plant: WallNut) {}
  enter() {
    if (this.plant.getCrackOverlay()) this.plant.getCrackOverlay()!.destroy();
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
