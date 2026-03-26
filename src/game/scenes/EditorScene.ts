import { BaseScene } from './BaseScene';
import { Logger } from '@game/utils/Logger';
import { GRID_CONFIG } from '@/types/index';
import { GameButton } from '@ui/components/GameButton';
import yaml from 'yaml';

interface EditorZombie {
  time: number;
  type: string;
  row: number;
  marker?: Phaser.GameObjects.Container;
}

/**
 * 可视化关卡编辑器场景
 * 增强版：支持多种僵尸选择、时间轴精细控制和可视化标记
 */
export class EditorScene extends BaseScene {
  private zombies: EditorZombie[] = [];
  private currentTime: number = 0;
  private timelineMarker: Phaser.GameObjects.Rectangle | null = null;
  private timeLabel: Phaser.GameObjects.Text | null = null;
  private selectedZombieType: string = 'normal';
  private zombieButtons: Map<string, GameButton> = new Map();

  constructor() {
    super({ key: 'EditorScene' });
  }

  protected onInit(): void {}
  protected onPreload(): void {}

  protected onCreate(): void {
    this.createBackground();
    this.createGrid();
    this.createZombieSelector();
    this.createTimeline();
    this.createControlButtons();

    // 提示信息
    this.add
      .text(400, 20, '关卡编辑器：点击网格最右侧添加僵尸', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5);
  }

  protected onUpdate(_time: number, _delta: number): void {}

  private createBackground(): void {
    this.add.image(400, 300, 'day-grass').setAlpha(0.4);
  }

  private createGrid(): void {
    const { OFFSET_X, OFFSET_Y, ROWS, COLS, CELL_WIDTH, CELL_HEIGHT } =
      GRID_CONFIG;
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.1);

    for (let row = 0; row < ROWS; row++) {
      const y = OFFSET_Y + row * CELL_HEIGHT;
      // 仅点击最右侧一列来放置僵尸（模拟僵尸入口）
      const x = OFFSET_X + (COLS - 1) * CELL_WIDTH;

      graphics.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      const area = this.add.rectangle(
        x + CELL_WIDTH / 2,
        y + CELL_HEIGHT / 2,
        CELL_WIDTH,
        CELL_HEIGHT,
        0x4ade80,
        0
      );
      area.setInteractive({ useHandCursor: true });

      area.on('pointerover', () => area.setFillStyle(0x4ade80, 0.2));
      area.on('pointerout', () => area.setFillStyle(0x4ade80, 0));
      area.on('pointerdown', () => this.addZombieAt(row));
    }
  }

  private createZombieSelector(): void {
    const types = [
      { id: 'normal', label: '🧟 普通', color: 0x8fbc8f },
      { id: 'conehead', label: '👷 路障', color: 0xf97316 },
      { id: 'buckethead', label: '🪣 铁桶', color: 0x94a3b8 },
      { id: 'pole_vaulting', label: '🏃 撑杆', color: 0xa3e635 },
      { id: 'newspaper', label: '📰 读报', color: 0x475569 },
    ];

    types.forEach((type, index) => {
      const btn = new GameButton(
        this,
        80,
        150 + index * 60,
        {
          text: type.label,
          width: 120,
          height: 45,
          backgroundColor:
            this.selectedZombieType === type.id ? type.color : 0x1e293b,
          fontSize: '16px',
        },
        () => this.selectZombieType(type.id)
      );

      this.zombieButtons.set(type.id, btn);
    });
  }

  private selectZombieType(id: string): void {
    this.selectedZombieType = id;
    // 更新按钮状态样式（简单模拟）
    this.zombieButtons.forEach((btn, key) => {
      btn.setAlpha(key === id ? 1 : 0.6);
    });
  }

  private createTimeline(): void {
    const width = 600;
    const x = 150;
    const y = 540;

    this.add.text(x, y - 30, '时间轴 (0s - 300s)', {
      fontSize: '14px',
      color: '#94a3b8',
    });

    // 时间轴轨道
    const track = this.add.rectangle(x + width / 2, y, width, 12, 0x1e293b);
    track.setStrokeStyle(2, 0x475569);

    // 刻度
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x475569, 0.5);
    for (let i = 0; i <= 10; i++) {
      const stepX = x + (i / 10) * width;
      graphics.lineBetween(stepX, y - 10, stepX, y + 10);
    }

    // 游标
    this.timelineMarker = this.add.rectangle(x, y, 6, 40, 0x4ade80);
    this.timelineMarker.setStrokeStyle(2, 0xffffff);

    // 拖拽层
    const dragArea = this.add.rectangle(
      x + width / 2,
      y,
      width + 40,
      60,
      0xffffff,
      0
    );
    dragArea.setInteractive({ draggable: true });

    this.timeLabel = this.add
      .text(x + width + 20, y, '0s', {
        fontSize: '20px',
        color: '#4ade80',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    dragArea.on('drag', (pointer: any) => {
      const relativeX = Phaser.Math.Clamp(pointer.x - x, 0, width);
      this.currentTime = Math.floor((relativeX / width) * 300);
      this.timelineMarker!.x = x + relativeX;
      this.timeLabel!.setText(`${this.currentTime}s`);
    });
  }

  private createControlButtons(): void {
    // 导出
    new GameButton(
      this,
      700,
      50,
      {
        text: '💾 导出配置',
        width: 140,
        backgroundColor: 0x10b981,
      },
      () => this.exportLevel()
    );

    // 清空
    new GameButton(
      this,
      550,
      50,
      {
        text: '🗑️ 清空',
        width: 100,
        backgroundColor: 0xef4444,
      },
      () => this.clearZombies()
    );

    // 返回
    new GameButton(
      this,
      100,
      50,
      {
        text: '⬅️ 返回',
        width: 100,
        backgroundColor: 0x64748b,
      },
      () => this.scene.start('MenuScene')
    );
  }

  private addZombieAt(row: number): void {
    const { OFFSET_Y, CELL_HEIGHT } = GRID_CONFIG;
    const markerX = 750;
    const markerY = OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // 创建可视化标记容器
    const container = this.add.container(markerX, markerY);

    const bg = this.add.circle(0, 0, 15, 0xef4444, 0.8);
    const txt = this.add
      .text(0, 0, this.currentTime.toString(), {
        fontSize: '10px',
        color: '#fff',
      })
      .setOrigin(0.5);
    const typeTxt = this.add
      .text(0, 20, this.selectedZombieType.charAt(0), {
        fontSize: '10px',
        color: '#fcd34d',
      })
      .setOrigin(0.5);

    container.add([bg, txt, typeTxt]);

    // 入场动画
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    this.zombies.push({
      time: this.currentTime * 1000,
      type: this.selectedZombieType,
      row: row,
      marker: container,
    });

    console.log(
      `Added ${this.selectedZombieType} at row ${row}, time ${this.currentTime}s`
    );
  }

  private clearZombies(): void {
    if (confirm('确定要清空所有已放置的僵尸吗？')) {
      this.zombies.forEach((z) => z.marker?.destroy());
      this.zombies = [];
    }
  }

  private exportLevel(): void {
    if (this.zombies.length === 0) {
      alert('请先放置至少一个僵尸！');
      return;
    }

    // 按时间排序
    const sorted = [...this.zombies].sort((a, b) => a.time - b.time);

    // 逻辑：将僵尸分组到波次中
    // 我们定义：每 20 秒为一个波次，或者根据放置的时间点自动分段
    const waveSize = 20000; // 20秒一波
    const waves: any[] = [];

    let currentWaveTime = waveSize;
    let waveZombies: any[] = [];

    sorted.forEach((z, index) => {
      waveZombies.push({
        type: z.type,
        count: 1,
        row: z.row,
        delay: index > 0 ? z.time - sorted[index - 1].time : 0,
      });

      // 如果下一个僵尸的时间超过了当前波次限制，或者已经是最后一个
      const nextZombie = sorted[index + 1];
      if (!nextZombie || nextZombie.time > currentWaveTime) {
        waves.push({
          waveNumber: waves.length + 1,
          isFlagWave: waves.length % 2 === 1, // 每两波一个旗帜波
          zombies: waveZombies,
          timeBeforeWave: 15000, // 默认波次间隔
        });
        waveZombies = [];
        if (nextZombie) {
          currentWaveTime = Math.ceil(nextZombie.time / waveSize) * waveSize;
        }
      }
    });

    const levelData = {
      id: 'custom-' + Date.now(),
      name: '玩家自定义关卡',
      world: 1,
      level: 99,
      availablePlants: ['sunflower', 'peashooter', 'wallnut'],
      zombieTypes: Array.from(new Set(this.zombies.map((z) => z.type))),
      initialSun: 150,
      background: 'day-grass',
      waves: waves,
    };

    const yamlStr = yaml.stringify(levelData);
    Logger.log(
      '%c--- 导出的关卡配置 (YAML) ---',
      'color: #4ade80; font-weight: bold;'
    );
    Logger.log(yamlStr);

    // 尝试复制到剪贴板
    navigator.clipboard
      .writeText(yamlStr)
      .then(() => {
        alert(
          '关卡配置已导出并复制到剪贴板！\n请粘贴到 data/levels/ 目录下的 yaml 文件中。'
        );
      })
      .catch(() => {
        alert('导出成功！请在控制台 (F12) 复制内容。');
      });
  }
}
