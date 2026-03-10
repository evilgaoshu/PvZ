import { BaseScene } from './BaseScene';
import { GridSystem } from '@systems/GridSystem';
import { EconomySystem } from '@systems/EconomySystem';
import { WaveSystem } from '@systems/WaveSystem';
import { CombatSystem } from '@systems/CombatSystem';
import { PlantFactory } from '@entities/plants/PlantFactory';
import { ZombieFactory } from '@entities/zombies/ZombieFactory';
import { Pea, SnowPea } from '@entities/projectiles/Projectile';
import { GRID_CONFIG, GameEvents, ECONOMY_CONFIG } from '@/types/index';
import { plantConfigs, zombieConfigs } from '@data/plants/plantConfigs';
import type { LevelConfig } from '@/types/config';
import { Plant } from '@entities/plants/Plant';
import { Zombie } from '@entities/zombies/Zombie';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect, BackgroundMusic } from '@config/AudioConfig';

/**
 * 游戏场景
 * 主游戏战斗场景
 */
export class GameScene extends BaseScene {
  // 游戏系统
  private gridSystem!: GridSystem;
  private economySystem!: EconomySystem;
  private waveSystem!: WaveSystem;
  private combatSystem!: CombatSystem;

  // 工厂
  private plantFactory!: PlantFactory;
  private zombieFactory!: ZombieFactory;

  // 音频管理器
  private audioManager!: AudioManager;

  // 游戏对象容器
  private gameContainer: Phaser.GameObjects.Container | null = null;
  private plantLayer: Phaser.GameObjects.Group | null = null;
  private zombieLayer: Phaser.GameObjects.Group | null = null;
  private projectileLayer: Phaser.GameObjects.Group | null = null;
  private uiLayer: Phaser.GameObjects.Container | null = null;

  // 游戏状态
  private plants: Map<string, Plant> = new Map();
  private zombies: Zombie[] = [];
  private selectedPlant: string | null = null;
  private selectedPlantCost: number = 0;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;

  // 鼠标预览
  private plantPreview: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelId?: string }): void {
    super.init(data);
    console.log('GameScene initialized with data:', data);
    // TODO: 根据levelId加载关卡配置
  }

  protected onInit(): void {
    // 从注册表获取音频管理器
    this.audioManager = this.game.registry.get('audioManager') as AudioManager;
    if (!this.audioManager) {
      console.warn('AudioManager not found in registry, creating new instance');
      // 创建一个新的音频管理器作为后备（需要重新预加载）
      this.audioManager = new AudioManager(this);
    }
  }

  protected onPreload(): void {
    // 创建投射物纹理
    this.createProjectileTextures();
  }

  /**
   * 创建投射物纹理
   */
  private createProjectileTextures(): void {
    // 豌豆纹理
    const peaGraphics = this.make.graphics({ fillStyle: { color: 0x4ade80, alpha: 1 } }, false);
    peaGraphics.fillStyle(0x4ade80, 1);
    peaGraphics.fillCircle(10, 10, 8);
    peaGraphics.fillStyle(0xffffff, 0.3);
    peaGraphics.fillCircle(7, 7, 3);
    peaGraphics.generateTexture('pea', 20, 20);

    // 冰冻豌豆纹理
    const snowPeaGraphics = this.make.graphics({ fillStyle: { color: 0xaaddff, alpha: 1 } }, false);
    snowPeaGraphics.fillStyle(0xaaddff, 1);
    snowPeaGraphics.fillCircle(10, 10, 8);
    snowPeaGraphics.fillStyle(0xffffff, 0.5);
    snowPeaGraphics.fillCircle(10, 10, 5);
    snowPeaGraphics.generateTexture('snow_pea', 20, 20);
  }

  protected onCreate(): void {
    // 创建层级容器
    this.createLayers();

    // 创建网格
    this.createGrid();

    // 初始化系统
    this.initializeSystems();

    // 初始化工厂
    this.initializeFactories();

    // 创建UI
    this.createUI();

    // 设置事件监听
    this.setupEventListeners();

    // 开始游戏
    this.startGame();

    // 淡入
    this.transitionIn(300);
  }

  protected onUpdate(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 更新各系统
    this.economySystem.update(delta);
    this.waveSystem.update(delta);
    this.combatSystem.update(delta);

    // 更新植物
    this.plants.forEach(plant => {
      if (plant.active) {
        plant.update(time, delta);
      }
    });

    // 更新僵尸
    this.zombies = this.zombies.filter(zombie => {
      if (zombie.active && zombie.isZombieAlive()) {
        zombie.update(time, delta);
        return true;
      }
      return false;
    });

    // 更新投射物
    this.projectileLayer?.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const projectile = child as any;
      if (projectile.active && projectile.update) {
        projectile.update();
      }
      return true;
    });

    // 更新植物预览位置
    this.updatePlantPreview();
  }

  /**
   * 创建层级容器
   */
  private createLayers(): void {
    this.gameContainer = this.add.container(0, 0);

    // 背景层
    const bgLayer = this.add.container(0, 0);
    this.gameContainer.add(bgLayer);

    // 植物层
    this.plantLayer = this.physics.add.group();

    // 僵尸层
    this.zombieLayer = this.physics.add.group();

    // 投射物层
    this.projectileLayer = this.physics.add.group();

    // UI层
    this.uiLayer = this.add.container(0, 0);
    this.gameContainer.add(this.uiLayer);
  }

  /**
   * 创建网格背景
   */
  private createGrid(): void {
    const { OFFSET_X, OFFSET_Y, ROWS, COLS, CELL_WIDTH, CELL_HEIGHT, GRASS_COLORS } = GRID_CONFIG;

    // 创建草地背景
    const graphics = this.add.graphics();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = OFFSET_X + col * CELL_WIDTH;
        const y = OFFSET_Y + row * CELL_HEIGHT;

        // 交替颜色
        const colorIndex = (row + col) % 2;
        graphics.fillStyle(GRASS_COLORS[colorIndex], 1);
        graphics.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

        // 网格线
        graphics.lineStyle(1, 0x3d7c36, 0.5);
        graphics.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      }
    }

    // 添加网格交互
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = OFFSET_X + col * CELL_WIDTH;
        const y = OFFSET_Y + row * CELL_HEIGHT;

        const cell = this.add.rectangle(
          x + CELL_WIDTH / 2,
          y + CELL_HEIGHT / 2,
          CELL_WIDTH,
          CELL_HEIGHT,
          0xffffff,
          0
        );
        cell.setInteractive({ useHandCursor: true });

        // 悬停效果
        cell.on('pointerover', () => {
          if (this.selectedPlant) {
            cell.setFillStyle(0x4ade80, 0.3);
          } else {
            cell.setFillStyle(0xffffff, 0.2);
          }
        });

        cell.on('pointerout', () => {
          cell.setFillStyle(0xffffff, 0);
        });

        // 点击事件
        cell.on('pointerdown', () => {
          this.onGridCellClick(row, col);
        });
      }
    }

    // 添加草坪装饰
    this.addLawnDecorations();
  }

  /**
   * 添加草坪装饰
   */
  private addLawnDecorations(): void {
    // 添加割草机
    const { OFFSET_Y, CELL_HEIGHT, ROWS } = GRID_CONFIG;
    for (let row = 0; row < ROWS; row++) {
      const y = OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
      this.createLawnMower(180, y, row);
    }
  }

  /**
   * 创建割草机
   */
  private createLawnMower(x: number, y: number, row: number): void {
    const mower = this.add.container(x, y);

    // 割草机主体
    const body = this.add.rectangle(0, 0, 30, 25, 0xff4444, 1);
    body.setStrokeStyle(2, 0xcc0000);
    mower.add(body);

    // 轮子
    const wheel1 = this.add.circle(-10, 12, 6, 0x333333);
    const wheel2 = this.add.circle(10, 12, 6, 0x333333);
    mower.add([wheel1, wheel2]);

    // 存储行信息
    mower.setData('row', row);
    mower.setData('isActive', false);

    // 割草机激活时触发
    this.events.on('zombie:reached_house', (zombie: Zombie) => {
      if (zombie.getRow() === row && !mower.getData('isActive')) {
        this.activateLawnMower(mower, row);
      }
    });
  }

  /**
   * 激活割草机
   */
  private activateLawnMower(mower: Phaser.GameObjects.Container, row: number): void {
    mower.setData('isActive', true);

    // 割草机动画
    this.tweens.add({
      targets: mower,
      x: 900,
      duration: 2000,
      ease: 'Linear',
      onUpdate: () => {
        // 清理该行所有僵尸
        this.zombies.forEach(zombie => {
          if (zombie.getRow() === row && zombie.x < mower.x + 50) {
            zombie.takeDamage(9999, 'explosion');
          }
        });
      },
      onComplete: () => {
        mower.destroy();
      }
    });

    // 播放割草机音效
    this.audioManager?.playSfx(SoundEffect.LAWN_MOWER);
  }

  /**
   * 初始化游戏系统
   */
  private initializeSystems(): void {
    // 初始化网格系统
    this.gridSystem = new GridSystem(this);

    // 初始化经济系统
    this.economySystem = new EconomySystem(this);

    // 初始化波次系统
    this.waveSystem = new WaveSystem(this);

    // 初始化战斗系统
    this.combatSystem = new CombatSystem(this);
  }

  /**
   * 初始化工厂
   */
  private initializeFactories(): void {
    this.plantFactory = new PlantFactory(this);
    this.zombieFactory = new ZombieFactory(this);
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 植物选择
    this.game.events.on(GameEvents.PLANT_SELECTED, (data: { plantId: string; cost: number }) => {
      this.selectPlant(data.plantId, data.cost);
    });

    // 僵尸生成
    this.game.events.on(GameEvents.ZOMBIE_SPAWNED, (data: { zombieType: string; row: number }) => {
      this.spawnZombie(data.zombieType, data.row);
    });

    // 投射物发射
    this.game.events.on(GameEvents.PROJECTILE_FIRED, (data: {
      x: number;
      y: number;
      type: string;
      damage: number;
      speed: number;
      row: number;
    }) => {
      this.fireProjectile(data);
    });

    // 投射物命中
    this.game.events.on(GameEvents.PROJECTILE_HIT, (data: {
      damage: number;
      x: number;
      y: number;
      type: string;
      row: number;
      col: number;
    }) => {
      this.handleExplosion(data);
    });

    // 植物检查目标
    this.game.events.on('plant:check_target', (data: { row: number; plant: Plant }) => {
      this.findTargetForPlant(data.row, data.plant);
    });

    // 经济系统请求
    this.game.events.on('economy:spawn_plant_sun', (data: { x: number; y: number; amount: number }) => {
      this.economySystem.spawnPlantSun(data.x, data.y, data.amount);
    });

    // 波次完成
    this.game.events.on(GameEvents.ALL_WAVES_COMPLETED, () => {
      this.time.delayedCall(3000, () => {
        this.gameOver(true);
      });
    });
  }

  /**
   * 为植物寻找目标
   */
  private findTargetForPlant(row: number, plant: Plant): void {
    // 找到该行最前方的僵尸
    let closestZombie: Zombie | null = null;
    let minDistance = Infinity;

    this.zombies.forEach(zombie => {
      if (zombie.getRow() === row && zombie.x > plant.x) {
        const distance = zombie.x - plant.x;
        if (distance < minDistance) {
          minDistance = distance;
          closestZombie = zombie;
        }
      }
    });

    if (closestZombie) {
      plant.setAttackTarget(closestZombie as any);
    }
  }

  /**
   * 发射投射物
   */
  private fireProjectile(data: {
    x: number;
    y: number;
    type: string;
    damage: number;
    speed: number;
    row: number;
  }): void {
    let projectile: Pea | SnowPea;

    if (data.type === 'snow_pea') {
      projectile = new SnowPea(this, data.x, data.y);
    } else {
      projectile = new Pea(this, data.x, data.y);
    }

    projectile.setProjectileData({
      damage: data.damage,
      speed: data.speed,
      row: data.row,
      type: data.type
    });

    this.projectileLayer?.add(projectile);

    // 播放射击音效
    this.audioManager?.playSfx(SoundEffect.SHOOT);

    // 设置碰撞
    this.physics.add.overlap(
      projectile,
      this.zombieLayer!,
      (proj, zombie) => {
        projectile.hit(zombie as Phaser.Physics.Arcade.Sprite);
        this.handleProjectileHit(zombie as Zombie, projectile);
      }
    );
  }

  /**
   * 处理投射物命中
   */
  private handleProjectileHit(zombie: Zombie, projectile: Pea | SnowPea): void {
    const damage = projectile.getDamage();
    const type = projectile.getProjectileType();

    // 播放击中音效
    this.audioManager?.playSfx(SoundEffect.HIT);

    // 造成伤害
    zombie.takeDamage(damage, type);

    // 减速效果
    if (projectile.getIsSlowing()) {
      zombie.applySlow(3000);
    }
  }

  /**
   * 处理爆炸效果
   */
  private handleExplosion(data: { damage: number; x: number; y: number; row: number }): void {
    // 播放爆炸音效
    this.audioManager?.playSfx(SoundEffect.EXPLOSION);

    // 对范围内僵尸造成伤害
    this.zombies.forEach(zombie => {
      const distance = Phaser.Math.Distance.Between(data.x, data.y, zombie.x, zombie.y);
      if (distance <= 120) { // 3x3范围
        zombie.takeDamage(data.damage, 'explosion');
      }
    });
  }

  /**
   * 生成僵尸
   */
  private spawnZombie(zombieType: string, row: number): void {
    const zombie = this.zombieFactory.createZombie(zombieType, row);
    if (zombie) {
      this.zombies.push(zombie);
      this.zombieLayer?.add(zombie);

      // 播放僵尸呻吟音效（随机播放，避免过于频繁）
      if (Math.random() < 0.3) {
        this.audioManager?.playRandomZombieSound();
      }

      // 设置碰撞 - 僵尸与植物
      this.physics.add.overlap(
        zombie,
        this.plantLayer!,
        (zombieObj, plantObj) => {
          this.handleZombieMeetPlant(zombieObj as Zombie, plantObj as Plant);
        }
      );
    }
  }

  /**
   * 处理僵尸遇到植物
   */
  private handleZombieMeetPlant(zombie: Zombie, plant: Plant): void {
    // 检查是否同一行且僵尸在攻击范围内
    if (zombie.getRow() === plant.getRow() &&
        Math.abs(zombie.x - plant.x) < 40 &&
        plant.isPlantAlive()) {
      zombie.startAttacking(plant);

      // 播放咬击音效（随机间隔）
      if (Math.random() < 0.1) {
        this.audioManager?.playSfx(SoundEffect.CHOMP);
      }
    }
  }

  /**
   * 创建UI
   */
  private createUI(): void {
    // 阳光显示
    this.createSunDisplay();

    // 植物选择栏
    this.createPlantSelector();

    // 进度条
    this.createProgressBar();

    // 铲子按钮
    this.createShovelButton();

    // 暂停按钮
    this.createPauseButton();
  }

  /**
   * 创建阳光显示
   */
  private createSunDisplay(): void {
    const sunDisplay = this.add.container(20, 20);

    // 背景
    const bg = this.add.rectangle(0, 0, 100, 40, 0xf59e0b, 0.9);
    bg.setStrokeStyle(2, 0xd97706);
    sunDisplay.add(bg);

    // 阳光图标
    const sunIcon = this.add.circle(15, 0, 12, 0xfcd34d);
    sunDisplay.add(sunIcon);

    // 阳光数值
    const sunText = this.createText(55, 0, ECONOMY_CONFIG.INITIAL_SUN.toString(), {
      fontSize: '20px',
      color: '#ffffff'
    });
    sunText.setOrigin(0.5);
    sunDisplay.add(sunText);

    // 监听阳光变化
    this.game.events.on(GameEvents.SUN_CHANGED, (sun: number) => {
      sunText.setText(sun.toString());
    });
  }

  /**
   * 创建植物选择栏
   */
  private createPlantSelector(): void {
    const plantBar = this.add.container(130, 20);

    const availablePlants = [
      { id: 'sunflower', cost: 50, color: 0xfcd34d },
      { id: 'peashooter', cost: 100, color: 0x4ade80 },
      { id: 'wallnut', cost: 50, color: 0x8b4513 },
      { id: 'cherry_bomb', cost: 150, color: 0xff4444 },
      { id: 'snow_pea', cost: 175, color: 0xaaddff },
      { id: 'repeater', cost: 200, color: 0x22c55e },
      { id: 'chomper', cost: 150, color: 0x4a0404 }
    ];

    let xOffset = 0;
    availablePlants.forEach((plant) => {
      const card = this.createPlantCard(xOffset, 0, plant.id, plant.cost, plant.color);
      plantBar.add(card);
      xOffset += 70;
    });
  }

  /**
   * 创建植物卡片
   */
  private createPlantCard(x: number, y: number, plantId: string, cost: number, color: number): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.rectangle(30, 30, 60, 80, 0x1e293b, 0.9);
    bg.setStrokeStyle(2, 0x475569);
    card.add(bg);

    // 植物图标
    const icon = this.add.rectangle(30, 30, 40, 40, color);
    card.add(icon);

    // 植物名称首字母
    const nameText = this.add.text(30, 30, plantId.charAt(0).toUpperCase(), {
      fontSize: '20px',
      color: '#ffffff'
    });
    nameText.setOrigin(0.5);
    card.add(nameText);

    // 阳光成本
    const costText = this.createText(30, 65, cost.toString(), {
      fontSize: '14px',
      color: '#f59e0b'
    });
    costText.setOrigin(0.5);
    card.add(costText);

    // 交互
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x4ade80);
      bg.setFillStyle(0x2d3748, 0.95);
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x475569);
      bg.setFillStyle(0x1e293b, 0.9);
    });

    bg.on('pointerdown', () => {
      this.onPlantCardClick(plantId, cost);
    });

    return card;
  }

  /**
   * 创建铲子按钮
   */
  private createShovelButton(): void {
    const shovelBtn = this.createButton(650, 80, 50, 50, '🥄', () => {
      this.selectedPlant = 'shovel';
      this.showPlantPreview();
    });
  }

  /**
   * 创建进度条
   */
  private createProgressBar(): void {
    const progressBar = this.add.container(650, 30);

    // 背景
    const bg = this.add.rectangle(0, 0, 120, 20, 0x1e293b, 0.9);
    bg.setStrokeStyle(1, 0x475569);
    progressBar.add(bg);

    // 进度
    const progress = this.add.rectangle(-55, 0, 0, 16, 0x4ade80);
    progress.setOrigin(0, 0.5);
    progressBar.add(progress);

    // 旗帜标记
    const flagIcon = this.createText(0, 0, '🚩', { fontSize: '14px' });
    flagIcon.setOrigin(0.5);
    progressBar.add(flagIcon);

    // 更新进度
    this.game.events.on(GameEvents.WAVE_STARTED, (data: { waveNumber: number; totalWaves: number }) => {
      const progressPercent = data.waveNumber / data.totalWaves;
      progress.width = 110 * progressPercent;
    });
  }

  /**
   * 创建暂停按钮
   */
  private createPauseButton(): void {
    const pauseBtn = this.createButton(750, 30, 40, 40, '⏸', () => {
      this.pauseGame();
    });
  }

  /**
   * 选择植物
   */
  private selectPlant(plantId: string, cost: number): void {
    // 检查阳光是否足够
    if (!this.economySystem.canAfford(cost)) {
      this.audioManager?.playSfx(SoundEffect.ERROR);
      this.showNotification('阳光不足！', 1000);
      return;
    }

    this.selectedPlant = plantId;
    this.selectedPlantCost = cost;
    this.showPlantPreview();
  }

  /**
   * 显示植物预览
   */
  private showPlantPreview(): void {
    // 移除旧预览
    this.plantPreview?.destroy();
    this.plantPreview = null;

    if (!this.selectedPlant) return;

    // 创建预览
    this.plantPreview = this.add.container(0, 0);

    const preview = this.add.rectangle(0, 0, 60, 80, 0x4ade80, 0.5);
    preview.setStrokeStyle(2, 0x4ade80);
    this.plantPreview.add(preview);
  }

  /**
   * 更新植物预览位置
   */
  private updatePlantPreview(): void {
    if (!this.plantPreview || !this.selectedPlant) return;

    const pointer = this.input.activePointer;
    this.plantPreview.x = pointer.x;
    this.plantPreview.y = pointer.y;
  }

  /**
   * 网格点击处理
   */
  private onGridCellClick(row: number, col: number): void {
    if (!this.selectedPlant) return;

    // 铲子模式
    if (this.selectedPlant === 'shovel') {
      this.removePlant(row, col);
      return;
    }

    // 种植模式
    this.plantPlant(row, col);
  }

  /**
   * 种植植物
   */
  private plantPlant(row: number, col: number): void {
    if (!this.selectedPlant) return;

    // 检查是否可以种植
    if (!this.gridSystem.canPlant(row, col)) {
      this.audioManager?.playSfx(SoundEffect.ERROR);
      this.showNotification('这里不能种植！', 1000);
      return;
    }

    // 消耗阳光
    if (!this.economySystem.spend(this.selectedPlantCost)) {
      this.audioManager?.playSfx(SoundEffect.ERROR);
      this.showNotification('阳光不足！', 1000);
      return;
    }

    // 创建植物
    const plant = this.plantFactory.createPlant(this.selectedPlant, row, col);
    if (plant) {
      this.plants.set(`${row}-${col}`, plant);
      this.plantLayer?.add(plant);
      this.gridSystem.setPlant(row, col, this.selectedPlant);

      // 播放种植音效
      this.audioManager?.playSfx(SoundEffect.PLANT);

      // 种植动画
      this.playPlantAnimation(plant);
    }

    // 清除选择
    this.selectedPlant = null;
    this.selectedPlantCost = 0;
    this.plantPreview?.destroy();
    this.plantPreview = null;
  }

  /**
   * 种植动画
   */
  private playPlantAnimation(plant: Plant): void {
    plant.setScale(0);
    this.tweens.add({
      targets: plant,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * 移除植物
   */
  private removePlant(row: number, col: number): void {
    const key = `${row}-${col}`;
    const plant = this.plants.get(key);

    if (plant) {
      // 播放铲子音效
      this.audioManager?.playSfx(SoundEffect.SHOVEL);

      plant.die();
      this.plants.delete(key);
      this.gridSystem.removePlant(row, col);

      // 清除选择
      this.selectedPlant = null;
      this.plantPreview?.destroy();
      this.plantPreview = null;
    }
  }

  /**
   * 植物卡片点击处理
   */
  private onPlantCardClick(plantId: string, cost: number): void {
    this.selectPlant(plantId, cost);
  }

  /**
   * 显示通知
   */
  private showNotification(text: string, duration: number): void {
    const notification = this.add.text(400, 100, text, {
      fontSize: '24px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 4
    });
    notification.setOrigin(0.5);

    this.tweens.add({
      targets: notification,
      y: 80,
      alpha: 0,
      duration: duration,
      onComplete: () => {
        notification.destroy();
      }
    });
  }

  /**
   * 开始游戏
   */
  private startGame(): void {
    this.game.events.emit(GameEvents.GAME_STARTED);

    // 播放游戏背景音乐
    this.audioManager?.playBgm(BackgroundMusic.GAME_DAY);

    // 加载第一关
    const levelConfig = plantConfigs['1-1'];
    this.waveSystem.loadLevel(levelConfig as any);
    this.waveSystem.start();
  }

  /**
   * 暂停游戏
   */
  private pauseGame(): void {
    this.isPaused = true;
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  /**
   * 恢复游戏
   */
  resumeGame(): void {
    this.isPaused = false;
  }

  /**
   * 游戏结束
   */
  gameOver(isVictory: boolean): void {
    this.isGameOver = true;
    this.game.events.emit(isVictory ? GameEvents.GAME_WON : GameEvents.GAME_OVER);

    // 播放胜利/失败音效和音乐
    if (isVictory) {
      this.audioManager?.playSfx(SoundEffect.WIN);
      this.audioManager?.playBgm(BackgroundMusic.VICTORY, 2000);
    } else {
      this.audioManager?.playSfx(SoundEffect.LOSE);
      this.audioManager?.playBgm(BackgroundMusic.DEFEAT, 2000);
    }

    this.transitionOut(500, () => {
      this.scene.start('GameOverScene', { isVictory });
    });
  }

  protected onPause(): void {
    this.pauseGame();
  }

  protected onShutdown(): void {
    // 清理系统
    this.gridSystem?.destroy();
    this.economySystem?.destroy();
    this.waveSystem?.destroy();
    this.combatSystem?.destroy();

    // 清理对象
    this.plants.clear();
    this.zombies = [];
  }
}
