import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from './ObjectPool';

// Mock Phaser
vi.mock('phaser', () => {
  const mockGameObject = vi.fn();
  return {
    default: {
      Scene: vi.fn(),
      GameObjects: {
        GameObject: mockGameObject,
        Image: mockGameObject,
        Sprite: mockGameObject,
      },
      Physics: {
        Arcade: {
          Image: mockGameObject,
          Sprite: mockGameObject,
        }
      }
    }
  };
});

describe('ObjectPool', () => {
  let mockScene: any;
  let createFn: any;
  let resetFn: any;

  beforeEach(() => {
    mockScene = {};
    createFn = vi.fn((scene) => ({
      scene,
      active: true,
      visible: true,
      setActive: vi.fn(function(this: any, val) { this.active = val; }),
      setVisible: vi.fn(function(this: any, val) { this.visible = val; }),
      destroy: vi.fn()
    }));
    resetFn = vi.fn();
  });

  it('should create new objects when pool is empty', () => {
    const pool = new ObjectPool(mockScene, createFn, resetFn, 5);
    const obj1 = pool.get();
    
    expect(createFn).toHaveBeenCalledTimes(1);
    expect(pool.getActiveCount()).toBe(1);
    expect(pool.getPoolSize()).toBe(0);
  });

  it('should reuse objects from pool', () => {
    const pool = new ObjectPool(mockScene, createFn, resetFn, 5);
    const obj1 = pool.get();
    pool.recycle(obj1);
    
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPoolSize()).toBe(1);
    expect(obj1.setActive).toHaveBeenCalledWith(false);

    const obj2 = pool.get();
    expect(obj2).toBe(obj1);
    expect(createFn).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(resetFn).toHaveBeenCalledWith(obj1);
    expect(obj2.setActive).toHaveBeenCalledWith(true);
  });

  it('should respect max pool size', () => {
    const pool = new ObjectPool(mockScene, createFn, resetFn, 1);
    const obj1 = pool.get();
    const obj2 = pool.get();
    
    pool.recycle(obj1);
    expect(pool.getPoolSize()).toBe(1);
    
    pool.recycle(obj2);
    expect(pool.getPoolSize()).toBe(1); // Still 1 because maxSize is 1
    expect(obj2.destroy).toHaveBeenCalled();
  });

  it('should recycle all active objects', () => {
    const pool = new ObjectPool(mockScene, createFn, resetFn, 5);
    pool.get();
    pool.get();
    expect(pool.getActiveCount()).toBe(2);
    
    pool.recycleAll();
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPoolSize()).toBe(2);
  });
});
