import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CombatSystem } from './CombatSystem';
import { GameEvents } from '@/types/index';

// Mock Phaser
vi.mock('phaser', () => {
  const mockGroup = {
    add: vi.fn(),
    destroy: vi.fn(),
  };
  return {
    default: {
      Scene: vi.fn(),
      Physics: {
        Arcade: {
          Group: vi.fn(() => mockGroup),
        }
      },
      GameObjects: {
        Text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        })),
      }
    }
  };
});

describe('CombatSystem', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = {
      game: {
        events: {
          on: vi.fn(),
          emit: vi.fn()
        }
      },
      physics: {
        add: {
          group: vi.fn(() => ({
            destroy: vi.fn(),
          })),
          overlap: vi.fn()
        }
      },
      add: {
        text: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          destroy: vi.fn()
        }))
      },
      tweens: {
        add: vi.fn()
      }
    };
  });

  it('should initialize and setup collisions', () => {
    const combat = new CombatSystem(mockScene);
    expect(mockScene.physics.add.group).toHaveBeenCalledTimes(2);
    expect(mockScene.physics.add.overlap).toHaveBeenCalled();
  });

  it('should correctly calculate damage to zombie', () => {
    const combat = new CombatSystem(mockScene);
    
    const mockZombie = {
      x: 100,
      y: 100,
      getData: vi.fn().mockReturnValue(100), // health = 100
      setData: vi.fn(),
      destroy: vi.fn()
    };

    const mockProjectile = {
      getData: (key: string) => (key === 'damage' ? 20 : 'normal'),
      destroy: vi.fn()
    };

    // Simulate internal method call via mocked overlap callback or direct access if it were public
    // Since damageZombie is private, we test through the public interface or event triggers if possible.
    // For this test, we'll assume we're testing the logic that damage is subtracted.
    
    // Triggering the collision callback (index 2 of overlap call)
    const collisionCallback = mockScene.physics.add.overlap.mock.calls[0][2];
    collisionCallback(mockProjectile, mockZombie);

    expect(mockZombie.setData).toHaveBeenCalledWith('health', 80);
    expect(mockProjectile.destroy).toHaveBeenCalled();
    expect(mockScene.game.events.emit).toHaveBeenCalledWith(GameEvents.PROJECTILE_HIT, expect.any(Object));
  });

  it('should kill zombie when health reaches zero', () => {
    const combat = new CombatSystem(mockScene);
    
    const mockZombie = {
      x: 100,
      y: 100,
      getData: vi.fn().mockReturnValue(10), // low health
      setData: vi.fn(),
      destroy: vi.fn()
    };

    const mockProjectile = {
      getData: (key: string) => (key === 'damage' ? 20 : 'normal'),
      destroy: vi.fn()
    };

    const collisionCallback = mockScene.physics.add.overlap.mock.calls[0][2];
    collisionCallback(mockProjectile, mockZombie);

    expect(mockZombie.setData).toHaveBeenCalledWith('health', -10);
    expect(mockScene.tweens.add).toHaveBeenCalled(); // Death animation
    // Events check
    expect(mockScene.game.events.emit).toHaveBeenCalledWith(GameEvents.ZOMBIE_DIED, expect.any(Object));
  });
});
