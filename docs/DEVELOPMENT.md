# PvZ Web 开发指南

本文档为开发者提供详细的开发指南和调试技巧。

---

## 目录

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [添加新内容](#添加新内容)
- [调试技巧](#调试技巧)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

---

## 快速开始

### 环境准备

确保已安装：
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装与启动

```bash
# 克隆项目
git clone https://github.com/evilgaoshu/PvZ.git
cd PvZ

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

---

## 项目结构

```
src/
├── main.ts                      # 应用入口
├── game/
│   ├── scenes/                  # 游戏场景
│   │   ├── BootScene.ts         # 启动场景（资源加载）
│   │   ├── MenuScene.ts         # 主菜单
│   │   ├── GameScene.ts         # 主游戏场景
│   │   ├── PauseScene.ts        # 暂停菜单
│   │   └── GameOverScene.ts     # 游戏结束
│   ├── entities/                # 游戏实体
│   │   ├── plants/              # 植物类
│   │   │   ├── Plant.ts         # 植物基类
│   │   │   ├── Sunflower.ts     # 向日葵
│   │   │   ├── Peashooter.ts    # 豌豆射手
│   │   │   └── ...
│   │   ├── zombies/             # 僵尸类
│   │   │   ├── Zombie.ts        # 僵尸基类
│   │   │   ├── NormalZombie.ts  # 普通僵尸
│   │   │   └── ...
│   │   └── projectiles/         # 投射物
│   ├── systems/                 # 游戏系统
│   │   ├── GridSystem.ts        # 网格系统
│   │   ├── EconomySystem.ts     # 经济系统
│   │   ├── WaveSystem.ts        # 波次系统
│   │   └── CombatSystem.ts      # 战斗系统
│   ├── managers/                # 管理器
│   │   ├── AudioManager.ts      # 音频管理器
│   │   └── AchievementManager.ts
│   ├── config/                  # 配置文件
│   │   ├── GameConfig.ts
│   │   ├── AudioConfig.ts
│   │   └── plants/              # 植物/僵尸数据
│   └── utils/                   # 工具类
├── types/                       # TypeScript 类型定义
└── data/                        # 数据配置
```

---

## 开发工作流

### 可用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run build:dev        # 开发构建
npm run preview          # 预览生产构建

# 代码质量
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 检查
npm run lint:fix         # 自动修复 ESLint 问题
npm run format           # Prettier 格式化

# 测试
npm run test             # 运行单元测试
npm run test:coverage    # 生成测试覆盖率报告
npm run test:e2e         # 运行端到端测试
```

### 开发流程

1. **创建分支**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **开发与调试**
   ```bash
   npm run dev  # 在另一个终端保持运行
   ```

3. **代码检查**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

---

## 添加新内容

### 添加新植物

1. **在 `src/game/config/plants/plantConfigs.ts` 中添加配置：**

```typescript
export const plantConfigs: Record<string, PlantConfig> = {
  myplant: {
    id: 'myplant',
    name: '我的植物',
    description: '这是一个示例植物',
    cost: 100,
    health: 300,
    attackInterval: 1500,  // 毫秒
    damage: 20,
    attackRange: 600,
    sunProduction: 0,
    cooldown: 7500,  // 毫秒
    canAttack: true,
    isExplosive: false,
    color: 0x00ff00
  },
  // ...
};
```

2. **在 `src/game/entities/plants/` 创建植物类：**

```typescript
import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';

export class MyPlant extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 设置动画
  }

  protected updateSpecialAbility(time: number, delta: number): void {
    // 实现特殊能力
  }

  protected attack(time: number): void {
    // 实现攻击逻辑
    super.attack(time);
  }
}
```

3. **在 `PlantFactory.ts` 中注册：**

```typescript
import { MyPlant } from '../entities/plants/MyPlant';

// 在 createPlant 方法中添加
case 'myplant':
  return new MyPlant(this.scene, x, y, config);
```

### 添加新僵尸

1. **在 `src/game/config/plants/plantConfigs.ts` 中添加配置：**

```typescript
export const zombieConfigs: Record<string, ZombieConfig> = {
  myzombie: {
    id: 'myzombie',
    name: '我的僵尸',
    health: 200,
    speed: 20,  // 像素/秒
    damage: 10,
    attackInterval: 1000,
    reward: 50,  // 击杀奖励阳光
    color: 0x800080,
    canVault: false,
    hasNewspaper: false,
    hasShield: false
  },
  // ...
};
```

2. **在 `src/game/entities/zombies/` 创建僵尸类：**

```typescript
import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

export class MyZombie extends Zombie {
  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig, row: number) {
    super(scene, x, y, config, row);
  }

  protected checkSpecialAbility(): void {
    // 实现特殊能力检查
  }
}
```

3. **在 `ZombieFactory.ts` 中注册：**

```typescript
import { MyZombie } from '../entities/zombies/MyZombie';

// 在 createZombie 方法中添加
case 'myzombie':
  return new MyZombie(this.scene, x, y, config, row);
```

---

## 调试技巧

### 浏览器控制台调试

在开发模式下，游戏实例会自动暴露到全局：

```javascript
// 访问游戏实例
window.__debugGame

// 访问 Phaser 游戏实例
window.__debugGame.getPhaserGame()

// 获取当前场景
const game = window.__debugGame.getPhaserGame();
const scene = game.scene.getScene('GameScene');

// 修改阳光数量
scene.economySystem.addSun(1000, 'cheat');

// 生成僵尸
scene.events.emit('zombie:spawn', { type: 'normal', row: 2 });

// 查看游戏状态
console.log(scene.zombies);
console.log(scene.plants);
```

### Phaser 调试

```typescript
// 在场景中启用物理调试
this.physics.world.createDebugGraphic();

// 显示游戏对象边界
this.gameObjects.forEach(obj => {
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xff0000);
  graphics.strokeRect(obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
});
```

### 性能监控

```typescript
// 在 GameScene 的 update 中添加
update(time: number, delta: number): void {
  // 显示 FPS
  if (this.fpsText) {
    this.fpsText.setText(`FPS: ${Math.round(1000 / delta)}`);
  }

  // 显示对象数量
  console.log('Zombies:', this.zombies.length);
  console.log('Plants:', this.plants.size);
  console.log('Projectiles:', this.projectileLayer?.countActive());
}
```

---

## 性能优化

### 对象池使用

```typescript
// 从对象池获取对象
const projectile = this.projectilePool.get();
projectile.reset(x, y, damage);

// 归还对象到池
this.projectilePool.return(projectile);
```

### 事件优化

```typescript
// 避免频繁触发事件
if (time - this.lastEventTime > 100) {  // 限制频率
  this.game.events.emit('my:event', data);
  this.lastEventTime = time;
}

// 记得清理事件监听器
scene.events.off('my:event');
```

### 渲染优化

```typescript
// 只在屏幕内更新对象
if (this.x > camera.scrollX - 100 && this.x < camera.scrollX + camera.width + 100) {
  // 更新逻辑
}

// 使用 cull 功能
this.plantLayer?.setCullBounds(camera);
```

---

## 常见问题

### Q: 修改代码后没有热更新？

A: 检查 Vite 开发服务器是否正常运行，尝试刷新页面或重启 `npm run dev`。

### Q: TypeScript 编译错误？

A: 运行 `npm run type-check` 查看详细错误信息，确保所有类型定义正确。

### Q: 游戏运行时白屏？

A: 检查浏览器控制台是否有错误日志，常见原因：
- 资源加载失败
- JavaScript 错误
- Phaser 初始化失败

### Q: 如何添加调试日志？

A: 使用 ErrorHandler 或条件日志：

```typescript
import { errorHandler } from '@/game/utils/ErrorHandler';

// 在开发模式下记录日志
if (import.meta.env.DEV) {
  console.log('[Debug]', message, data);
}

// 或使用错误处理器
errorHandler.handleError(new Error('Debug info'), 'context');
```

---

## 更多资源

- [Phaser 3 文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 示例](https://labs.phaser.io/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 指南](https://vitejs.dev/guide/)
