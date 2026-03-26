import Phaser from 'phaser';
import { GRID_CONFIG, GameEvents } from '@/types/index';
import { Logger } from '@game/utils/Logger';
import type { GridCell, GridPosition, ScreenPosition } from '@/types/config';

/**
 * 网格系统
 * 管理游戏场地网格，负责坐标转换和网格状态
 */
export class GridSystem {
  private scene: Phaser.Scene;

  // 网格配置
  private readonly rows: number = GRID_CONFIG.ROWS;
  private readonly cols: number = GRID_CONFIG.COLS;
  private readonly cellWidth: number = GRID_CONFIG.CELL_WIDTH;
  private readonly cellHeight: number = GRID_CONFIG.CELL_HEIGHT;
  private readonly offsetX: number = GRID_CONFIG.OFFSET_X;
  private readonly offsetY: number = GRID_CONFIG.OFFSET_Y;

  // 网格数据
  private grid: GridCell[][] = [];

  // 每行僵尸列表
  private zombiesInRow: Map<number, Phaser.GameObjects.GameObject[]> =
    new Map();

  // 事件监听引用（用于清理）
  private eventListeners: {
    event: string;
    callback: (...args: any[]) => void;
  }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeGrid();
    this.setupEventListeners();
  }

  /**
   * 初始化网格
   */
  public initializeGrid(background: string = 'day-grass'): void {
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      this.zombiesInRow.set(row, []);

      // 泳池关卡逻辑：中间两行为水（索引 2, 3）
      const terrainType =
        background === 'pool' && (row === 2 || row === 3) ? 'water' : 'grass';

      for (let col = 0; col < this.cols; col++) {
        const x = this.offsetX + col * this.cellWidth;
        const y = this.offsetY + row * this.cellHeight;

        this.grid[row][col] = {
          row,
          col,
          x: x + this.cellWidth / 2,
          y: y + this.cellHeight / 2,
          plant: null,
          platform: null,
          isWalkable: true,
          terrainType: terrainType,
        };
      }
    }

    Logger.log(`GridSystem initialized with terrain: ${background}`);
  }

  public getTerrainType(row: number, col: number): 'grass' | 'water' {
    return this.grid[row][col].terrainType;
  }

  public hasLilyPad(row: number, col: number): boolean {
    return this.grid[row][col].platform === 'lilypad';
  }

  public setPlatform(row: number, col: number, plantId: string): void {
    this.grid[row][col].platform = plantId;
  }

  public removePlatform(row: number, col: number): void {
    this.grid[row][col].platform = null;
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    const plantPlacedCallback = (data: {
      row: number;
      col: number;
      plantId: string;
    }) => {
      this.setPlant(data.row, data.col, data.plantId);
    };

    const plantRemovedCallback = (data: { row: number; col: number }) => {
      this.removePlant(data.row, data.col);
    };

    this.scene.game.events.on(GameEvents.PLANT_PLACED, plantPlacedCallback);
    this.scene.game.events.on(GameEvents.PLANT_REMOVED, plantRemovedCallback);

    // 存储引用以便清理
    this.eventListeners.push(
      { event: GameEvents.PLANT_PLACED, callback: plantPlacedCallback },
      { event: GameEvents.PLANT_REMOVED, callback: plantRemovedCallback }
    );
  }

  /**
   * 屏幕坐标转网格坐标
   */
  public screenToGrid(screenX: number, screenY: number): GridPosition | null {
    // 检查是否在网格范围内
    if (screenX < this.offsetX || screenY < this.offsetY) {
      return null;
    }

    const col = Math.floor((screenX - this.offsetX) / this.cellWidth);
    const row = Math.floor((screenY - this.offsetY) / this.cellHeight);

    // 检查边界
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }

    return { row, col };
  }

  /**
   * 网格坐标转屏幕坐标
   */
  public gridToScreen(row: number, col: number): ScreenPosition | null {
    if (!this.isValidCell(row, col)) {
      return null;
    }

    const cell = this.grid[row][col];
    return { x: cell.x, y: cell.y };
  }

  /**
   * 检查是否是有效格子
   */
  public isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * 获取格子
   */
  public getCell(row: number, col: number): GridCell | null {
    if (!this.isValidCell(row, col)) {
      return null;
    }
    return this.grid[row][col];
  }

  /**
   * 检查是否可以种植
   */
  public canPlant(row: number, col: number): boolean {
    if (!this.isValidCell(row, col)) {
      return false;
    }
    return this.grid[row][col].plant === null;
  }

  /**
   * 设置植物
   */
  public setPlant(row: number, col: number, plantId: string): boolean {
    if (!this.isValidCell(row, col)) {
      return false;
    }

    this.grid[row][col].plant = plantId;
    console.log(`Plant ${plantId} placed at (${row}, ${col})`);
    return true;
  }

  /**
   * 移除植物
   */
  public removePlant(row: number, col: number): boolean {
    if (!this.isValidCell(row, col)) {
      return false;
    }

    const plantId = this.grid[row][col].plant;
    this.grid[row][col].plant = null;
    console.log(`Plant ${plantId} removed from (${row}, ${col})`);
    return true;
  }

  /**
   * 获取植物
   */
  public getPlant(row: number, col: number): string | null {
    if (!this.isValidCell(row, col)) {
      return null;
    }
    return this.grid[row][col].plant;
  }

  /**
   * 注册僵尸到某行
   */
  public registerZombieInRow(
    row: number,
    zombie: Phaser.GameObjects.GameObject
  ): void {
    if (row < 0 || row >= this.rows) return;

    const zombies = this.zombiesInRow.get(row);
    if (zombies && !zombies.includes(zombie)) {
      zombies.push(zombie);
    }
  }

  /**
   * 从某行移除僵尸
   */
  public unregisterZombieInRow(
    row: number,
    zombie: Phaser.GameObjects.GameObject
  ): void {
    if (row < 0 || row >= this.rows) return;

    const zombies = this.zombiesInRow.get(row);
    if (zombies) {
      const index = zombies.indexOf(zombie);
      if (index > -1) {
        zombies.splice(index, 1);
      }
    }
  }

  /**
   * 获取某行的僵尸列表
   */
  public getZombiesInRow(row: number): Phaser.GameObjects.GameObject[] {
    return this.zombiesInRow.get(row) || [];
  }

  /**
   * 获取僵尸所在的行
   */
  public getZombieRow(zombieY: number): number {
    return Math.floor((zombieY - this.offsetY) / this.cellHeight);
  }

  /**
   * 获取格子中心点X坐标
   */
  public getCellCenterX(col: number): number {
    return this.offsetX + col * this.cellWidth + this.cellWidth / 2;
  }

  /**
   * 获取格子中心点Y坐标
   */
  public getCellCenterY(row: number): number {
    return this.offsetY + row * this.cellHeight + this.cellHeight / 2;
  }

  /**
   * 获取所有行数
   */
  public getRows(): number {
    return this.rows;
  }

  /**
   * 获取所有列数
   */
  public getCols(): number {
    return this.cols;
  }

  /**
   * 获取格子宽度
   */
  public getCellWidth(): number {
    return this.cellWidth;
  }

  /**
   * 获取格子高度
   */
  public getCellHeight(): number {
    return this.cellHeight;
  }

  /**
   * 获取网格偏移X
   */
  public getOffsetX(): number {
    return this.offsetX;
  }

  /**
   * 获取网格偏移Y
   */
  public getOffsetY(): number {
    return this.offsetY;
  }

  /**
   * 清理
   */
  public destroy(): void {
    // 移除事件监听
    this.eventListeners.forEach(({ event, callback }) => {
      this.scene.game.events.off(event, callback);
    });
    this.eventListeners = [];

    // 清理网格数据
    this.grid = [];
    this.zombiesInRow.clear();
  }
}
