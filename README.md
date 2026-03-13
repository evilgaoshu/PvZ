# 🌻 Plants vs Zombies Web 🧟

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.70-orange.svg)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![CI Status](https://github.com/evilgaoshu/PvZ/actions/workflows/ci.yml/badge.svg)](https://github.com/evilgaoshu/PvZ/actions/workflows/ci.yml)

一个工业级架构的《植物大战僵尸》网页版实现，基于 TypeScript + Phaser 3 构建。本项目不仅复刻了核心玩法，还提供了一套完整的开发工具链。

🎮 **[在线试玩](https://evilgaoshu.github.io/PvZ/)** | 📖 **[致谢名单](./CREDITS.md)** | 🛠️ **[关卡编辑器](#-可视化工具)**

---

## ✨ 核心特性

- 🎨 **视觉进化 (Visual Fidelity)**
  - **组件化 HUD**：重构了阳光显示、植物选择器和进度条，支持动态反馈。
  - **骨骼动画支持**：深度集成 **Spine 2D**，支持高性能的骨骼动画同步。
  - **资产流水线**：内置 SVG 矢量资产生成脚本，极致清晰且体积小巧。
  - **果汁感 (Juiciness)**：丰富的 Tween 动画、屏幕抖动、粒子喷溅及分级受损反馈。

- 🌊 **深度玩法 (Advanced Gameplay)**
  - **经典地形**：支持草地、**泳池 (Pool)** 地形，实现完整的睡莲 (Lily Pad) 平台逻辑。
  - **选种系统**：关卡开始前可自由搭配 6-8 个植物种子槽位。
  - **多样化敌人**：包含断头逻辑、护甲掉落反馈以及狂暴模式 (Newspaper) 和特殊位移 (Pole Vaulting)。

- 🛠️ **开发者利器 (Developer Tooling)**
  - **可视化编辑器**：内置拖拽式关卡编辑器，支持时间轴控制和 YAML 导出。
  - **数据驱动**：关卡基于 YAML 配置，通过编译器自动生成高性能 JSON 数据。
  - **自动化测试**：30+ 核心单元测试及 E2E 冒烟测试，确保逻辑坚不可摧。

- 🔊 **极致听觉 (Authentic Audio)**
  - **原版音轨**：集成了官方高清 BGM 和 15+ 种经典音效。
  - **程序化后备**：当外部资源加载失败时，自动切换至程序化合成音效。

---

## 🚀 快速开始

### 安装与运行

```bash
# 1. 克隆项目并安装依赖
git clone https://github.com/evilgaoshu/PvZ.git
cd PvZ
npm install

# 2. 生成资产与编译关卡
npm run assets:generate
npm run levels:compile

# 3. 启动开发服务器
npm run dev
```

### 生产指令

| 命令 | 说明 |
|------|------|
| `npm run build` | 生产环境混淆构建 |
| `npm run test` | 运行所有系统单元测试 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run type-check` | 运行静态类型检查 |

---

## 🛠️ 可视化工具

### 关卡编辑器 (Editor)
进入游戏主菜单，点击 **“🛠️ 关卡编辑器”**。
1. **放置僵尸**：选择僵尸类型，在草坪最右侧点击放置。
2. **控制节奏**：拖动下方时间轴，精确设定僵尸出现的秒数。
3. **导出配置**：点击“导出 YAML”，配置将自动复制到剪贴板，可直接存入 `data/levels/`。

---

## 📁 项目结构

```
src/
├── game/
│   ├── entities/        # 实体类 (支持 Sprite/Spine 双模渲染)
│   ├── systems/         # 核心逻辑 (Grid, Economy, Wave, Combat)
│   ├── scenes/          # 游戏场景 (含 EditorScene)
│   ├── config/          # 全局配置与音轨映射
│   └── utils/           # 对象池、性能分析、错误捕获
├── ui/                  # 组件化 UI 系统 (HUD, Menus)
├── data/                # 关卡源码 (YAML) 与 编译结果 (JSON)
└── types/               # 严格的 TypeScript 接口定义
scripts/                 # 资产生成与数据编译器脚本
```

---

## 🛡️ 质量保障

项目采用工业级开发标准，CI/CD 流水线覆盖：
- **Linting**: ESLint 9+ (Flat Config)
- **Unit Testing**: Vitest 模拟 Phaser 物理层
- **E2E Testing**: Playwright 验证场景切换
- **Build**: Vite 5 + 自动依赖缓存

---

## 🙏 致谢与版权

- **版权归属**: 原作 IP 归 PopCap Games & Electronic Arts 所有。
- **引用资源**: 详细名单请参阅 **[CREDITS.md](./CREDITS.md)**。
- **开源协议**: 基于 Apache License 2.0，仅供学习研究，严禁商用。

---

<p align="center">
  Made with ❤️, 🧪 and 🌻
</p>
