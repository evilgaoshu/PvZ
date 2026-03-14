import { BaseScene } from './BaseScene';
import { GridSystem } from '@systems/GridSystem';
import { EconomySystem } from '@systems/EconomySystem';
import { WaveSystem } from '@systems/WaveSystem';
import { CombatSystem } from '@systems/CombatSystem';
import { PlantFactory } from '@entities/plants/PlantFactory';
import { ZombieFactory } from '@entities/zombies/ZombieFactory';
import { Pea, SnowPea } from '@entities/projectiles/Projectile';
import {
  GRID_CONFIG,
  GameEvents,
  ECONOMY_CONFIG,
  EntityState,
} from '@/types/index';
import { plantConfigs, zombieConfigs } from '@data/plants/plantConfigs';
import type { LevelConfig } from '@/types/config';
import { Plant } from '@entities/plants/Plant';
import { Zombie } from '@entities/zombies/Zombie';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect, BackgroundMusic } from '@config/AudioConfig';
import { ProjectilePool } from '@game/utils/ObjectPool';
import { SunDisplay } from '@ui/hud/SunDisplay';
import { PlantSelector } from '@ui/hud/PlantSelector';
import { ProgressBar } from '@ui/hud/ProgressBar';
import { SeedPicker } from '@ui/hud/SeedPicker';
import { GameButton } from '@ui/components/GameButton';

/**
 * 游戏场景
 * 主游戏战斗场景
 */
export class GameScene extends BaseScene {
  private readonly gameEventListeners: Array<{
    event: string;
    handler: (...args: any[]) => void;
  }> = [];

  public gridSystem!: GridSystem;
  private economySystem!: EconomySystem;
  private waveSystem!: WaveSystem;
  private combatSystem!: CombatSystem;

  private plantFactory!: PlantFactory;
  private zombieFactory!: ZombieFactory;
  private projectilePool!: ProjectilePool;
  private audioManager!: AudioManager;

  private gameContainer: Phaser.GameObjects.Container | null = null;
  private plantLayer: Phaser.Physics.Arcade.StaticGroup | null = null;
  private zombieLayer: Phaser.Physics.Arcade.Group | null = null;
  private projectileLayer: Phaser.Physics.Arcade.Group | null = null;
  private uiLayer: Phaser.GameObjects.Container | null = null;

  private plants: Map<string, Plant> = new Map();
  private platforms: Map<string, Plant> = new Map(); // 专门存储睡莲等平台
  private zombies: Zombie[] = [];
  private zombiesByRow: Map<number, Zombie[]> = new Map();
  private projectilesByRow: Map<number, any[]> = new Map();
  private lawnMowers: Phaser.GameObjects.Container[] = [];
  private activeMowerRows: Set<number> = new Set();
  private selectedPlant: string | null = null;
  private selectedPlantCost: number = 0;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;

  private plantPreview: Phaser.GameObjects.Container | null = null;
  private sunDisplayComp!: SunDisplay;
  private plantSelectorComp!: PlantSelector;
  private progressBarComp!: ProgressBar;

  private currentLevelId: string = '1-1';
  private levelData: LevelConfig | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelId?: string }): void {
    super.init(data);
    if (data.levelId) this.currentLevelId = data.levelId;
  }

  protected onInit(): void {
    this.audioManager = this.game.registry.get('audioManager') as AudioManager;
    if (!this.audioManager) this.audioManager = new AudioManager(this);
  }

  protected onPreload(): void {
    this.load.json('levelsData', 'assets/data/compiled/levels.json');
    this.createProjectileTextures();
  }

  private createProjectileTextures(): void {
    if (this.textures.exists('pea')) return;
    const g = this.make.graphics({ fillStyle: { color: 0x4ade80 } }, false);
    g.fillCircle(10, 10, 8).generateTexture('pea', 20, 20);
    g.clear()
      .fillStyle(0xaaddff)
      .fillCircle(10, 10, 8)
      .generateTexture('snow_pea', 20, 20);
    g.destroy();
  }

  protected onCreate(): void {
    const allLevels = this.cache.json.get('levelsData');
    this.levelData = allLevels ? allLevels[this.currentLevelId] : null;

    this.createLayers();
    this.initializeSystems();

    // 初始化地形与分路数据结构
    for (let i = 0; i < GRID_CONFIG.ROWS; i++) {
      this.zombiesByRow.set(i, []);
      this.projectilesByRow.set(i, []);
    }

    if (this.levelData) {
      this.gridSystem.initializeGrid(this.levelData.background);
    }

    this.createGridVisuals();
    this.initializeFactories();
    this.createUI();
    this.setupEventListeners();
    this.setupCollisions();
    this.startGame();
    this.transitionIn(300);
  }

  protected onUpdate(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 清空分路缓存
    this.zombiesByRow.forEach((arr) => (arr.length = 0));
    this.projectilesByRow.forEach((arr) => (arr.length = 0));

    this.economySystem.update(delta);
    this.waveSystem.update(delta);
    this.combatSystem.update(delta);

    this.plants.forEach((p) => p.active && p.update(time, delta));
    this.platforms.forEach((p) => p.active && p.update(time, delta));

    this.zombies = this.zombies.filter((z) => {
      if (z.active && z.isZombieAlive()) {
        z.update(time, delta);
        // 填充到对应的路
        this.zombiesByRow.get(z.getRow())?.push(z);
        return true;
      }
      return false;
    });

    this.projectileLayer?.children.iterate((c: any) => {
      if (c.active && c.update) {
        c.update();
        // 填充到对应的路
        this.projectilesByRow.get(c.getRow())?.push(c);
      }
      return true;
    });

    this.updatePlantPreview();

    // 执行分路碰撞检测
    this.handleLaneCollisions();
  }

  private handleLaneCollisions(): void {
    for (let i = 0; i < GRID_CONFIG.ROWS; i++) {
      const rowZombies = this.zombiesByRow.get(i) || [];
      const rowProjectiles = this.projectilesByRow.get(i) || [];

      if (rowZombies.length === 0 || rowProjectiles.length === 0) continue;

      for (const proj of rowProjectiles) {
        for (const zombie of rowZombies) {
          // 简单的 AABB 碰撞检测
          if (Math.abs(proj.x - zombie.x) < 30) {
            zombie.takeDamage(proj.getDamage(), proj.getProjectileType());
            if (proj.getIsSlowing()) zombie.applySlow(3000);
            proj.hit(zombie);
            break; // 一个子弹通常只打一个僵尸
          }
        }
      }
    }
  }

  private createLayers(): void {
    this.gameContainer = this.add.container(0, 0);
    const bgLayer = this.add.container(0, 0);
    this.gameContainer.add(bgLayer);

    const bgKey = this.levelData?.background || 'day-grass';
    const bgImage = this.add.image(400, 300, bgKey);
    bgLayer.add(bgImage);

    // 显式设置背景深度
    bgLayer.setDepth(-10);

    // 植物使用静态组以优化碰撞
    this.plantLayer = this.physics.add.staticGroup();
    this.zombieLayer = this.physics.add.group();
    this.projectileLayer = this.physics.add.group();
    this.uiLayer = this.add.container(0, 0);
    this.uiLayer.setDepth(100);
    this.gameContainer.add(this.uiLayer);
  }

  private createGridVisuals(): void {
    const { OFFSET_X, OFFSET_Y, ROWS, COLS, CELL_WIDTH, CELL_HEIGHT } =
      GRID_CONFIG;

    const graphics = this.add.graphics();
    graphics.setDepth(-5);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = OFFSET_X + col * CELL_WIDTH;
        const y = OFFSET_Y + row * CELL_HEIGHT;

        if ((row + col) % 2 === 0) {
          graphics.fillStyle(0x064e3b, 0.15);
          graphics.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        } else {
          graphics.fillStyle(0x422006, 0.1);
          graphics.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }

        graphics.lineStyle(2, 0x000000, 0.2);
        graphics.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

        const cell = this.add.rectangle(
          x + CELL_WIDTH / 2,
          y + CELL_HEIGHT / 2,
          CELL_WIDTH,
          CELL_HEIGHT,
          0xffffff,
          0
        );
        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerdown', () => this.onGridCellClick(row, col));
      }
    }
    this.addLawnDecorations();
  }

  private addLawnDecorations(): void {
    const { OFFSET_Y, CELL_HEIGHT, ROWS } = GRID_CONFIG;
    for (let row = 0; row < ROWS; row++) {
      if (this.gridSystem.getTerrainType(row, 0) === 'water') continue;
      this.createLawnMower(
        180,
        OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2,
        row
      );
      this.activeMowerRows.add(row);
    }
  }

  private createLawnMower(x: number, y: number, row: number): void {
    const mower = this.add.container(x, y);
    const sprite = this.add.image(0, 0, 'ui/lawn_mower');
    sprite.setDisplaySize(60, 50);
    mower.add(sprite);
    mower.setData('row', row).setData('isActive', false);
    this.lawnMowers.push(mower);
  }

  private activateLawnMower(
    mower: Phaser.GameObjects.Container,
    row: number
  ): void {
    mower.setData('isActive', true);
    this.tweens.add({
      targets: mower,
      x: 900,
      duration: 2000,
      onUpdate: () => {
        this.zombies.forEach((z) => {
          if (z.getRow() === row && z.x < mower.x + 50)
            z.takeDamage(9999, 'explosion');
        });
      },
      onComplete: () => {
        mower.destroy();
        this.lawnMowers = this.lawnMowers.filter((m) => m !== mower);
      },
    });
    this.audioManager?.playSfx(SoundEffect.LAWN_MOWER);
  }

  private initializeSystems(): void {
    this.gridSystem = new GridSystem(this);
    this.economySystem = new EconomySystem(this);
    this.waveSystem = new WaveSystem(this);
    this.combatSystem = new CombatSystem(this);
  }

  private initializeFactories(): void {
    this.plantFactory = new PlantFactory(this);
    this.zombieFactory = new ZombieFactory(this);
    this.projectilePool = new ProjectilePool(this);
  }

  private registerGameEvent(
    event: string,
    handler: (...args: any[]) => void
  ): void {
    this.game.events.on(event, handler);
    this.gameEventListeners.push({ event, handler });
  }

  private setupEventListeners(): void {
    this.registerGameEvent(GameEvents.ZOMBIE_SPAWNED, (d: any) =>
      this.spawnZombie(d.zombieType, d.row)
    );
    this.registerGameEvent(GameEvents.PROJECTILE_FIRED, (d: any) =>
      this.fireProjectile(d)
    );
    this.registerGameEvent(GameEvents.ALL_WAVES_COMPLETED, () =>
      this.time.delayedCall(3000, () => this.gameOver(true))
    );
    this.registerGameEvent(GameEvents.ZOMBIE_DIED, () =>
      this.waveSystem.onZombieKilled()
    );
    this.registerGameEvent('plant:check_target', (d: any) =>
      this.findTargetForPlant(d.row, d.plant)
    );
    this.registerGameEvent('zombie:reached_house', (z: Zombie) =>
      this.handleZombieReachedHouse(z)
    );
  }

  private handleZombieReachedHouse(zombie: Zombie): void {
    if (this.isGameOver) return;
    const row = zombie.getRow();
    const mower = this.lawnMowers.find(
      (m) => m.getData('row') === row && !m.getData('isActive')
    );
    if (mower) {
      this.activateLawnMower(mower, row);
    } else {
      this.gameOver(false);
    }
  }

  private setupCollisions(): void {
    // 僵尸啃食植物
    this.physics.add.overlap(this.zombieLayer!, this.plantLayer!, (z, p) => {
      const zombie = z as Zombie;
      const plant = p as Plant;
      if (
        zombie.getRow() === plant.getRow() &&
        Math.abs(zombie.x - plant.x) < 40
      ) {
        zombie.startAttacking(plant);
      }
    });
  }

  private createUI(): void {
    this.sunDisplayComp = new SunDisplay(this, 80, 40);
    this.uiLayer?.add(this.sunDisplayComp);
    this.registerGameEvent(GameEvents.SUN_CHANGED, (sun: number) =>
      this.sunDisplayComp.updateSun(sun)
    );

    this.plantSelectorComp = new PlantSelector(this, 160, 45, [], (id, cost) =>
      this.selectPlant(id, cost)
    );
    this.uiLayer?.add(this.plantSelectorComp);

    this.progressBarComp = new ProgressBar(this, 700, 40);
    this.uiLayer?.add(this.progressBarComp);
    this.registerGameEvent(GameEvents.WAVE_STARTED, (d: any) =>
      this.progressBarComp.setProgress(d.waveNumber / d.totalWaves)
    );

    const shovelBtn = new GameButton(
      this,
      600,
      40,
      { text: '🥄', width: 50, height: 50, borderRadius: 25 },
      () => {
        this.selectedPlant = 'shovel';
        this.showPlantPreview();
      }
    );
    this.uiLayer?.add(shovelBtn);

    const pauseBtn = new GameButton(
      this,
      780,
      40,
      { text: '⏸', width: 40, height: 40 },
      () => this.pauseGame()
    );
    this.uiLayer?.add(pauseBtn);
  }

  private startGame(): void {
    if (!this.levelData) return;

    this.audioManager?.playBgm(BackgroundMusic.MENU);
    this.cameras.main.scrollX = 0;

    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: 400,
        duration: 1500,
        ease: 'Cubic.easeInOut',
        yoyo: true,
        hold: 800,
        onComplete: () => {
          this.showSeedPicker();
        },
      });
    });
  }

  private showSeedPicker(): void {
    const available = this.levelData!.availablePlants.map((id) => {
      const cfg = plantConfigs[id];
      return {
        id,
        name: cfg.name,
        cost: cfg.cost,
        color: id === 'sunflower' ? 0xfcd34d : 0x4ade80,
      };
    });

    new SeedPicker(this, available, (selected) => {
      this.startLevelFlow(this.levelData!, selected);
    });
  }

  private startLevelFlow(
    levelConfig: LevelConfig,
    selectedPlants: any[]
  ): void {
    this.plantSelectorComp.updatePlants(selectedPlants);
    this.audioManager?.playBgm(BackgroundMusic.GAME_DAY);

    this.time.delayedCall(1000, () => {
      this.game.events.emit(GameEvents.GAME_STARTED);
      this.economySystem.start();
      this.waveSystem.loadLevel(levelConfig);
      this.waveSystem.start();
    });
  }

  private selectPlant(plantId: string, cost: number): void {
    if (!this.economySystem.canAfford(cost)) {
      this.audioManager?.playSfx(SoundEffect.ERROR);
      this.showNotification('阳光不足！', 1000);
      return;
    }
    this.selectedPlant = plantId;
    this.selectedPlantCost = cost;
    this.showPlantPreview();
  }

  private showPlantPreview(): void {
    this.plantPreview?.destroy();
    if (!this.selectedPlant) return;
    this.plantPreview = this.add.container(0, 0);
    const color = this.selectedPlant === 'shovel' ? 0xffffff : 0x4ade80;
    this.plantPreview.add(this.add.rectangle(0, 0, 60, 80, color, 0.5));
  }

  private updatePlantPreview(): void {
    if (!this.plantPreview || !this.selectedPlant) return;
    this.plantPreview.setPosition(
      this.input.activePointer.x,
      this.input.activePointer.y
    );
  }

  private onGridCellClick(row: number, col: number): void {
    if (!this.selectedPlant) return;
    if (this.selectedPlant === 'shovel') this.removePlant(row, col);
    else this.plantPlant(row, col);
  }

  private plantPlant(row: number, col: number): void {
    if (!this.selectedPlant || !this.levelData) return;
    const cfg = this.plantFactory.getPlantConfig(this.selectedPlant);
    if (!cfg) return;

    const terrain = this.gridSystem.getTerrainType(row, col);
    const hasLily = this.gridSystem.hasLilyPad(row, col);
    const rules = cfg.placement || ['grass'];

    let canPlace =
      rules.includes(terrain) ||
      (terrain === 'water' && hasLily && rules.includes('lilypad'));
    const existing = this.gridSystem.getPlant(row, col);
    if (existing && cfg.id !== 'lilypad') canPlace = false;
    if (cfg.id === 'lilypad' && hasLily) canPlace = false;

    if (!canPlace || !this.economySystem.spend(this.selectedPlantCost)) {
      this.audioManager?.playSfx(SoundEffect.ERROR);
      this.showNotification(
        terrain === 'water' && !hasLily ? '需要睡莲！' : '这里不能种植！',
        1000
      );
      return;
    }

    const plant = this.plantFactory.createPlant(this.selectedPlant, row, col);
    if (plant) {
      const key = `${row}-${col}`;
      this.plantLayer?.add(plant);
      if (cfg.id === 'lilypad') {
        this.platforms.set(key, plant);
        this.gridSystem.setPlatform(row, col, 'lilypad');
      } else {
        this.plants.set(key, plant);
        this.gridSystem.setPlant(row, col, this.selectedPlant);
      }
      this.audioManager?.playSfx(SoundEffect.PLANT);
    }
    this.selectedPlant = null;
    this.plantPreview?.destroy();
  }

  private removePlant(row: number, col: number): void {
    const key = `${row}-${col}`;
    const plant = this.plants.get(key);
    const platform = this.platforms.get(key);

    if (plant) {
      this.audioManager?.playSfx(SoundEffect.SHOVEL);
      this.gridSystem.removePlant(row, col);
      plant.die();
      this.plants.delete(key);
    } else if (platform) {
      this.audioManager?.playSfx(SoundEffect.SHOVEL);
      this.gridSystem.removePlatform(row, col);
      platform.die();
      this.platforms.delete(key);
    }
    this.selectedPlant = null;
    this.plantPreview?.destroy();
  }

  private findTargetForPlant(row: number, plant: Plant): void {
    let closest: Zombie | null = null;
    let minDist = Infinity;
    this.zombies.forEach((z) => {
      if (z.getRow() === row && z.x > plant.x) {
        const d = z.x - plant.x;
        if (d < minDist) {
          minDist = d;
          closest = z;
        }
      }
    });
    if (closest) plant.setAttackTarget(closest as any);
  }

  private spawnZombie(type: string, row: number): void {
    const zombie = this.zombieFactory.createZombie(type, row);
    if (zombie) {
      this.zombies.push(zombie);
      this.zombieLayer?.add(zombie);
    }
  }

  private fireProjectile(data: any): void {
    const proj = this.projectilePool.get(
      data.type === 'snow_pea' ? 'snow_pea' : 'pea'
    );
    proj.setRecycleHandler((i) => this.projectilePool.recycle(i as any));
    proj.setPosition(data.x, data.y).setProjectileData(data);
    this.projectileLayer?.add(proj);
    this.audioManager?.playSfx(SoundEffect.SHOOT);
  }

  private showNotification(text: string, duration: number): void {
    const n = this.add.text(400, 100, text, {
      fontSize: '24px',
      color: '#ef4444',
      stroke: '#000',
      strokeThickness: 4,
    });
    this.tweens.add({
      targets: n,
      y: 80,
      alpha: 0,
      duration,
      onComplete: () => n.destroy(),
    });
  }

  private pauseGame(): void {
    this.isPaused = true;
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  resumeGame(): void {
    this.isPaused = false;
  }
  gameOver(win: boolean): void {
    this.isGameOver = true;
    this.audioManager?.playBgm(
      win ? BackgroundMusic.VICTORY : BackgroundMusic.DEFEAT
    );
    this.transitionOut(500, () =>
      this.scene.start('GameOverScene', { isVictory: win })
    );
  }

  protected onShutdown(): void {
    this.gameEventListeners.forEach((l) =>
      this.game.events.off(l.event, l.handler)
    );
    this.gridSystem?.destroy();
    this.economySystem?.destroy();
    this.waveSystem?.destroy();
    this.combatSystem?.destroy();
    this.projectilePool?.destroy();
  }
}
