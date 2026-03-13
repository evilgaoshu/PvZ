import Phaser from 'phaser';
import type { AnimationConfig } from '@/types/config';

/**
 * 渲染器接口，用于解耦 Spine 和普通 Sprite
 */
export interface IEntityRenderer {
  play(key: string, loop?: boolean): void;
  stop(): void;
  setFlipX(flip: boolean): void;
  setTint(color: number): void;
  destroy(): void;
  setVisible(visible: boolean): void;
}

/**
 * Spine 渲染器实现
 */
export class SpineRenderer implements IEntityRenderer {
  private spineObj: any; // SpineGameObject

  constructor(scene: Phaser.Scene, x: number, y: number, spineKey: string, atlasKey: string) {
    // @ts-ignore - spine plugin mapping
    this.spineObj = scene.add.spine(x, y, spineKey, atlasKey);
  }

  public play(key: string, loop: boolean = true): void {
    this.spineObj.animationState.setAnimation(0, key, loop);
  }

  public stop(): void {
    this.spineObj.animationState.clearTracks();
  }

  public setFlipX(flip: boolean): void {
    this.spineObj.setFlipX(flip);
  }

  public setTint(color: number): void {
    // Spine 的染色逻辑略有不同，这里简化处理
    this.spineObj.setAlpha(0.8); 
  }

  public setVisible(visible: boolean): void {
    this.spineObj.setVisible(visible);
  }

  public destroy(): void {
    this.spineObj.destroy();
  }

  public getObject(): any {
    return this.spineObj;
  }
}

/**
 * 原生 Sprite 渲染器实现（作为 Backback）
 */
export class SpriteRenderer implements IEntityRenderer {
  constructor(private sprite: Phaser.GameObjects.Sprite) {}

  public play(key: string, loop: boolean = true): void {
    if (this.sprite.scene.anims.exists(key)) {
      this.sprite.play(key, !loop);
    }
  }

  public stop(): void {
    this.sprite.stop();
  }

  public setFlipX(flip: boolean): void {
    this.sprite.setFlipX(flip);
  }

  public setTint(color: number): void {
    this.sprite.setTint(color);
  }

  public setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
  }

  public destroy(): void {
    // Sprite 的销毁由实体类统一管理，这里不重复
  }
}
