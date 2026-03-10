# 植物大战僵尸 - 架构设计文档

## 1. 项目概述

### 1.1 项目信息
- **项目名称**: Plants vs Zombies Web
- **项目版本**: 1.0.0
- **目标平台**: Web浏览器（桌面端优先）
- **技术栈**: TypeScript + Phaser 3 + Vite

### 1.2 游戏类型
2D塔防策略游戏，玩家通过种植植物抵御僵尸进攻。

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Game UI   │  │   HUD UI    │  │   Menu/Dialog UI    │  │
│  │  (Phaser)   │  │   (HTML)    │  │      (HTML)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       Game Logic Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Scenes    │  │   Systems   │  │    Game Managers    │  │
│  │             │  │             │  │                     │  │
│  │ - Boot      │  │ - Combat    │  │ - GameStateManager  │  │
│  │ - Menu      │  │ - Economy   │  │ - LevelManager      │  │
│  │ - Game      │  │ - Wave      │  │ - SaveManager       │  │
│  │ - GameOver  │  │ - Spawn     │  │ - AudioManager      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Entity & Data Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Plants    │  │   Zombies   │  │    Projectiles      │  │
│  │   (Class)   │  │   (Class)   │  │      (Class)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Configs   │  │    Types    │  │     Constants       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 设计原则

1. **ECS-like Pattern**: 实体拥有多个组件（位置、生命值、攻击等）
2. **事件驱动**: 使用Phaser事件系统解耦模块通信
3. **数据驱动**: 属性通过配置定义，便于平衡调整
4. **对象池**: 频繁创建销毁的对象使用对象池优化

## 3. 核心系统

### 3.1 网格系统 (GridSystem)

负责游戏场地网格的管理和坐标转换。

**职责:**
- 5行 × 9列网格管理
- 屏幕坐标与网格坐标互转
- 种植位置验证
- 行僵尸追踪

**接口:**
```typescript
interface GridSystem {
  screenToGrid(x: number, y: number): GridPosition | null;
  gridToScreen(row: number, col: number): ScreenPosition;
  canPlant(row: number, col: number): boolean;
  getPlant(row: number, col: number): Plant | null;
  setPlant(row: number, col: number, plant: Plant): void;
}
```

### 3.2 经济系统 (EconomySystem)

管理阳光资源的生产和消耗。

**阳光来源:**
| 来源 | 数值 | 间隔/条件 |
|------|------|-----------|
| 天空掉落 | 25 | 随机间隔（白天） |
| 向日葵生产 | 25 | 每24秒 |
| 双胞向日葵 | 50 | 每24秒 |
| 击杀僵尸 | 随机 | 击杀时 |

**接口:**
```typescript
interface EconomySystem {
  getSun(): number;
  addSun(amount: number): void;
  consumeSun(amount: number): boolean;
  spawnFallingSun(): void;
}
```

### 3.3 战斗系统 (CombatSystem)

处理攻击、伤害计算和战斗逻辑。

**职责:**
- 攻击触发检测
- 伤害计算
- 状态效果（减速、中毒等）
- 死亡判定

### 3.4 波次系统 (WaveSystem)

管理僵尸波次的生成和进度。

**波次结构:**
- 准备时间: 30秒初始准备
- 波次间隔: 20-30秒
- 旗帜波: 每大波最后波，大量僵尸
- 最终波: 显示警告，全力进攻

## 4. 实体设计

### 4.1 植物实体

**基类属性:**
```typescript
interface PlantConfig {
  id: string;
  name: string;
  cost: number;
  health: number;
  cooldown: number;
  attackDamage?: number;
  attackInterval?: number;
  attackRange?: number;
  specialAbility?: string;
}
```

**基础植物:**
| 植物 | 阳光成本 | 冷却 | 特性 |
|------|----------|------|------|
| 向日葵 | 50 | 7.5s | 生产阳光 |
| 豌豆射手 | 100 | 7.5s | 单行直线攻击 |
| 坚果墙 | 50 | 30s | 高生命值防御 |
| 樱桃炸弹 | 150 | 50s | 范围爆炸伤害 |
| 寒冰射手 | 175 | 7.5s | 攻击附带减速 |
| 双发射手 | 200 | 7.5s | 每次发射2颗豌豆 |

### 4.2 僵尸实体

**基类属性:**
```typescript
interface ZombieConfig {
  id: string;
  name: string;
  health: number;
  speed: number;
  damage: number;
  attackInterval: number;
  specialAbility?: string;
  armor?: number;
}
```

**基础僵尸:**
| 僵尸 | 生命值 | 速度 | 特性 |
|------|--------|------|------|
| 普通僵尸 | 200 | 慢 | 无 |
| 路障僵尸 | 370 | 慢 | 路障提供额外生命 |
| 铁桶僵尸 | 1100 | 慢 | 铁桶提供高额护甲 |
| 撑杆跳僵尸 | 340 | 快 | 跳过第一个植物 |
| 读报僵尸 | 420 | 慢→快 | 报纸掉落后狂暴 |

## 5. 场景设计

### 5.1 场景流程

```
BootScene → MenuScene → LevelSelectScene → GameScene → GameOverScene
                              ↑                              │
                              └──────────────────────────────┘
```

### 5.2 场景说明

| 场景 | 职责 |
|------|------|
| BootScene | 资源加载、初始化配置 |
| MenuScene | 主菜单、模式选择 |
| LevelSelectScene | 关卡选择地图 |
| GameScene | 主游戏战斗场景 |
| PauseScene | 暂停菜单（叠加） |
| GameOverScene | 游戏结束/胜利画面 |

## 6. 数据配置

### 6.1 配置结构

```
src/data/
├── plants/
│   └── plantConfigs.ts      # 植物属性配置
├── zombies/
│   └── zombieConfigs.ts     # 僵尸属性配置
├── levels/
│   └── levelConfigs.ts      # 关卡数据配置
└── game/
    └── gameConfig.ts        # 全局游戏配置
```

### 6.2 关卡配置示例

```typescript
interface LevelConfig {
  id: string;
  name: string;
  world: number;
  level: number;
  availablePlants: string[];
  zombieTypes: string[];
  waves: WaveConfig[];
  initialSun: number;
  background: string;
}
```

## 7. 性能优化策略

### 7.1 渲染优化
- 使用精灵图集(Texture Atlas)减少Draw Call
- 对象池复用频繁创建销毁的对象
- 脏矩形渲染只更新变化区域

### 7.2 逻辑优化
- 空间分割优化碰撞检测
- 事件驱动避免轮询
- 延迟加载关卡资源

### 7.3 内存优化
- 对象池管理子弹、阳光
- 场景切换时清理资源
- 纹理压缩(WebP)

## 8. 扩展性设计

### 8.1 新植物添加流程
1. 在`plantConfigs.ts`添加配置
2. 在`src/game/entities/plants/`创建类文件
3. 在植物工厂注册
4. 添加精灵图资源

### 8.2 新僵尸添加流程
1. 在`zombieConfigs.ts`添加配置
2. 在`src/game/entities/zombies/`创建类文件
3. 在僵尸工厂注册
4. 添加精灵图资源

### 8.3 新关卡添加流程
1. 在`levelConfigs.ts`添加配置
2. 配置可用植物和僵尸类型
3. 设计波次结构
4. 添加背景资源

### 8.4 新音效添加流程
1. 在`AudioConfig.ts`添加音效枚举和配置
2. 将音频文件放入`public/assets/audio/sfx/`或`bgm/`
3. 在代码中使用`audioManager.playSfx()`或`playBgm()`播放
4. 如无需音频文件，可在`ProceduralAudio.ts`添加程序化生成

## 9. 音频系统

### 9.1 音频管理器 (AudioManager)

集中管理所有游戏音频的播放、音量控制和资源加载。

**职责:**
- 音效(SFX)播放和管理
- 背景音乐(BGM)播放和切换
- 主音量、音效音量、音乐音量独立控制
- 淡入淡出效果
- 静音/取消静音
- 程序化音频生成（后备方案）

**音频类型:**

| 类型 | 说明 |
|------|------|
| SoundEffect | 种植、射击、击中、爆炸、收集、按钮点击等 |
| BackgroundMusic | 菜单、游戏白天、游戏夜晚、胜利、失败等 |

**使用示例:**
```typescript
// 播放音效
audioManager.playSfx(SoundEffect.PLANT);
audioManager.playSfx(SoundEffect.SHOOT);

// 播放背景音乐（带淡入效果）
audioManager.playBgm(BackgroundMusic.GAME_DAY, 1000);

// 设置音量
audioManager.setMasterVolume(0.8);
audioManager.setSfxVolume(1.0);
audioManager.setBgmVolume(0.5);

// 静音切换
audioManager.toggleMute();
```

### 9.2 程序化音频 (ProceduralAudio)

当音频文件不存在时，使用 Web Audio API 生成合成音效作为后备。

**支持的音效:**
- 种植音效 - 正弦波音调
- 射击音效 - 频率递减的锯齿波
- 击中音效 - 噪音
- 爆炸音效 - 低频递减振荡器
- 阳光收集 - 频率递增的正弦波
- 按钮点击 - 短促方波
- 错误音效 - 低频锯齿波
- 胜利音效 - C大调琶音
- 失败音效 - 递减音调

## 10. 技术风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| Phaser学习曲线 | 中 | 预留学习时间，参考官方示例 |
| 性能瓶颈 | 高 | 对象池、空间分割优化 |
| 资源加载 | 中 | 按需加载、资源压缩 |
| 浏览器兼容 | 低 | 使用polyfill |
| 音频自动播放限制 | 中 | 首次交互后初始化音频 |

## 11. 开发规范

### 10.1 代码规范
- TypeScript严格模式
- ESLint + Prettier代码格式化
- 组件/类使用PascalCase
- 变量/函数使用camelCase
- 常量使用UPPER_SNAKE_CASE

### 10.2 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式efactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具
```
