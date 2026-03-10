# Changelog

所有项目的显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- 新增音效系统，支持背景音乐和音效
- 新增程序化音频生成（Web Audio API 回退）
- 新增割草机防线机制
- 新增游戏结束场景（胜利/失败）
- 新增暂停功能

### Fixed
- 修复波次完成检测永远为 false 的问题
- 修复 CombatSystem 与 GameScene 重复投射物系统导致的双倍伤害
- 修复事件监听器泄漏导致的内存泄漏
- 修复 BaseScene isInitialized 阻止场景重启问题
- 修复 plantConfigs['1-1'] 错误引用问题
- 修复食人花吞食僵尸后未实际销毁僵尸
- 修复 BootScene AudioManager 被提前销毁
- 修复 XSS 漏洞（ErrorHandler 使用 textContent 替代 innerHTML）
- 修复全局对象暴露（仅在 DEV 模式暴露 __debugGame）
- 修复 EconomySystem.addSun 默认 source 为 'cheat'
- 修复僵尸到达房屋后未触发游戏失败
- 修复碰撞检测重复注册问题
- 修复阳光可被多次收集问题
- 修复撑杆跳僵尸逻辑错误

### Security
- 修复 XSS 安全漏洞
- 限制全局对象暴露范围
- 修复 EconomySystem 默认值导致的作弊可能

## [1.0.0] - 2024-03-XX

### Added
- 项目初始版本
- 基础游戏框架（Phaser 3 + TypeScript + Vite）
- 植物系统（向日葵、豌豆射手、坚果墙、樱桃炸弹、寒冰射手、双发射手、食人花）
- 僵尸系统（普通、路障、铁桶、撑杆跳、读报、铁栅门僵尸）
- 投射物系统（豌豆、冰冻豌豆）
- 网格系统（5行9列草地网格）
- 经济系统（阳光收集与消耗）
- 波次系统（多波次僵尸进攻）
- 音频管理器（BGM 和 SFX 支持）
- 场景系统（启动、菜单、游戏、暂停、结束场景）
- 工厂模式（PlantFactory、ZombieFactory）
- 对象池（性能优化）
- 错误处理系统
- 完整的 TypeScript 类型定义

[Unreleased]: https://github.com/evilgaoshu/PvZ/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/evilgaoshu/PvZ/releases/tag/v1.0.0
