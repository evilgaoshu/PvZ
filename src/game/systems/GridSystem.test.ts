import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GridSystem } from './GridSystem';
import { GameEvents, GRID_CONFIG } from '@/types/index';

// Mock Phaser
vi.mock('phaser', () => {
  return {
    default: {
      Scene: vi.fn(),
      GameObjects: {
        GameObject: vi.fn(),
      }
    }
  };
});

describe('GridSystem', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = {
      game: {
        events: {
          on: vi.fn(),
          off: vi.fn(),
          emit: vi.fn()
        }
      }
    };
  });

  it('should initialize with correct rows and cols', () => {
    const gridSystem = new GridSystem(mockScene);
    expect(gridSystem.getRows()).toBe(GRID_CONFIG.ROWS);
    expect(gridSystem.getCols()).toBe(GRID_CONFIG.COLS);
  });

  it('should correctly identify valid and invalid cells', () => {
    const gridSystem = new GridSystem(mockScene);
    expect(gridSystem.isValidCell(0, 0)).toBe(true);
    expect(gridSystem.isValidCell(GRID_CONFIG.ROWS - 1, GRID_CONFIG.COLS - 1)).toBe(true);
    expect(gridSystem.isValidCell(-1, 0)).toBe(false);
    expect(gridSystem.isValidCell(0, GRID_CONFIG.COLS)).toBe(false);
  });

  it('should correctly handle plant placement and removal', () => {
    const gridSystem = new GridSystem(mockScene);
    const row = 1;
    const col = 1;

    expect(gridSystem.canPlant(row, col)).toBe(true);
    
    gridSystem.setPlant(row, col, 'peashooter');
    expect(gridSystem.getPlant(row, col)).toBe('peashooter');
    expect(gridSystem.canPlant(row, col)).toBe(false);

    gridSystem.removePlant(row, col);
    expect(gridSystem.getPlant(row, col)).toBe(null);
    expect(gridSystem.canPlant(row, col)).toBe(true);
  });

  it('should handle terrain types correctly after initialization', () => {
    const gridSystem = new GridSystem(mockScene);
    
    // Default grass
    gridSystem.initializeGrid('day-grass');
    expect(gridSystem.getTerrainType(0, 0)).toBe('grass');
    expect(gridSystem.getTerrainType(2, 0)).toBe('grass');

    // Pool terrain
    gridSystem.initializeGrid('pool');
    expect(gridSystem.getTerrainType(0, 0)).toBe('grass');
    expect(gridSystem.getTerrainType(2, 0)).toBe('water');
    expect(gridSystem.getTerrainType(3, 0)).toBe('water');
    expect(gridSystem.getTerrainType(4, 0)).toBe('grass');
  });

  it('should handle lilypad platform logic', () => {
    const gridSystem = new GridSystem(mockScene);
    gridSystem.initializeGrid('pool');
    
    expect(gridSystem.hasLilyPad(2, 2)).toBe(false);
    
    gridSystem.setPlatform(2, 2, 'lilypad');
    expect(gridSystem.hasLilyPad(2, 2)).toBe(true);
    
    gridSystem.removePlatform(2, 2);
    expect(gridSystem.hasLilyPad(2, 2)).toBe(false);
  });

  it('should convert screen coordinates to grid coordinates', () => {
    const gridSystem = new GridSystem(mockScene);
    const { OFFSET_X, OFFSET_Y, CELL_WIDTH, CELL_HEIGHT } = GRID_CONFIG;

    // Test first cell
    const pos1 = gridSystem.screenToGrid(OFFSET_X + 5, OFFSET_Y + 5);
    expect(pos1).toEqual({ row: 0, col: 0 });

    // Test some middle cell
    const pos2 = gridSystem.screenToGrid(OFFSET_X + CELL_WIDTH * 2 + 5, OFFSET_Y + CELL_HEIGHT * 3 + 5);
    expect(pos2).toEqual({ row: 3, col: 2 });

    // Test out of bounds
    expect(gridSystem.screenToGrid(OFFSET_X - 1, OFFSET_Y)).toBe(null);
  });
});
