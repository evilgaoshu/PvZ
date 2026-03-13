import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EconomySystem } from './EconomySystem';
import { GameEvents, ECONOMY_CONFIG } from '@/types/index';

// Mock Phaser
vi.mock('phaser', () => {
  return {
    default: {
      Scene: vi.fn(),
      GameObjects: {
        Container: vi.fn(() => ({
          add: vi.fn(),
          setData: vi.fn(),
          setInteractive: vi.fn(),
          on: vi.fn(),
          setPosition: vi.fn(),
          setVisible: vi.fn(),
          setActive: vi.fn(),
        })),
        Graphics: vi.fn(() => ({
          fillStyle: vi.fn().mockReturnThis(),
          fillCircle: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeCircle: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
        })),
        Text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
        })),
        Rectangle: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
        })),
      },
      Time: {
        TimerEvent: vi.fn(),
      },
      Math: {
        Between: vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1) + min)),
      }
    }
  };
});

// Mock ObjectPool
vi.mock('@game/utils/ObjectPool', () => {
  return {
    ObjectPool: vi.fn().mockImplementation(() => ({
      get: vi.fn(() => ({
        setPosition: vi.fn().mockReturnThis(),
        setActive: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        amount: 25,
        sourceType: 'plant',
        isCollected: false
      })),
      recycle: vi.fn()
    }))
  };
});

describe('EconomySystem', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = {
      game: {
        registry: {
          get: vi.fn()
        },
        events: {
          on: vi.fn(),
          off: vi.fn(),
          emit: vi.fn()
        }
      },
      time: {
        delayedCall: vi.fn(),
        addEvent: vi.fn()
      },
      add: {
        container: vi.fn(() => ({
          add: vi.fn(),
          setData: vi.fn(),
          setInteractive: vi.fn(),
          on: vi.fn(),
          setPosition: vi.fn(),
          setVisible: vi.fn(),
          setActive: vi.fn(),
        })),
        graphics: vi.fn(() => ({
          fillStyle: vi.fn().mockReturnThis(),
          fillCircle: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeCircle: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
        })),
        text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
        })),
        rectangle: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
        }))
      },
      tweens: {
        add: vi.fn()
      }
    };
  });

  it('should initialize with starting sun', () => {
    const economy = new EconomySystem(mockScene);
    expect(economy.getSun()).toBe(ECONOMY_CONFIG.INITIAL_SUN);
  });

  it('should correctly add sun', () => {
    const economy = new EconomySystem(mockScene);
    economy.addSun(50, 'plant');
    expect(economy.getSun()).toBe(ECONOMY_CONFIG.INITIAL_SUN + 50);
    expect(mockScene.game.events.emit).toHaveBeenCalledWith(GameEvents.SUN_CHANGED, expect.any(Number));
  });

  it('should not exceed max sun', () => {
    const economy = new EconomySystem(mockScene);
    economy.addSun(10000, 'cheat');
    expect(economy.getSun()).toBeLessThanOrEqual(ECONOMY_CONFIG.MAX_SUN);
  });

  it('should correctly spend sun if affordable', () => {
    const economy = new EconomySystem(mockScene);
    const initialSun = economy.getSun();
    const canSpend = initialSun >= 50;
    
    if (canSpend) {
      const result = economy.spend(50);
      expect(result).toBe(true);
      expect(economy.getSun()).toBe(initialSun - 50);
    }
  });

  it('should not spend sun if not affordable', () => {
    const economy = new EconomySystem(mockScene);
    const wayTooMuch = 10000;
    const result = economy.spend(wayTooMuch);
    expect(result).toBe(false);
    expect(economy.getSun()).toBe(ECONOMY_CONFIG.INITIAL_SUN);
  });

  it('should check if can afford', () => {
    const economy = new EconomySystem(mockScene);
    expect(economy.canAfford(50)).toBe(ECONOMY_CONFIG.INITIAL_SUN >= 50);
    expect(economy.canAfford(10000)).toBe(false);
  });
});
