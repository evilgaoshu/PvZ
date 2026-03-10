# PvZ Web 开发指南

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构说明

```
src/
├── game/               # Phaser游戏核心代码
│   ├── config/         # 游戏配置
│   ├── scenes/         # 游戏场景
│   ├── systems/        # 游戏系统（网格、经济、波次、战斗）
│   ├── entities/       # 游戏实体（植物、僵尸、投射物）
│   ├── managers/       # 游戏管理器
│   └── components/     # 可复用组件
├── data/               # 数据配置
│   ├── plants/         # 植物配置
│   ├── zombies/        # 僵尸配置
│   └── levels/         # 关卡配置
├── ui/                 # UI组件
├── utils/              # 工具函数
└── types/              # TypeScript类型定义
```

## 添加新植物

1. 在 `src/data/plants/plantConfigs.ts` 中添加配置
2. 在 `src/game/entities/plants/` 创建植物类
3. 在植物工厂中注册

## 添加新僵尸

1. 在 `src/data/plants/plantConfigs.ts` 中添加僵尸配置（移到zombies目录）
2. 在 `src/game/entities/zombies/` 创建僵尸类
3. 在僵尸工厂中注册

## 添加新关卡

1. 在 `src/data/levels/levelConfigs.ts` 中添加关卡配置
2. 指定可用植物和僵尸类型
3. 设计波次配置
