# 🔍 PvZ Web 代码审查报告

> 审查范围：全部 43 个 TypeScript 源文件，重点覆盖游戏核心逻辑、安全性和资源管理。

---

## 🚨 严重 Bug（影响游戏正常运行）

### 1. 波次完成检测永远为 `false`，游戏无法自然推进

[WaveSystem.ts:L184-188](file:///Users/yue/Repo/google/PvZ/src/game/systems/WaveSystem.ts#L184-L188)

```typescript
private checkWaveComplete(): boolean {
    // 简化处理：检查一定时间后波次自动结束
    return false; // 由外部系统通知
}
```

`checkWaveComplete` 永远返回 `false`，且**没有任何外部系统调用 `onWaveComplete()`**，导致波次永远不会完成，后续波次无法开始。

**修复建议**：跟踪每波生成的僵尸数量和被消灭的僵尸数量，当所有僵尸生成完毕且全部被消灭后返回 `true`：

```typescript
private waveZombieCount: number = 0;
private waveZombieKilled: number = 0;
private waveSpawnComplete: boolean = false;

// 在 spawnWaveZombies 中统计总数，在 ZOMBIE_DIED 事件中递增 killed
private checkWaveComplete(): boolean {
    return this.waveSpawnComplete && this.waveZombieKilled >= this.waveZombieCount;
}
```

---

### 2. `CombatSystem` 与 `GameScene` 存在重复且冲突的投射物 / 伤害系统

两个地方同时监听了 `PROJECTILE_FIRED` 事件并各自创建投射物：

| 位置 | 行为 |
|------|------|
| [GameScene.ts:L360-368](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L360-L368) | 创建 `Pea`/`SnowPea` 实例，添加到 `projectileLayer`，设置与 `zombieLayer` 的碰撞 |
| [CombatSystem.ts:L69-78](file:///Users/yue/Repo/google/PvZ/src/game/systems/CombatSystem.ts#L69-L78) | 创建 `physics.add.image`，添加到 `projectileGroup`，设置独立的碰撞 |

这导致：
- **每次射击创建两个投射物**，造成双倍伤害
- `CombatSystem` 使用 `getData('health')` 来管理僵尸血量，而 `Zombie` 类使用 `currentHealth` 属性——两套血量系统彼此不同步
- 同一个僵尸可能被 `killZombie()` 和 `Zombie.die()` 分别销毁，触发双重 `ZOMBIE_DIED` 事件

**修复建议**：移除 `CombatSystem` 中的 `spawnProjectile` 方法和 `PROJECTILE_FIRED` 监听器，将所有投射物创建逻辑集中在 `GameScene.fireProjectile()` 中。`CombatSystem` 应专注于伤害计算辅助逻辑，而非独立创建游戏对象。

---

### 3. 事件监听器泄漏（最关键的内存泄漏来源）

`GameScene.setupEventListeners()` 使用 `this.game.events.on()` 注册了 ~7 个全局事件监听器（[L348-398](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L348-L398)），但 `onShutdown()` 中**未移除任何 `game.events` 上的监听器**（[L938-948](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L938-L948)）：

```typescript
protected onShutdown(): void {
    this.gridSystem?.destroy();
    this.economySystem?.destroy();
    this.waveSystem?.destroy();
    this.combatSystem?.destroy();
    this.plants.clear();
    this.zombies = [];
    // ❌ 未移除 game.events 上的监听器
}
```

类似问题还出现在：
- [CombatSystem.ts:L67-88](file:///Users/yue/Repo/google/PvZ/src/game/systems/CombatSystem.ts#L67-L88) — `destroy()` 不清理事件
- [EconomySystem.ts](file:///Users/yue/Repo/google/PvZ/src/game/systems/EconomySystem.ts) — `destroy()` 不清理 `game.events`
- [GameScene.ts:L284](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L284) — `createLawnMower` 中每次创建割草机都注册 `zombie:reached_house` 事件，从未移除
- [GameScene.ts:L587](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L587) — `SUN_CHANGED` 监听器从未移除
- [GameScene.ts:L699](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L699) — `WAVE_STARTED` 监听器从未移除

**后果**：场景重启后，旧事件监听器仍然存在且会触发，导致逻辑混乱、内存泄漏，游戏越玩越卡。

**修复建议**：
1. 保存所有事件监听器的引用，在 `onShutdown()` 中统一 `game.events.off()`
2. 或者使用 `scene.events.on()` 代替 `game.events.on()`——Phaser 的场景事件会在场景销毁时自动清理

---

### 4. `BaseScene.init()` 中 `isInitialized` 导致场景重启时跳过初始化

[BaseScene.ts:L32-36](file:///Users/yue/Repo/google/PvZ/src/game/scenes/BaseScene.ts#L32-L36)：

```typescript
init(data?: any): void {
    if (this.isInitialized) return; // ← 场景重启后不会重新初始化
    this.isInitialized = true;
    this.onInit();
}
```

Phaser 重用场景实例，`scene.start('GameScene')` 会调用 `init()`。但由于 `isInitialized` 在第一次调用后就为 `true`，重新开始游戏时 `onInit()` 不会再执行。

**修复建议**：在 `shutdown()` 中重置 `isInitialized = false`，或移除此保护逻辑。

---

### 5. `plantConfigs['1-1']` 被当作 `LevelConfig` 但实际是 `PlantConfig`

[GameScene.ts:L892-893](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L892-L893)：

```typescript
const levelConfig = plantConfigs['1-1']; // ❌ 这是植物配置，不是关卡配置
this.waveSystem.loadLevel(levelConfig as any); // 用 `as any` 掩盖了类型错误
```

`plantConfigs` 中不存在 `'1-1'` 键（键是 `sunflower`、`peashooter` 等），应该使用 `levelConfigs['1-1']`（定义在同一个文件中但未导出到 `GameScene`）。

**修复建议**：
```typescript
import { levelConfigs } from '@data/plants/plantConfigs';
// ...
const levelConfig = levelConfigs['1-1'];
this.waveSystem.loadLevel(levelConfig);
```

---

### 6. 食人花吞食僵尸后未实际销毁僵尸

[Chomper.ts:L79-85](file:///Users/yue/Repo/google/PvZ/src/game/entities/plants/Chomper.ts#L79-L85)：

```typescript
const zombie = this.attackTarget;
this.scene.game.events.emit(GameEvents.ZOMBIE_DIED, {
    zombie: zombie,
    instantKill: true,
    source: this
});
```

仅发射了 `ZOMBIE_DIED` 事件，但**没有调用 `zombie.takeDamage(9999)` 或 `zombie.destroy()`**。僵尸并未实际死亡，仍然存活并继续前进。

**修复建议**：直接调用 `(zombie as any).takeDamage(9999, 'instakill')` 来确保僵尸真正被消灭。

---

### 7. `BootScene` 的 `AudioManager` 在 `onShutdown` 中被销毁

[BootScene.ts:L193-198](file:///Users/yue/Repo/google/PvZ/src/game/scenes/BootScene.ts#L193-L198)：

`AudioManager` 被注册到 `game.registry`，供全局共享使用。但 `BootScene.onShutdown()` 调用了 `this.audioManager?.destroy()`，清理了所有音效和 BGM 引用。后续场景通过 `registry.get('audioManager')` 获取到的对象已经被销毁。

**修复建议**：`BootScene.onShutdown()` 中不应销毁 `audioManager`，其生命周期应由全局管理。

---

## 🔐 安全漏洞

### 8. XSS 漏洞：`ErrorHandler.showErrorDialog()` 使用 `innerHTML` 注入未转义的错误信息

[ErrorHandler.ts:L141-143](file:///Users/yue/Repo/google/PvZ/src/game/utils/ErrorHandler.ts#L141-L143)：

```typescript
errorDiv.innerHTML = `
    <h3>⚠️ Error: ${context}</h3>
    <pre>${error.message}</pre>  // ← 未转义，可被注入恶意 HTML/JS
`;
```

如果 `error.message` 或 `context` 包含恶意内容（例如 `<img src=x onerror=alert(1)>`），会导致 XSS 攻击。

**修复建议**：使用 `textContent` 替代 `innerHTML`，或对内容进行 HTML 转义：

```typescript
const title = document.createElement('h3');
title.textContent = `⚠️ Error: ${context}`;
const pre = document.createElement('pre');
pre.textContent = error.message;
errorDiv.appendChild(title);
errorDiv.appendChild(pre);
```

---

### 9. 全局对象暴露导致作弊可能

[main.ts:L54](file:///Users/yue/Repo/google/PvZ/src/main.ts#L54)：

```typescript
(window as any).game = game;
```

在生产环境中暴露游戏实例到 `window`，任何人可以通过浏览器控制台直接操作游戏状态（如无限加阳光 `game.getPhaserGame().registry.get('audioManager')` 或修改游戏内部状态）。

**修复建议**：仅在开发/调试模式下暴露：

```typescript
if (import.meta.env.DEV) {
    (window as any).__debugGame = game;
}
```

---

### 10. `EconomySystem.addSun()` 的 `source: 'cheat'` 默认值

[EconomySystem.ts:L244](file:///Users/yue/Repo/google/PvZ/src/game/systems/EconomySystem.ts#L244)：

```typescript
public addSun(amount: number, source: SunSource = 'cheat'): void {
```

`addSun` 是 `public` 方法，默认来源标记为 `'cheat'`。如果将来需要区分合法阳光与作弊阳光，此设计会造成混淆。

**修复建议**：将默认值改为合理的来源（如 `'falling'`），或移除默认值使调用者必须显式指定。

---

## ⚠️ 重要设计缺陷

### 11. 撑杆跳僵尸跳跃检测未实现

[PoleVaultingZombie.ts:L46-49](file:///Users/yue/Repo/google/PvZ/src/game/entities/zombies/PoleVaultingZombie.ts#L46-L49)：

```typescript
protected checkSpecialAbility(): void {
    if (this.hasVaulted || !this.usedSpecialAbility) {
        this.checkForPlantToVault();
    }
}
```

逻辑条件错误：`!this.usedSpecialAbility` 意味着"还没用过特殊能力"，但 `this.hasVaulted` 为 `true` 时条件也满足（`||`），导致已经跳过的僵尸仍然尝试检测跳跃。

同时，`zombie:check_vault` 事件**没有任何地方监听**，callback 永远不会被调用，撑杆跳能力完全无效。

**修复建议**：
1. 条件改为 `if (!this.hasVaulted && !this.usedSpecialAbility)`
2. 在 `GameScene` 中添加 `zombie:check_vault` 的监听逻辑

---

### 12. 僵尸到达房屋后不触发游戏失败

[Zombie.ts:L122-125](file:///Users/yue/Repo/google/PvZ/src/game/entities/zombies/Zombie.ts#L122-L125)：

```typescript
if (this.x < 180) {
    this.scene.game.events.emit('zombie:reached_house', this);
    return; // ← 仅触发事件并 return，僵尸不会被停止或销毁
}
```

触发 `zombie:reached_house` 后，僵尸继续存在并继续向左移动（因为只是 `return` 跳过了当前帧的逻辑，下一帧仍会移动）。割草机逻辑仅在第一次触发时生效，如果割草机已消耗，没有任何阻止僵尸的逻辑，也**不会触发 `gameOver(false)`**。

**修复建议**：当所有割草机用完且僵尸到达房屋位置时，调用 `gameOver(false)`。

---

### 13. 碰撞检测每次生成僵尸都重复注册

[GameScene.ts:L515-522](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L515-L522)：

```typescript
// 每次 spawnZombie 都会调用
this.physics.add.overlap(zombie, this.plantLayer!, ...);
```

每生成一个僵尸就注册一个新的碰撞检测器。如果一局生成 50 个僵尸，就会有 50 个碰撞规则。加上同样的问题在 `fireProjectile()` 中（[L456-463](file:///Users/yue/Repo/google/PvZ/src/game/scenes/GameScene.ts#L456-L463)），碰撞规则会不断累积。

**修复建议**：在 `initializeSystems()` 中注册一次组级别的碰撞：

```typescript
this.physics.add.overlap(this.zombieLayer!, this.plantLayer!, callback);
this.physics.add.overlap(this.projectileLayer!, this.zombieLayer!, callback);
```

---

### 14. `Zombie.ts` 中 `Plant` 类的循环导入

[Zombie.ts:L527](file:///Users/yue/Repo/google/PvZ/src/game/entities/zombies/Zombie.ts#L527)：

```typescript
import { Plant } from '../plants/Plant'; // 在文件末尾导入
```

`Plant` 在文件末尾导入以避免循环依赖，但 `attackTarget` 声明为 `Plant | null`（[L30](file:///Users/yue/Repo/google/PvZ/src/game/entities/zombies/Zombie.ts#L30)），这依赖于 TypeScript 的 hoisting 行为。将来如果文件结构调整，这种模式容易引入不可预测的错误。

**修复建议**：提取 `IAttackable` 接口，让 `Plant` 和 `Zombie` 都依赖接口而非具体类。

---

### 15. `attackInterval` 单位不一致

- `plantConfigs.peashooter.attackInterval = 1500`（代码中注释说是毫秒）
- `Plant.attack()` 中使用 `(this.config.attackInterval || 1.5) * 1000`（当作秒来用，再乘以 1000）

如果配置值为 `1500`（毫秒），`1500 * 1000 = 1500000ms ≈ 25分钟` 才攻击一次！

类似地，`Chomper.startChewing()` 中 `(this.config.attackInterval || 42) * 1000`：配置值 `42000 * 1000 = 42000秒`。

**修复建议**：统一约定配置中的时间单位（建议统一为毫秒），并移除代码中的 `* 1000`。

---

### 16. `zombieConfigs` 中 `attackInterval` 单位也不一致

`zombieConfigs.normal.attackInterval = 1000`，在 `Zombie.updateAttack()` 中直接使用 `this.config.attackInterval` 与 `time`（Phaser 的 `time` 参数是毫秒值）比较，这里的逻辑是正确的。

但这意味着植物和僵尸对 `attackInterval` 的解释方式不同——**植物把它当作秒再乘 1000，僵尸直接当毫秒用**。这种不一致会让维护者困惑。

---

## 🐛 一般 Bug

### 17. `Pea` 构造函数中每次创建都重新生成纹理

[Projectile.ts:L160-177](file:///Users/yue/Repo/google/PvZ/src/game/entities/projectiles/Projectile.ts#L160-L177)：

```typescript
private createPeaGraphics(color: number): void {
    const graphics = this.scene.add.graphics();
    graphics.generateTexture('pea', 20, 20); // 反复覆盖同名纹理
    graphics.destroy();
    this.setTexture('pea');
}
```

同时 `GameScene.createProjectileTextures()` 也生成 `'pea'` 和 `'snow_pea'` 纹理。每个投射物实例创建时都重新生成纹理，浪费性能。

**修复建议**：纹理生成只在 `BootScene` 或 `GameScene.create()` 中执行一次，投射物构造函数直接使用已存在的纹理。

---

### 18. `CombatSystem.projectiles` 数组从不清理已销毁的对象

[CombatSystem.ts:L226](file:///Users/yue/Repo/google/PvZ/src/game/systems/CombatSystem.ts#L226)：

```typescript
this.projectiles.push(projectile);
```

投射物被销毁后，引用仍存留在 `projectiles` 数组中。`destroy()` 中尝试对已销毁对象调用 `destroy()` 会导致错误。

**修复建议**：使用 `Phaser.GameObjects.Group` 自动管理生命周期，移除手动数组。

---

### 19. `EconomySystem` 中阳光被多次收集

阳光的 `pointerdown` 事件注册在 `hitArea` 上，但收集动画完成前阳光仍然可交互，快速双击可以多次触发收集，获得双倍阳光。

**修复建议**：收集时立即移除交互或设置标志位防止重复收集：

```typescript
hitArea.on('pointerdown', () => {
    hitArea.disableInteractive(); // 防止重复点击
    this.collectSun(container, amount, source);
});
```

---

### 20. `CombatSystem.spawnProjectile` 中边界检测的 `update` 事件泄漏

[CombatSystem.ts:L229-235](file:///Users/yue/Repo/google/PvZ/src/game/systems/CombatSystem.ts#L229-L235)：

```typescript
const checkBounds = () => {
    if (projectile.x > 900) {
        projectile.destroy();
        this.scene.events.off('update', checkBounds);
    }
};
this.scene.events.on('update', checkBounds);
```

如果投射物因碰撞被提前销毁，`checkBounds` 仍注册在 `update` 事件上，每帧执行且访问已销毁对象。

**修复建议**：在碰撞回调中也移除 `checkBounds`，或使用 `Phaser.GameObjects.Group` 的 `runChildUpdate` 功能。

---

## 📝 代码质量与最佳实践

| 问题 | 位置 | 建议 |
|------|------|------|
| 大量 `console.log` 留在生产代码中 | 几乎所有文件 | 使用日志级别控制器或在 build 时移除 |
| 多处 `as any` 类型断言 | `GameScene.ts:L151, L893`，`Zombie.ts:L30` 等 | 使用正确的类型定义替代 |
| `ErrorHandler` 使用全局 `window.addEventListener` 但不可移除 | [ErrorHandler.ts:L29-36](file:///Users/yue/Repo/google/PvZ/src/game/utils/ErrorHandler.ts#L29-L36) | 保存 listener 引用，提供 `removeGlobalListeners()` |
| `ProceduralAudio` 模块同时导出类和单例 | [ProceduralAudio.ts:L193](file:///Users/yue/Repo/google/PvZ/src/game/utils/ProceduralAudio.ts#L193) | `AudioManager` 已创建独立实例，全局单例多余 |
| `sceneConfig` 在 `GameConfig.ts` 中导出但从未使用 | `main.ts:L2` 导入了但未使用 | 移除无用导出和导入 |
| `CombatSystem` 中 `zombies` 和 `plants` 数组声明但从未使用 | [CombatSystem.ts:L15-18](file:///Users/yue/Repo/google/PvZ/src/game/systems/CombatSystem.ts#L15-L18) | 移除死代码 |
| `GridSystem.zombiesInRow` 注册/注销方法从未被调用 | [GridSystem.ts:L182-204](file:///Users/yue/Repo/google/PvZ/src/game/systems/GridSystem.ts#L182-L204) | 在 `spawnZombie` / 僵尸死亡时调用，或移除 |

---

## 📊 问题汇总

| 严重级别 | 数量 | 描述 |
|----------|------|------|
| 🚨 严重 Bug | 7 | 游戏无法正常推进、双倍伤害、内存泄漏、初始化失败等 |
| 🔐 安全漏洞 | 3 | XSS、全局对象暴露、经济系统作弊 |
| ⚠️ 重要缺陷 | 6 | 功能未实现、逻辑错误、单位不一致等 |
| 🐛 一般 Bug | 4 | 纹理重复生成、数组泄漏、重复收集等 |
| 📝 代码质量 | 7 | `console.log`、`as any`、死代码等 |

---

## 🏗️ 推荐修复优先级

1. **P0（立即修复）**：#5 `plantConfigs['1-1']` 错误引用、#15 `attackInterval` 单位错误 — 游戏无法正常运行
2. **P0（立即修复）**：#1 波次检测永远 false、#2 双重投射物系统 — 核心玩法严重受损
3. **P1（尽快修复）**：#3 事件泄漏、#4 `isInitialized` 阻止重启、#7 AudioManager 被提前销毁
4. **P1（尽快修复）**：#6 食人花不杀僵尸、#12 无 Game Over 判定、#8 XSS
5. **P2（计划修复）**：#9 全局对象、#11 撑杆跳、#13 碰撞注册、#19 重复收集
6. **P3（持续改进）**：代码质量与最佳实践相关
