# 🌻 Plants vs Zombies Web 🧟

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.70-orange.svg)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

一个基于 Web 技术的植物大战僵尸游戏实现，使用 TypeScript + Phaser 3 构建。

🎮 **[在线试玩](https://evilgaoshu.github.io/PvZ/)** | 📖 **[中文文档](#-文档)** | 🐛 **[问题反馈](../../issues)**

![Game Screenshot](./docs/screenshot.png)

---

## ✨ 特性

- 🎮 **经典塔防玩法** - 种植植物抵御僵尸进攻
- 🌱 **多种植物** - 向日葵、豌豆射手、坚果墙、樱桃炸弹、寒冰射手、双发射手、食人花等
- 🧟 **多种僵尸** - 普通僵尸、路障僵尸、铁桶僵尸、撑杆跳僵尸、读报僵尸、铁栅门僵尸等
- ☀️ **完整的经济系统** - 自然掉落 + 植物生产双轨阳光收集
- 🌊 **波次系统** - 多波次进攻，难度递增
- 🎯 **割草机防线** - 最后一道防线，用完即游戏结束
- 🔊 **完整音效系统** - 背景音乐 + 音效 + 程序化音频回退
- 🛡️ **类型安全** - TypeScript 严格模式 + 完整类型定义
- ♻️ **内存安全** - 完善的事件清理和对象销毁
- 📱 **响应式设计** - 自适应不同屏幕尺寸

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| 浏览器 | Chrome 90+, Firefox 90+, Safari 14+ |

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/evilgaoshu/PvZ.git
cd PvZ

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问 http://localhost:5173
```

### 构建与部署

```bash
# 开发构建（包含 Source Map）
npm run build:dev

# 生产构建（优化压缩）
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check
```

---

## 🎮 游戏指南

### 基础操作

| 操作 | 说明 |
|------|------|
| ☀️ 点击阳光 | 收集阳光资源 |
| 🃏 点击植物卡片 | 选择要种植的植物 |
| 🌱 点击草地 | 种植选中的植物 |
| ⏸️ ESC 键 | 暂停/继续游戏 |

### 游戏流程

1. **准备阶段**: 收集阳光，优先种植向日葵建立经济
2. **防守阶段**: 种植豌豆射手等攻击植物抵御僵尸
3. **波次进攻**: 应对多波僵尸进攻，难度逐渐提升
4. **胜利条件**: 成功防守所有波次
5. **失败条件**: 僵尸突破防线进入房屋

### 植物图鉴

| 植物 | 阳光 | 冷却 | 说明 |
|------|------|------|------|
| 🌻 向日葵 | 50 | 7.5s | 定期产生额外阳光 |
| 🫛 豌豆射手 | 100 | 7.5s | 发射豌豆攻击僵尸 |
| 🥜 坚果墙 | 50 | 30s | 高生命值，阻挡僵尸 |
| 🍒 樱桃炸弹 | 150 | 50s | 爆炸对3x3范围造成伤害 |
| ❄️ 寒冰射手 | 175 | 7.5s | 冰冻豌豆，减缓僵尸50%速度 |
| 🔫 双发射手 | 200 | 7.5s | 一次发射两颗豌豆 |
| 🌸 食人花 | 150 | 7.5s | 一口吞掉僵尸，咀嚼42秒 |

### 僵尸图鉴

| 僵尸 | 生命 | 速度 | 特点 |
|------|------|------|------|
| 🧟 普通僵尸 | 200 | 慢 | 最常见的敌人 |
| 🦺 路障僵尸 | 370 | 慢 | 路障提供额外防护 |
| 🪣 铁桶僵尸 | 1100 | 慢 | 铁桶极其坚固 |
| 🏃 撑杆跳僵尸 | 333 | 快 | 跳过遇到的第一个植物 |
| 📰 读报僵尸 | 333 | 慢/快 | 报纸掉落后狂暴加速 |
| 🚪 铁栅门僵尸 | 1670 | 慢 | 铁栅门提供双重防护 |

---

## 📁 项目结构

```
pvz-web/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── game/
│   │   ├── scenes/                  # 游戏场景
│   │   │   ├── BootScene.ts         # 启动场景（资源加载）
│   │   │   ├── MenuScene.ts         # 主菜单
│   │   │   ├── GameScene.ts         # 主游戏场景
│   │   │   ├── PauseScene.ts        # 暂停菜单
│   │   │   └── GameOverScene.ts     # 游戏结束
│   │   ├── entities/                # 游戏实体
│   │   │   ├── plants/              # 植物类（Plant 基类 + 子类）
│   │   │   ├── zombies/             # 僵尸类（Zombie 基类 + 子类）
│   │   │   └── projectiles/         # 投射物（豌豆、冰冻豌豆）
│   │   ├── systems/                 # 游戏系统
│   │   │   ├── GridSystem.ts        # 网格系统
│   │   │   ├── EconomySystem.ts     # 阳光经济系统
│   │   │   ├── WaveSystem.ts        # 波次系统
│   │   │   ├── CombatSystem.ts      # 战斗系统
│   │   │   └── InputSystem.ts       # 输入系统
│   │   ├── managers/                # 管理器
│   │   │   ├── AudioManager.ts      # 音频管理器
│   │   │   └── AchievementManager.ts
│   │   ├── config/                  # 配置文件
│   │   │   ├── GameConfig.ts        # 游戏配置
│   │   │   ├── AudioConfig.ts       # 音频配置
│   │   │   └── plants/              # 植物/僵尸数据
│   │   └── utils/                   # 工具类
│   │       ├── ErrorHandler.ts      # 错误处理
│   │       ├── ObjectPool.ts        # 对象池
│   │       └── ProceduralAudio.ts   # 程序化音频
│   └── types/                       # TypeScript 类型定义
├── docs/                            # 项目文档
│   ├── ARCHITECTURE.md              # 架构设计文档
│   ├── SPEC.md                      # 技术规范
│   ├── CODE_REVIEW.md               # 代码审查报告
│   └── DEVELOPMENT.md               # 开发指南
├── tests/                           # 测试文件
├── public/                          # 静态资源
├── index.html                       # HTML入口
├── package.json                     # 项目配置
├── tsconfig.json                    # TypeScript配置
└── vite.config.ts                   # Vite配置
```

---

## 🛠️ 技术栈

- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript 超集
- **[Phaser 3](https://phaser.io/)** - 强大的 2D 游戏框架
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具
- **[Vitest](https://vitest.dev/)** - 单元测试框架

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 系统架构设计、模块关系图 |
| [SPEC.md](./docs/SPEC.md) | 技术规范、编码规范、API 说明 |
| [CODE_REVIEW.md](./docs/CODE_REVIEW.md) | 代码审查报告、已知问题清单 |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | 开发指南、调试技巧 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录 |

---

## 🎵 音频系统

游戏包含完整的音频系统：

- **背景音乐**: 菜单、游戏白天、胜利、失败等场景音乐
- **音效**: 种植、射击、爆炸、僵尸呻吟、阳光收集等
- **程序化音频**: 当音频文件不存在时，使用 Web Audio API 生成合成音效

### 自定义音频

音频配置位于 `src/game/config/AudioConfig.ts`，可通过替换 `public/assets/audio/` 目录下的文件来使用自定义音效。

---

## 🐛 常见问题

### Q: 构建成功后无法直接打开 HTML 文件？

A: 由于浏览器的 CORS 策略，需要通过 HTTP 服务器访问：

```bash
# 方法1：使用 Vite 预览
npm run preview

# 方法2：使用 Python 简易服务器
cd dist && python3 -m http.server 8080

# 方法3：使用 Node.js serve
npx serve dist
```

### Q: 如何开启调试模式？

A: 在开发环境下，游戏实例会自动暴露到 `window.__debugGame`，可在浏览器控制台中访问。

### Q: 如何调整游戏难度？

A: 修改 `src/game/config/plants/plantConfigs.ts` 中的波次配置。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

请确保代码符合 [编码规范](./docs/SPEC.md#编码规范)，并通过类型检查和测试。

### 开发工作流

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 运行测试
npm run test

# 代码格式化
npm run format
```

---

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

---

## 🙏 致谢

- 原版游戏灵感来自 PopCap Games 的《植物大战僵尸》
- 游戏资源仅供学习和非商业用途

---

<p align="center">
  Made with ❤️ and 🌻
</p>
