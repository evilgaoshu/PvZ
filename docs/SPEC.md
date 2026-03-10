# 植物大战僵尸 - 技术规范文档

## 1. 技术栈版本

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | ^5.3.0 | 主开发语言 |
| Phaser | ^3.70.0 | 游戏引擎 |
| Vite | ^5.0.0 | 构建工具 |
| Zustand | ^4.4.0 | 状态管理 |
| ESLint | ^8.55.0 | 代码检查 |
| Prettier | ^3.1.0 | 代码格式化 |

## 2. 项目配置

### 2.1 TypeScript配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@game/*": ["src/game/*"],
      "@entities/*": ["src/game/entities/*"],
      "@systems/*": ["src/game/systems/*"],
      "@managers/*": ["src/game/managers/*"],
      "@data/*": ["src/data/*"],
      "@ui/*": ["src/ui/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.2 Vite配置

```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@game': path.resolve(__dirname, 'src/game'),
      '@entities': path.resolve(__dirname, 'src/game/entities'),
      '@systems': path.resolve(__dirname, 'src/game/systems'),
      '@managers': path.resolve(__dirname, 'src/game/managers'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: true
  }
});
```

## 3. 编码规范

### 3.1 文件命名

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| 类文件 | PascalCase.ts | `GridSystem.ts` |
| 工具函数 | camelCase.ts | `mathUtils.ts` |
| 配置文件 | camelCase.config.ts | `gameConfig.ts` |
| 类型定义 | camelCase.types.ts | `gameTypes.ts` |
| 常量文件 | UPPER_SNAKE_CASE.ts | `GAME_CONSTANTS.ts` |
| 样式文件 | kebab-case.css | `game-styles.css` |

### 3.2 类定义规范

```typescript
// 实体基类模板
export abstract class BaseEntity extends Phaser.GameObjects.Sprite {
  // 配置属性
  protected config: EntityConfig;

  // 状态属性
  protected health: number;
  protected isAlive: boolean = true;
  protected state: EntityState = EntityState.IDLE;

  // 组件引用
  protected healthComponent: HealthComponent;
  protected animationComponent: AnimationComponent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EntityConfig
  ) {
    super(scene, x, y, texture);
    this.config = config;
    this.health = config.health;

    this.initComponents();
    this.initAnimations();
  }

  // 抽象方法
  abstract initComponents(): void;
  abstract initAnimations(): void;
  abstract update(delta: number): void;

  // 公共方法
  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  public die(): void {
    this.isAlive = false;
    this.emit('death', this);
    this.destroy();
  }

  // Getter/Setter
  public getHealth(): number {
    return this.health;
  }

  public isDead(): boolean {
    return !this.isAlive;
  }
}
```

### 3.3 事件定义规范

```typescript
// events/gameEvents.ts
export enum GameEvents {
  // 经济事件
  SUN_COLLECTED = 'sun:collected',
  SUN_CHANGED = 'sun:changed',

  // 种植事件
  PLANT_PLACED = 'plant:placed',
  PLANT_REMOVED = 'plant:removed',

  // 战斗事件
  ZOMBIE_SPAWNED = 'zombie:spawned',
  ZOMBIE_DIED = 'zombie:died',
  PROJECTILE_FIRED = 'projectile:fired',
  PROJECTILE_HIT = 'projectile:hit',

  // 波次事件
  WAVE_STARTED = 'wave:started',
  WAVE_COMPLETED = 'wave:completed',
  FINAL_WAVE_WARNING = 'wave:final_warning',

  // 游戏状态事件
  GAME_STARTED = 'game:started',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  GAME_OVER = 'game:over',
  GAME_WON = 'game:won'
}

// 事件数据类型
export interface SunCollectedEvent {
  amount: number;
  source: 'falling' | 'plant' | 'zombie';
  position?: { x: number; y: number };
}

export interface PlantPlacedEvent {
  plantType: string;
  row: number;
  col: number;
  cost: number;
}

export interface ZombieSpawnedEvent {
  zombieType: string;
  row: number;
  health: number;
}
```

### 3.4 配置定义规范

```typescript
// 所有配置必须包含ID和名称
interface BaseConfig {
  id: string;
  name: string;
  description?: string;
}

// 植物配置
export interface PlantConfig extends BaseConfig {
  // 基础属性
  cost: number;
  health: number;
  cooldown: number; // 秒

  // 攻击属性（可选）
  attackDamage?: number;
  attackInterval?: number; // 秒
  attackRange?: number; // 格子数
  projectileType?: string;

  // 生产属性（可选）
  produceAmount?: number;
  produceInterval?: number; // 秒

  // 防御属性（可选）
  armor?: number;
  blockCount?: number;

  // 特殊效果
  specialEffects?: string[];

  // 资源路径
  spriteSheet: string;
  animations: AnimationConfig[];
}

// 僵尸配置
export interface ZombieConfig extends BaseConfig {
  // 基础属性
  health: number;
  speed: number; // 像素/秒
  damage: number;
  attackInterval: number;

  // 护甲
  armor?: number;
  armorType?: 'cone' | 'bucket' | 'screenDoor';

  // 特殊能力
  abilities?: string[];

  // 掉落
  loot?: LootConfig[];

  // 资源路径
  spriteSheet: string;
  animations: AnimationConfig[];
}
```

## 4. 资源规范

### 4.1 图片资源

**格式要求:**
- 优先使用: WebP（压缩率高）
- 兼容使用: PNG（保留透明度）
- 精灵图尺寸: 2的幂次方（64x64, 128x128, 256x256, 512x512）

**目录结构:**
```
public/assets/images/
├── plants/
│   ├── sunflower.webp
│   ├── peashooter.webp
│   └── ...
├── zombies/
│   ├── normal-zombie.webp
│   ├── conehead-zombie.webp
│   └── ...
├── projectiles/
│   ├── pea.webp
│   ├── snow-pea.webp
│   └── ...
├── ui/
│   ├── button.webp
│   ├── panel.webp
│   └── ...
├── backgrounds/
│   ├── day-grass.webp
│   ├── night-grass.webp
│   └── ...
└── effects/
    ├── explosion.webp
    ├── sparkle.webp
    └── ...
```

**命名规范:**
- 植物: `{plant-name}.webp`
- 僵尸: `{type}-zombie.webp`
- 动画帧: `{name}-{frame-number}.webp` (e.g., `sunflower-001.webp`)

### 4.2 音频资源

**格式要求:**
- 背景音乐: OGG (循环压缩)
- 音效: WAV 或 OGG
- 采样率: 44.1kHz
- 声道: 单声道（音效）/立体声（音乐）

**目录结构:**
```
public/assets/audio/
├── bgm/
│   ├── menu.ogg
│   ├── day.ogg
│   ├── night.ogg
│   └── boss.ogg
├── sfx/
│   ├── plant.ogg
│   ├── shoot.ogg
│   ├── hit.ogg
│   ├── explode.ogg
│   └── collect-sun.ogg
└── voice/
    └── ...
```

## 5. 接口契约

### 5.1 系统接口

```typescript
// 系统基类接口
interface ISystem {
  init(): void;
  update(delta: number): void;
  destroy(): void;
}

// 网格系统接口
interface IGridSystem extends ISystem {
  readonly rows: number;
  readonly cols: number;
  readonly cellWidth: number;
  readonly cellHeight: number;

  screenToGrid(screenX: number, screenY: number): GridCell | null;
  gridToScreen(row: number, col: number): { x: number; y: number };
  isValidCell(row: number, col: number): boolean;
  canPlant(row: number, col: number): boolean;
  getPlant(row: number, col: number): IPlant | null;
  setPlant(row: number, col: number, plant: IPlant | null): void;
  getZombiesInRow(row: number): IZombie[];
}

// 经济系统接口
interface IEconomySystem extends ISystem {
  getSun(): number;
  addSun(amount: number, source: SunSource): void;
  canAfford(cost: number): boolean;
  spend(cost: number): boolean;
  onSunChanged(callback: (sun: number) => void): void;
}

// 波次系统接口
interface IWaveSystem extends ISystem {
  readonly currentWave: number;
  readonly totalWaves: number;
  readonly isWaveInProgress: boolean;

  startWave(): void;
  onWaveStart(callback: (wave: number) => void): void;
  onWaveComplete(callback: (wave: number) => void): void;
  onFinalWave(callback: () => void): void;
}
```

### 5.2 实体接口

```typescript
// 实体基类接口
interface IEntity {
  readonly id: string;
  readonly type: string;
  readonly position: { x: number; y: number };

  getHealth(): number;
  getMaxHealth(): number;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isAlive(): boolean;
  destroy(): void;
}

// 植物接口
interface IPlant extends IEntity {
  readonly config: PlantConfig;
  readonly row: number;
  readonly col: number;

  update(delta: number): void;
  canAttack(): boolean;
  attack(): void;
  onPlant(callback: () => void): void;
  onDeath(callback: () => void): void;
}

// 僵尸接口
interface IZombie extends IEntity {
  readonly config: ZombieConfig;
  readonly row: number;

  update(delta: number): void;
  move(delta: number): void;
  canAttack(): boolean;
  attack(target: IPlant): void;
  slow(duration: number): void;
  isSlowed(): boolean;
}
```

## 6. 性能指标

### 6.1 目标帧率
- **目标**: 60 FPS
- **最低可接受**: 30 FPS
- **测量工具**: Phaser调试模式 + Chrome DevTools

### 6.2 内存预算
- **初始加载**: < 50MB
- **运行时峰值**: < 150MB
- **每关卡增长**: < 20MB

### 6.3 加载时间
- **首次加载**: < 3秒（3G网络）
- **关卡切换**: < 1秒
- **资源预加载**: 关卡开始前完成

### 6.4 同屏限制
- **植物数量**: < 45（9×5格子）
- **僵尸数量**: < 50
- **投射物数量**: < 100
- **特效粒子**: < 500

## 7. 测试规范

### 7.1 单元测试

```typescript
// 测试文件命名: {module}.test.ts
// 测试示例
describe('GridSystem', () => {
  let gridSystem: GridSystem;

  beforeEach(() => {
    gridSystem = new GridSystem({
      rows: 5,
      cols: 9,
      cellWidth: 80,
      cellHeight: 100
    });
  });

  describe('screenToGrid', () => {
    it('should convert screen coordinates to grid cell', () => {
      const cell = gridSystem.screenToGrid(40, 50);
      expect(cell).toEqual({ row: 0, col: 0 });
    });

    it('should return null for out of bounds coordinates', () => {
      const cell = gridSystem.screenToGrid(-10, -10);
      expect(cell).toBeNull();
    });
  });
});
```

### 7.2 测试覆盖率
- 核心系统: > 80%
- 实体类: > 70%
- 工具函数: > 90%

## 8. 文档规范

### 8.1 代码注释

```typescript
/**
 * 植物基类
 * 所有植物实体的抽象基类，提供通用功能
 *
 * @abstract
 * @extends Phaser.GameObjects.Sprite
 */
export abstract class Plant extends Phaser.GameObjects.Sprite {
  /**
   * 植物配置数据
   * @protected
   * @type {PlantConfig}
   */
  protected config: PlantConfig;

  /**
   * 受到攻击时的处理
   *
   * @param {number} amount - 伤害数值
   * @param {DamageType} [type='normal'] - 伤害类型
   * @returns {void}
   */
  public takeDamage(amount: number, type: DamageType = 'normal'): void {
    // 实现代码
  }
}
```

### 8.2 README文档
每个模块必须包含:
- 模块用途
- 主要功能
- 使用示例
- 依赖关系

## 9. 版本控制

### 9.1 分支策略

```
main
  └── develop
       ├── feature/grid-system
       ├── feature/plant-entities
       ├── feature/zombie-ai
       └── bugfix/collision-detection
```

### 9.2 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例:**
```
feat(plants): add sunflower plant entity

- Implement Sunflower class extending Plant base
- Add sun production logic every 24 seconds
- Include idle and producing animations

Closes #123
```
