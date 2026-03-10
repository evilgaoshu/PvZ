# 贡献指南

感谢你对 Plants vs Zombies Web 项目的关注！本文档将帮助你了解如何参与项目贡献。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [版本发布](#版本发布)

## 行为准则

- 保持友善和尊重
- 欢迎建设性的批评
- 专注于对社区最有利的事情
- 尊重不同的观点和经验

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](../../issues) 报告，并包含以下信息：

1. **问题描述** - 清晰简洁的问题说明
2. **复现步骤** - 详细的复现步骤
3. **期望行为** - 你期望发生的行为
4. **实际行为** - 实际发生的行为
5. **环境信息** - 操作系统、浏览器版本、Node.js 版本
6. **截图** - 如果适用，添加截图帮助说明问题

### 建议新功能

如果你有新功能建议：

1. 先查看已有的 Issues，避免重复建议
2. 创建新的 Issue，使用 `feature request` 标签
3. 清晰描述功能的目的和使用场景
4. 如果可能，提供实现思路或参考案例

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 开发流程

### 环境准备

```bash
# 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/PvZ.git
cd PvZ

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 开发工作流

```bash
# 1. 创建新分支
git checkout -b feature/my-feature

# 2. 开发并测试你的修改
# ... 编写代码 ...

# 3. 运行类型检查
npm run type-check

# 4. 运行测试
npm run test

# 5. 代码格式化
npm run format

# 6. 提交修改
git add .
git commit -m "feat: add my feature"

# 7. 推送到你的 Fork
git push origin feature/my-feature

# 8. 创建 Pull Request
```

### 分支命名规范

- `feature/*` - 新功能
- `bugfix/*` - Bug 修复
- `docs/*` - 文档更新
- `refactor/*` - 代码重构
- `test/*` - 测试相关
- `chore/*` - 构建/工具相关

## 代码规范

### TypeScript 规范

- 使用 TypeScript 严格模式
- 所有函数和类必须有明确的返回类型
- 避免使用 `any` 类型，如必须使用请添加注释说明
- 使用接口定义数据结构
- 优先使用 `const` 和 `let`，避免使用 `var`

### 代码风格

```typescript
// ✅ 好的示例
interface PlantConfig {
  name: string;
  cost: number;
  health: number;
}

class Peashooter extends Plant {
  private lastAttackTime: number = 0;

  public update(time: number, delta: number): void {
    super.update(time, delta);
    this.checkAttack(time);
  }

  private checkAttack(time: number): boolean {
    if (time - this.lastAttackTime > this.attackInterval) {
      this.fireProjectile();
      return true;
    }
    return false;
  }
}

// ❌ 不好的示例
class Peashooter extends Plant {
  lastAttackTime = 0  // 缺少类型和访问修饰符

  update(time, delta) {  // 缺少返回类型
    super.update(time, delta)
    // 缺少空行
    if(time - this.lastAttackTime > this.attackInterval){  // 缺少空格
      this.fireProjectile()
    }
  }
}
```

### 文件组织

- 每个类/组件一个文件
- 文件名使用 PascalCase（类）或 camelCase（工具函数）
- 测试文件命名为 `*.test.ts`
- 类型定义放在 `src/types/` 目录

### 注释规范

- 使用 JSDoc 注释公共 API
- 复杂逻辑添加行内注释
- 避免无意义的注释

```typescript
/**
 * 植物基类
 * 所有植物类型的抽象基类，提供通用的生命周期和状态管理
 */
export abstract class Plant extends Phaser.GameObjects.Container {
  /**
   * 当前生命值
   * @readonly - 外部只读，通过 takeDamage 修改
   */
  protected currentHealth: number;

  /**
   * 受到伤害
   * @param amount - 伤害数值
   * @param source - 伤害来源，用于统计
   */
  public takeDamage(amount: number, source?: string): void {
    // 计算实际伤害（考虑护甲减免等）
    const actualDamage = this.calculateDamage(amount, source);
    this.currentHealth -= actualDamage;
  }
}
```

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/zh-cn/v1.0.0/) 规范：

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式（不影响代码运行的变动）
- `refactor` - 代码重构
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动

### 示例

```bash
# 新功能
feat(plant): 添加寒冰射手植物

# Bug 修复
fix(combat): 修复投射物双倍伤害问题

# 文档
docs(readme): 更新安装说明

# 重构
refactor(systems): 重构经济系统

# 性能优化
perf(pool): 优化对象池性能

# 测试
test(plant): 添加向日葵单元测试
```

## 版本发布

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- `MAJOR` - 不兼容的 API 修改
- `MINOR` - 向下兼容的功能新增
- `PATCH` - 向下兼容的问题修复

## 获取帮助

如果你有任何问题：

1. 查看 [文档](./docs) 目录
2. 搜索已有的 [Issues](../../issues)
3. 创建新的 Issue 提问

## 许可证

通过贡献代码，你同意将你的贡献以 [Apache License 2.0](../LICENSE) 许可证授权给本项目。
