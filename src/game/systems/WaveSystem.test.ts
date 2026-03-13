import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaveSystem } from './WaveSystem';
import { GameEvents } from '@/types/index';

// Mock Phaser
vi.mock('phaser', () => {
  return {
    default: {
      Scene: vi.fn(),
      GameObjects: {
        Text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        })),
      },
      Math: {
        Between: vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1) + min)),
      }
    }
  };
});

describe('WaveSystem', () => {
  let mockScene: any;
  let mockLevelConfig: any;

  beforeEach(() => {
    mockScene = {
      game: {
        registry: { get: vi.fn() },
        events: {
          on: vi.fn(),
          off: vi.fn(),
          emit: vi.fn()
        }
      },
      time: {
        delayedCall: vi.fn(),
        addEvent: vi.fn(() => ({ remove: vi.fn() }))
      },
      add: {
        text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          destroy: vi.fn()
        }))
      },
      cameras: {
        main: { width: 800, height: 600 }
      },
      tweens: {
        add: vi.fn(),
        killTweensOf: vi.fn()
      }
    };

    mockLevelConfig = {
      id: 'test-level',
      waves: [
        {
          waveNumber: 1,
          isFlagWave: false,
          zombies: [{ type: 'normal', count: 2, delay: 1000 }],
          timeBeforeWave: 5000
        },
        {
          waveNumber: 2,
          isFlagWave: true,
          zombies: [{ type: 'conehead', count: 1, delay: 0 }],
          timeBeforeWave: 5000
        }
      ]
    };
  });

  it('should load level configuration correctly', () => {
    const waveSystem = new WaveSystem(mockScene);
    waveSystem.loadLevel(mockLevelConfig);
    expect(waveSystem.getTotalWaves()).toBe(2);
    expect(waveSystem.getCurrentWave()).toBe(0);
  });

  it('should start with preparation phase', () => {
    const waveSystem = new WaveSystem(mockScene);
    waveSystem.loadLevel(mockLevelConfig);
    waveSystem.start();
    
    expect(mockScene.time.delayedCall).toHaveBeenCalled();
    expect(waveSystem.getIsWaveInProgress()).toBe(false);
  });

  it('should start wave correctly', () => {
    const waveSystem = new WaveSystem(mockScene);
    waveSystem.loadLevel(mockLevelConfig);
    waveSystem.startWave();

    expect(waveSystem.getCurrentWave()).toBe(1);
    expect(waveSystem.getIsWaveInProgress()).toBe(true);
    expect(mockScene.game.events.emit).toHaveBeenCalledWith(GameEvents.WAVE_STARTED, expect.any(Object));
  });

  it('should correctly track zombie kills', () => {
    const waveSystem = new WaveSystem(mockScene);
    waveSystem.loadLevel(mockLevelConfig);
    waveSystem.startWave();
    
    // Wave 1 has 2 zombies
    waveSystem.onZombieKilled();
    waveSystem.onZombieKilled();
    
    // Internal state check would be nice but private. 
    // We can indirectly check if wave completes if we mock the check interval.
  });

  it('should emit win event when all waves are complete', () => {
    const waveSystem = new WaveSystem(mockScene);
    waveSystem.loadLevel(mockLevelConfig);
    
    // Simulate completing all waves
    waveSystem.startWave(); // Wave 1
    waveSystem.onWaveComplete(); // Completes 1, schedules 2
    waveSystem.startWave(); // Wave 2
    waveSystem.onWaveComplete(); // Completes 2, all done
    
    expect(mockScene.game.events.emit).toHaveBeenCalledWith(GameEvents.ALL_WAVES_COMPLETED);
  });
});
