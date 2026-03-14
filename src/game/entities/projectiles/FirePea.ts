import { Projectile } from './Projectile';
import Phaser from 'phaser';

export class FirePea extends Projectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.damage = 40; // Fire peas deal double damage
    this.projectileType = 'fire_pea';

    if (!this.scene.textures.exists('fire_pea')) {
      this.createFirePeaGraphics();
    }
    this.setTexture('fire_pea');
  }

  private createFirePeaGraphics(): void {
    const graphics = this.scene.add.graphics();

    // Orange/Red fireball
    graphics.fillStyle(0xef4444, 1);
    graphics.fillCircle(0, 0, 10);

    graphics.fillStyle(0xfacc15, 0.8);
    graphics.fillCircle(-2, -2, 5);

    graphics.generateTexture('fire_pea', 30, 30);
    graphics.destroy();
  }

  public update(): void {
    super.update();

    // Emitting fire particles
    if (Math.random() < 0.3) {
      const particle = this.scene.add.circle(
        this.x - 10,
        this.y,
        Phaser.Math.Between(2, 5),
        0xf97316,
        0.8
      );
      this.scene.tweens.add({
        targets: particle,
        y: this.y - Phaser.Math.Between(10, 20),
        alpha: 0,
        scale: 0.5,
        duration: 300,
        onComplete: () => particle.destroy(),
      });
    }
  }

  protected playHitEffect(): void {
    // Fire splash effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        Phaser.Math.Between(4, 8),
        Math.random() > 0.5 ? 0xef4444 : 0xf97316,
        0.9
      );

      const distance = Phaser.Math.Between(20, 40);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
