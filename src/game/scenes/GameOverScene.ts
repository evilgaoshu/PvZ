import { BaseScene } from './BaseScene';
import { AudioManager } from '@managers/AudioManager';

/**
 * 游戏结束场景
 */
export class GameOverScene extends BaseScene {
  private isVictory: boolean = false;
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { isVictory?: boolean }): void {
    super.init();
    this.isVictory = data?.isVictory ?? false;
    console.log('GameOverScene initialized, isVictory:', this.isVictory);

    // 获取音频管理器
    this.audioManager = this.game.registry.get('audioManager') as AudioManager;
  }

  protected onInit(): void {
    // 在init中完成
  }

  protected onPreload(): void {
    // 无需预加载
  }

  protected onCreate(): void {
    this.createBackground();
    this.createResult();
    this.createButtons();

    // 淡入
    this.transitionIn(500);
  }

  protected onUpdate(): void {
    // 无需更新
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    const { width, height } = this.getGameSize();

    // 胜利用绿色渐变，失败用红色渐变
    const bgColor = this.isVictory ? 0x1a2e1a : 0x2e1a1a;
    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      bgColor,
      0.9
    );

    // 添加装饰粒子效果
    if (this.isVictory) {
      this.createVictoryParticles();
    }
  }

  /**
   * 创建胜利粒子效果
   */
  private createVictoryParticles(): void {
    const { width, height } = this.getGameSize();

    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: -10,
      lifespan: 3000,
      speedY: { min: 50, max: 150 },
      scale: { min: 0.2, max: 0.6 },
      quantity: 2,
      frequency: 100,
      tint: [0x4ade80, 0xfcd34d, 0x60a5fa],
    });

    // 如果没有粒子纹理，创建简单的飘落效果
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        this.createConfetti();
      },
    });
  }

  /**
   * 创建彩纸效果
   */
  private createConfetti(): void {
    const { width } = this.getGameSize();
    const colors = [0x4ade80, 0xfcd34d, 0x60a5fa, 0xf472b6];
    const x = Phaser.Math.Between(0, width);
    const color = Phaser.Utils.Array.GetRandom(colors);

    const confetti = this.add.rectangle(x, -10, 8, 8, color);

    this.tweens.add({
      targets: confetti,
      y: 650,
      x: x + Phaser.Math.Between(-100, 100),
      rotation: Phaser.Math.FloatBetween(0, Math.PI * 2),
      duration: Phaser.Math.Between(2000, 4000),
      ease: 'Power1',
      onComplete: () => {
        confetti.destroy();
      },
    });
  }

  /**
   * 创建结果展示
   */
  private createResult(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const centerY = height / 2 - 50;

    // 图标
    const icon = this.isVictory ? '🏆' : '💀';
    const iconText = this.createText(centerX, centerY - 80, icon, {
      fontSize: '72px',
    });
    iconText.setOrigin(0.5);

    // 缩放动画
    this.tweens.add({
      targets: iconText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 标题
    const title = this.isVictory ? '胜利！' : '失败！';
    const titleColor = this.isVictory ? '#4ade80' : '#ef4444';
    const titleText = this.createText(centerX, centerY, title, {
      fontSize: '48px',
      color: titleColor,
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);

    // 描述
    const description = this.isVictory
      ? '恭喜你成功防守了僵尸的进攻！'
      : '僵尸吃掉了你的脑子！';
    const descText = this.createText(centerX, centerY + 60, description, {
      fontSize: '20px',
      color: '#94a3b8',
    });
    descText.setOrigin(0.5);
  }

  /**
   * 创建按钮
   */
  private createButtons(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const buttonY = height / 2 + 120;

    const container = this.add.container(centerX, buttonY);

    // 再来一局按钮
    const restartBtn = this.createButton(
      -110,
      0,
      160,
      45,
      this.isVictory ? '下一关' : '再来一局',
      () => this.nextLevel()
    );
    container.add(restartBtn);

    // 返回菜单按钮
    const menuBtn = this.createButton(110, 0, 160, 45, '主菜单', () =>
      this.returnToMenu()
    );
    container.add(menuBtn);

    // 入场动画
    container.setAlpha(0);
    container.setY(buttonY + 20);

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: buttonY,
      duration: 400,
      delay: 500,
      ease: 'Power2',
    });
  }

  /**
   * 下一关/重新开始
   */
  private nextLevel(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    this.transitionOut(300, () => {
      if (this.isVictory) {
        // TODO: 加载下一关
        this.scene.start('GameScene', { levelId: '1-2' });
      } else {
        this.scene.start('GameScene');
      }
    });
  }

  /**
   * 返回主菜单
   */
  private returnToMenu(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    this.transitionOut(300, () => {
      this.scene.start('MenuScene');
    });
  }
}
