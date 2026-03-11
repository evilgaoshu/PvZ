import { describe, it, expect, vi, beforeEach } from 'vitest';

// 彻底模拟 Phaser，防止其内部初始化逻辑崩溃
vi.mock('phaser', () => {
  return {
    default: {
      GameObjects: {
        Sprite: class {},
        GameObject: class {}
      },
      Math: {
        Between: vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
        FloatBetween: vi.fn((min, max) => Math.random() * (max - min) + min)
      }
    }
  };
});

import { VisualEffects } from './VisualEffects';

describe('VisualEffects', () => {
  let mockScene: any;
  let mockSprite: any;

  beforeEach(() => {
    mockScene = {
      cameras: {
        main: {
          shake: vi.fn()
        }
      },
      add: {
        text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          destroy: vi.fn()
        })),
        circle: vi.fn(() => ({
          destroy: vi.fn()
        })),
        ellipse: vi.fn(() => ({
          setDepth: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          active: true,
          x: 0,
          y: 0,
          displayHeight: 100
        }))
      },
      tweens: {
        add: vi.fn()
      },
      time: {
        delayedCall: vi.fn((delay, callback) => callback())
      },
      events: {
        on: vi.fn()
      }
    };

    mockSprite = {
      scene: mockScene,
      setTint: vi.fn(),
      clearTint: vi.fn(),
      active: true,
      scale: 1,
      x: 100,
      y: 100,
      displayHeight: 64,
      depth: 10
    };
  });

  it('should shake camera', () => {
    VisualEffects.shakeCamera(mockScene, 0.05, 200);
    expect(mockScene.cameras.main.shake).toHaveBeenCalledWith(200, 0.05);
  });

  it('should flash sprite', () => {
    VisualEffects.flashSprite(mockSprite, 0xff0000, 100);
    expect(mockSprite.setTint).toHaveBeenCalledWith(0xff0000);
    expect(mockScene.time.delayedCall).toHaveBeenCalled();
    expect(mockSprite.clearTint).toHaveBeenCalled();
  });

  it('should create float text', () => {
    VisualEffects.floatText(mockScene, 100, 100, 'Test');
    expect(mockScene.add.text).toHaveBeenCalled();
    expect(mockScene.tweens.add).toHaveBeenCalled();
  });

  it('should bounce scale', () => {
    VisualEffects.bounceScale(mockSprite, 1.2, 200);
    expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
      targets: mockSprite,
      scale: 1.2
    }));
  });
});
