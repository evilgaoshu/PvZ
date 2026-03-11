import Phaser from 'phaser';

/**
 * 视觉效果工具类
 * 提供通用的“果汁感”(Juiciness) 特效
 */
export class VisualEffects {
  /**
   * 相机抖动
   */
  public static shakeCamera(scene: Phaser.Scene, intensity: number = 0.01, duration: number = 100): void {
    scene.cameras.main.shake(duration, intensity);
  }

  /**
   * 精灵闪烁效果
   */
  public static flashSprite(sprite: Phaser.GameObjects.Sprite, color: number = 0xffffff, duration: number = 100): void {
    sprite.setTint(color);
    sprite.scene.time.delayedCall(duration, () => {
      if (sprite.active) {
        sprite.clearTint();
      }
    });
  }

  /**
   * 浮动文字特效 (用于伤害数字、阳光增加等)
   */
  public static floatText(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    text: string, 
    config: { color?: string, fontSize?: string, duration?: number } = {}
  ): void {
    const { 
      color = '#ffffff', 
      fontSize = '20px', 
      duration = 1000 
    } = config;

    const textObj = scene.add.text(x, y, text, {
      fontSize,
      color,
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });
    textObj.setOrigin(0.5);
    textObj.setDepth(100);

    scene.tweens.add({
      targets: textObj,
      y: y - 50,
      alpha: 0,
      duration,
      ease: 'Power1',
      onComplete: () => {
        textObj.destroy();
      }
    });
  }

  /**
   * 简单的粒子溅射效果
   */
  public static createSplat(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    color: number = 0xffffff, 
    count: number = 8
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = scene.add.circle(x, y, Phaser.Math.Between(2, 4), color);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(50, 150);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * 缩放回弹效果 (用于收集阳光、点击按钮等)
   */
  public static bounceScale(
    target: any, 
    scale: number = 1.2, 
    duration: number = 200
  ): void {
    if (!target || !target.scene) return;
    
    const originalScale = target.scale || target.scaleX || 1.0;
    target.scene.tweens.add({
      targets: target,
      scale: originalScale * scale,
      duration: duration / 2,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  /**
   * 简单的阴影效果 (在物体下方添加一个椭圆)
   */
  public static addShadow(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite): Phaser.GameObjects.Ellipse {
    const shadow = scene.add.ellipse(sprite.x, sprite.y + sprite.displayHeight / 2 - 5, 40, 15, 0x000000, 0.3);
    shadow.setDepth(sprite.depth - 1);
    
    // 让阴影跟随精灵
    scene.events.on('update', () => {
      if (sprite.active && shadow.active) {
        shadow.x = sprite.x;
        shadow.y = sprite.y + sprite.displayHeight / 2 - 5;
      } else if (shadow.active) {
        shadow.destroy();
      }
    });
    
    return shadow;
  }
}
