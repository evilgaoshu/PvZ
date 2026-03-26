Original prompt: 检查一下这个项目，提出具体可落实的优化的建议

2026-03-11
- Reviewed the project structure, core game scene, and runtime systems.
- Verified current status: `npm run type-check`, `npm test`, and `npm run build` pass.
- Found missing toolchain dependencies for declared scripts: `eslint`, `prettier`, and `playwright`.
- Planned implementation order:
  1. Add lint/format/e2e config files and declare missing dependencies.
  2. Stop regenerating projectile textures per shot.
  3. Wire `ProjectilePool` into `GameScene`.
- Implemented the first pass:
  - Added `eslint.config.js`, `.prettierrc.json`, `playwright.config.ts`, and `tests/e2e/smoke.spec.ts`.
  - Declared missing toolchain dependencies in `package.json`.
  - Reused prebuilt projectile textures instead of generating them for each projectile instance.
  - Wired `ProjectilePool` into `GameScene` and added pooled projectile recycling.
- Follow-up needed:
  - Install new dev dependencies so `lint`, `format`, and `test:e2e` can actually run.
  - Keep `tests/e2e` excluded from Vitest.
- Completed validation after installing dependencies:
  - `npm run lint` passes.
  - `npm run format:check` passes.
  - `npm run type-check` passes.
  - `npm test` passes.
  - `npm run build` passes.
  - `npm run test:e2e` passes after installing Playwright Chromium.
- Note:
  - Running the existing `format` script reformatted many existing `src/` files because it is write-mode by design. Added `format:check` to avoid repeating that behavior.
- Reduced the unrelated formatting noise by restoring non-functional file changes.
- Updated `GameScene` event cleanup to track and remove only its own listeners instead of calling broad `off(event)` unbinds.
- Re-verified after the event cleanup:
  - `npm run type-check` passes.
  - `npm run lint` passes.
  - `npm run test:e2e` passes.

2026-03-13
- Comprehensive UI/UX overhaul:
  - Componentized HUD (SunDisplay, PlantSelector, PlantCard).
  - Added interactive SeedPicker flow before level start.
  - Implemented 'Juiciness' with elastic tweens and visual feedback.
- Assets & Rendering:
  - Built an SVG asset generation pipeline for all plants, zombies, and environment.
  - Added Spine 2D skeletal animation support with `IEntityRenderer` abstraction.
  - Improved visual fidelity with shadows, damage flashes, and 'head pop' effects.
- New Gameplay Features:
  - Implemented Pool terrain with Lily Pad platform logic.
  - Added adaptive Zombie behavior (ducky tubes) for water terrain.
  - Enhanced zombie variety (Pole Vaulting trails, Newspaper rage mode).
- Tooling & Infrastructure:
  - Created a visual Level Editor scene with YAML export and level compiler.
  - Added `CREDITS.md` for open-source asset attribution.
- Quality Assurance:
  - Added 20+ unit tests for Grid, Economy, Wave, Combat, and ObjectPool systems.
  - Refactored plant removal logic to handle layered plants (Peashooter on Lily Pad).
  - Decoupled water detection from hardcoded coordinates to grid-based sensing.
- CI/CD Optimization:
  - Enabled unit tests and Lint checks in CI.
  - Switched to `npm ci` and enabled dependency caching.
  - Upgraded project to Node.js 22 and forced actions to use Node.js 24 runtime.

2026-03-26
- Code Quality & Type Safety Refactor:
  - Refactored `StateMachine` and `IState` to use generics, providing type-safe context access.
  - Introduced `IGameScene` interface to eliminate `as any` type assertions across the project.
  - Updated all Plant and Zombie subclasses to the new generic state pattern.
  - Added `readonly` modifiers to configuration interfaces (`PlantConfig`, `ZombieConfig`) for better immutability.
  - Implemented a centralized `Logger` utility to manage and filter console output.
  - Fixed memory leaks by ensuring proper event listener cleanup (`.off()`) in all major game systems.
- Verification:
  - `npm run build` succeeds with zero TypeScript errors.
  - `npm test` passes 31/31 unit tests.
