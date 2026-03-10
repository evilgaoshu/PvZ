# 🌻 Plants vs Zombies Web 🧟

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.70-orange.svg)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

一个基于 Web 技术的植物大战僵尸游戏实现，使用 TypeScript + Phaser 3 构建。

![Game Screenshot](./docs/screenshot.png)

## ✨ 特性

- 🎮 经典塔防玩法，种植植物抵御僵尸进攻
- 🌱 多种植物：向日葵、豌豆射手、坚果墙、樱桃炸弹等
- 🧟 多种僵尸：普通僵尸、路障僵尸、铁桶僵尸、撑杆跳僵尸、读报僵尸等
- ☀️ 完整的阳光经济系统
- 🌊 波次系统，体验紧张刺激的防守战斗
- 🎯 关卡系统，挑战不同难度的关卡
- 🔊 **完整的音效与背景音乐系统**（支持程序化音频生成）
- 📱 响应式设计，支持不同屏幕尺寸

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/pvz-web.git
cd pvz-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

## 🎮 游戏玩法

### 基础操作

| 操作 | 说明 |
|------|------|
| 点击阳光 | 收集阳光资源 |
| 点击植物卡片 | 选择要种植的植物 |
| 点击草地 | 种植选中的植物 |
| 点击铲子 | 移除已种植的植物 |

### 游戏流程

1. **准备阶段**: 收集阳光，种植向日葵等生产型植物
2. **防守阶段**: 种植攻击型植物抵御僵尸进攻
3. **波次进攻**: 应对多波僵尸的进攻
4. **胜利条件**: 成功防守所有波次

### 植物图鉴

| 植物 | 阳光成本 | 说明 |
|------|----------|------|
| 🌻 向日葵 | 50 | 生产额外阳光 |
| 🫛 豌豆射手 | 100 | 发射豌豆攻击僵尸 |
| 🥜 坚果墙 | 50 | 阻挡僵尸前进的坚固墙壁 |
| 🍒 樱桃炸弹 | 150 | 爆炸并对范围内僵尸造成巨大伤害 |
| ❄️ 寒冰射手 | 175 | 发射冰冻豌豆，减缓僵尸速度 |
| 🔫 双发射手 | 200 | 一次发射两颗豌豆 |
| 🌸 食人花 | 150 | 能一口吞掉僵尸，但咀嚼时间较长 |
| 🧤 倭瓜 | 50 | 暂未实现 |

### 僵尸图鉴

| 僵尸 | 生命值 | 特点 |
|------|--------|------|
| 🧟 普通僵尸 | 200 | 最常见的僵尸 |
| 🦺 路障僵尸 | 370 | 头戴路障，生命值更高 |
| 🪣 铁桶僵尸 | 1100 | 头戴铁桶，非常坚固 |
| 🏃 撑杆跳僵尸 | 333 | 能跳过第一个植物 |
| 📰 读报僵尸 | 333 | 报纸被打掉后进入狂暴状态 |
| 🚪 铁栅门僵尸 | 1670 | 手持铁栅门，双重防护 |

## 📁 项目结构

```
pvz-web/
├── public/                      # 静态资源
│   └── assets/                  # 游戏资源
│       ├── images/              # 图片资源
│       ├── audio/               # 音频资源
│       │   ├── sfx/             # 音效文件
│       │   └── bgm/             # 背景音乐
│       └── fonts/               # 字体文件
├── src/
│   ├── main.ts                  # 应用入口
│   ├── game/                    # Phaser游戏核心
│   │   ├── Game.ts              # 游戏主类
│   │   ├── config/              # 游戏配置
│   │   │   ├── GameConfig.ts    # 游戏主配置
│   │   │   ├── AudioConfig.ts   # 音频配置
│   │   │   └── plants/          # 植物配置数据
│   │   ├── scenes/              # 游戏场景
│   │   │   ├── BootScene.ts     # 启动场景
│   │   │   ├── MenuScene.ts     # 主菜单
│   │   │   ├── GameScene.ts     # 主游戏场景
│   │   │   ├── PauseScene.ts    # 暂停菜单
│   │   │   └── GameOverScene.ts # 游戏结束
│   │   ├── entities/            # 游戏实体
│   │   │   ├── plants/          # 植物类
│   │   │   ├── zombies/         # 僵尸类
│   │   │   └── projectiles/     # 投射物类
│   │   ├── systems/             # 游戏系统
│   │   │   ├── GridSystem.ts    # 网格系统
│   │   │   ├── EconomySystem.ts # 经济系统
│   │   │   ├── WaveSystem.ts    # 波次系统
│   │   │   └── CombatSystem.ts  # 战斗系统
│   │   ├── managers/            # 管理器
│   │   │   ├── GameStateManager.ts
│   │   │   ├── AudioManager.ts  # 音频管理器
│   │   │   └── AchievementManager.ts
│   │   └── utils/               # 游戏工具
│   │       ├── ObjectPool.ts    # 对象池
│   │       ├── PerformanceMonitor.ts
│   │       ├── MemoryProfiler.ts
│   │       ├── ProceduralAudio.ts  # 程序化音频
│   │       └── ErrorHandler.ts
│   ├── data/                    # 数据配置
│   ├── ui/                      # UI组件
│   ├── stores/                  # 状态管理
│   ├── utils/                   # 工具函数
│   └── types/                   # TypeScript类型
├── tests/                       # 测试文件
├── docs/                        # 项目文档
├── index.html                   # HTML入口
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript配置
└── vite.config.ts               # Vite配置
```

## 🛠️ 技术栈

- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的JavaScript超集
- **[Phaser 3](https://phaser.io/)** - 强大的2D游戏框架
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具
- **[Zustand](https://github.com/pmndrs/zustand)** - 轻量级状态管理

## 📚 文档

- [架构设计文档](./docs/ARCHITECTURE.md)
- [技术规范文档](./docs/SPEC.md)
- [代码审查报告](./docs/CODE_REVIEW.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [API 文档](./docs/API.md)

## 🎵 音频系统

游戏包含完整的音频系统：

- **背景音乐**: 菜单、游戏白天、胜利、失败等场景音乐
- **音效**: 种植、射击、爆炸、僵尸呻吟、阳光收集等
- **程序化音频**: 当音频文件不存在时，使用Web Audio API生成合成音效

### 音频配置

音频资源路径配置在 `src/game/config/AudioConfig.ts` 中，可通过替换 `public/assets/audio/` 目录下的文件来使用自定义音效。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

请确保你的代码符合我们的 [编码规范](./docs/SPEC.md#编码规范)。

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

## 🙏 致谢

- 原版游戏灵感来自 PopCap Games 的《植物大战僵尸》
- 游戏资源仅供学习和非商业用途

## 📧 联系我们

如有问题或建议，欢迎通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/yourusername/pvz-web/issues)
- 发送邮件至: your.email@example.com

---

<p align="center">
  Made with ❤️ and 🌻
</p>
