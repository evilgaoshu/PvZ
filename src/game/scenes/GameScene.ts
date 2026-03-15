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
    this.setupDebugCommands();
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

      // Torchwood transformation logic
      if (rowProjectiles.length > 0) {
        // Find torchwoods in this row
        const torchwoods: Plant[] = [];
        this.plants.forEach((p) => {
          if (p.getRow() === i && p.getConfig().id === 'torchwood') {
            torchwoods.push(p);
          }
        });

        if (torchwoods.length > 0) {
          for (const proj of rowProjectiles) {
            const pType = proj.getProjectileType();
            if (pType === 'pea' || pType === 'snow_pea') {
              for (const tw of torchwoods) {
                // If projectile passes the torchwood
                if (Math.abs(proj.x - tw.x) < 20) {
                  // Transform to fire pea
                  const data = {
                    damage: 40,
                    speed: 300,
                    row: proj.getRow(),
                    type: 'fire_pea',
                  };
                  // Recycle old projectile and fire a new fire_pea
                  this.fireProjectile({ x: proj.x, y: proj.y, ...data });
                  proj.recycle();
                  break;
                }
              }
            }
          }
        }
      }

      if (rowZombies.length === 0 || rowProjectiles.length === 0) continue;

      for (const proj of rowProjectiles) {
        if (!proj.active) continue; // Might have been recycled by torchwood
        for (const zombie of rowZombies) {
          // AABB 碰撞检测
          if (Math.abs(proj.x - zombie.x) < 40) {
            zombie.takeDamage(proj.getDamage(), proj.getProjectileType());
            if (proj.getIsSlowing()) zombie.applySlow(3000);

            // Fire pea splash damage
            if (proj.getProjectileType() === 'fire_pea') {
              this.handleExplosion({
                x: zombie.x,
                y: zombie.y,
                damage: 20,
                type: 'explosion',
                radius: 60,
              });
            }

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
    // 背景图现在是 1400 宽，中心点在 700
    const bgImage = this.add.image(700, 300, bgKey);
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
      // 绘制行与行之间的深色分割线，增强道路区分度
      graphics.lineStyle(4, 0x000000, 0.1);
      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          OFFSET_X,
          OFFSET_Y + row * CELL_HEIGHT,
          OFFSET_X + COLS * CELL_WIDTH,
          OFFSET_Y + row * CELL_HEIGHT
        )
      );

      for (let col = 0; col < COLS; col++) {
        const x = OFFSET_X + col * CELL_WIDTH;
        const y = OFFSET_Y + row * CELL_HEIGHT;

        // 使用交替色块，但增加边框感
        if ((row + col) % 2 === 0) {
          graphics.fillStyle(0x000000, 0.1);
          graphics.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }

        // 绘制方块细边框
        graphics.lineStyle(1, 0x000000, 0.1);
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

    // 最后一条水平分割线
    graphics.lineStyle(4, 0x000000, 0.1);
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        OFFSET_X,
        OFFSET_Y + ROWS * CELL_HEIGHT,
        OFFSET_X + COLS * CELL_WIDTH,
        OFFSET_Y + ROWS * CELL_HEIGHT
      )
    );

    this.addLawnDecorations();
  }

  private addLawnDecorations(): void {
    const { OFFSET_Y, CELL_HEIGHT, ROWS } = GRID_CONFIG;
    for (let row = 0; row < ROWS; row++) {
      if (this.gridSystem.getTerrainType(row, 0) === 'water') continue;
      this.createLawnMower(
        245,
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
        // 使用物理系统重叠检测或者手动遍历该行僵尸
        this.zombies.forEach((z) => {
          if (z.getRow() === row && z.x < mower.x + 50 && z.x > mower.x - 50) {
            z.takeDamage(9999, 'explosion');
          }
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
    this.registerGameEvent(GameEvents.PROJECTILE_HIT, (d: any) =>
      this.handleExplosion(d)
    );
    this.registerGameEvent('projectile:lane_explosion', (d: any) =>
      this.handleLaneExplosion(d)
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

  private handleLaneExplosion(data: { row: number; damage: number }): void {
    this.audioManager?.playSfx(SoundEffect.EXPLOSION);

    // Create a visual fire effect across the whole lane
    const { OFFSET_Y, CELL_HEIGHT } = GRID_CONFIG;
    const y = OFFSET_Y + data.row * CELL_HEIGHT + CELL_HEIGHT / 2;

    const fireEffect = this.add.rectangle(
      400,
      y,
      800,
      CELL_HEIGHT,
      0xef4444,
      0.7
    );
    fireEffect.setDepth(10);
    this.tweens.add({
      targets: fireEffect,
      alpha: 0,
      scaleY: 0,
      duration: 800,
      onComplete: () => fireEffect.destroy(),
    });

    // Damage all zombies in this row
    this.zombies.forEach((zombie) => {
      if (zombie.getRow() === data.row) {
        zombie.takeDamage(data.damage, 'explosion');
      }
    });
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

    // 在右侧生成一些“预览僵尸”，位置更靠右，展现从草地外进来的感觉
    const previewZombies: Zombie[] = [];
    const zombieTypes = this.levelData.zombieTypes || ['normal'];
    for (let i = 0; i < 8; i++) {
      const type = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
      const z = this.zombieFactory.createZombie(type, i % 5);
      if (z) {
        z.setX(1100 + Math.random() * 200);
        z.setAlpha(0.8);
        previewZombies.push(z);
      }
    }

    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: 600, // 向右滑得更远
        duration: 2000,
        ease: 'Cubic.easeInOut',
        onComplete: () => {
          this.time.delayedCall(1000, () => {
            this.tweens.add({
              targets: this.cameras.main,
              scrollX: 100, // 滑回到 100，使视角更聚焦在草地上
              duration: 1500,
              ease: 'Cubic.easeInOut',
              onComplete: () => {
                // 清理预览僵尸
                previewZombies.forEach((z) => z.destroy());
                this.showSeedPicker();
              },
            });
          });
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

    const pointer = this.input.activePointer;
    const gridPos = this.gridSystem.screenToGrid(pointer.x, pointer.y);

    if (gridPos) {
      // Snap to grid
      const { OFFSET_X, OFFSET_Y, CELL_WIDTH, CELL_HEIGHT } = GRID_CONFIG;
      const snapX = OFFSET_X + gridPos.col * CELL_WIDTH + CELL_WIDTH / 2;
      const snapY = OFFSET_Y + gridPos.row * CELL_HEIGHT + CELL_HEIGHT / 2;
      this.plantPreview.setPosition(snapX, snapY);

      // Update color based on validity
      const rect = this.plantPreview.list[0] as Phaser.GameObjects.Rectangle;
      if (this.selectedPlant === 'shovel') {
        rect.fillColor = 0xffffff;
      } else {
        const cfg = this.plantFactory.getPlantConfig(this.selectedPlant);
        let canPlace = false;
        if (cfg) {
          const terrain = this.gridSystem.getTerrainType(
            gridPos.row,
            gridPos.col
          );
          const hasLily = this.gridSystem.hasLilyPad(gridPos.row, gridPos.col);
          const rules = cfg.placement || ['grass'];

          canPlace =
            rules.includes(terrain) ||
            (terrain === 'water' && hasLily && rules.includes('lilypad'));
          const existing = this.gridSystem.getPlant(gridPos.row, gridPos.col);
          if (existing && cfg.id !== 'lilypad') canPlace = false;
          if (cfg.id === 'lilypad' && hasLily) canPlace = false;
        }

        rect.fillColor = canPlace ? 0x4ade80 : 0xef4444; // Green for valid, Red for invalid
      }
    } else {
      // Free follow if out of bounds
      this.plantPreview.setPosition(pointer.x, pointer.y);
      const rect = this.plantPreview.list[0] as Phaser.GameObjects.Rectangle;
      rect.fillColor = this.selectedPlant === 'shovel' ? 0xffffff : 0xef4444;
    }
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
    if (closest) {
      plant.setAttackTarget(closest as any);
    } else {
      plant.setAttackTarget(null);
    }
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

  private handleExplosion(data: any): void {
    if (data.type !== 'explosion') return;

    // 播放爆炸音效
    this.audioManager?.playSfx(SoundEffect.EXPLOSION);

    // 查找范围内的僵尸
    const explosionRadius = data.radius || 150;
    this.zombies.forEach((zombie) => {
      const distance = Phaser.Math.Distance.Between(
        data.x,
        data.y,
        zombie.x,
        zombie.y
      );
      if (distance <= explosionRadius) {
        zombie.takeDamage(data.damage || 1800, 'explosion');
      }
    });
  }

  /**
   * 暴露调试方法到全局，方便测试
   */
  private setupDebugCommands(): void {
    (window as any).spawnZombie = (type: string, row: number) =>
      this.spawnZombie(type, row);
    (window as any).addSun = (amount: number) =>
      this.economySystem.addSun(amount);
    (window as any).winLevel = () => this.gameOver(true);
    (window as any).spawnPlant = (type: string, row: number, col: number) => {
      const plant = this.plantFactory.createPlant(type, row, col);
      if (plant) {
        this.plants.set(`${row}-${col}`, plant);
        this.plantLayer?.add(plant);
        this.gridSystem.setPlant(row, col, type);
      }
    };
    console.log(
      '调试命令: spawnZombie(type, row), spawnPlant(type, row, col), addSun(amount), winLevel()'
    );
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
