import Phaser from 'phaser';
import { WAVE_CONFIG, GameEvents } from '@/types/index';
import type { LevelConfig, WaveConfig, ZombieSpawnedEventData } from '@/types/config';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 波次系统
 * 管理僵尸波次的生成和进度
 */
export class WaveSystem {
  private scene: Phaser.Scene;
  private audioManager: AudioManager | null = null;

  // 当前波次
  private currentWave: number = 0;

  // 总波次数
  private totalWaves: number = 0;

  // 波次配置列表
  private waveConfigs: WaveConfig[] = [];

  // 波次状态
  private isWaveInProgress: boolean = false;
  private isPreparationPhase: boolean = true;

  // 定时器
  private waveTimer: Phaser.Time.TimerEvent | null = null;
  private warningTimer: Phaser.Time.TimerEvent | null = null;

  // 警告文字
  private warningText: Phaser.GameObjects.Text | null = null;

  // 波次进度UI
  private progressBar: Phaser.GameObjects.Graphics | null = null;

  // 波次检查定时器
  private checkInterval: Phaser.Time.TimerEvent | null = null;

  // 僵尸生成和击杀跟踪
  private waveZombieCount: number = 0;
  private waveZombieKilled: number = 0;
  private waveSpawnComplete: boolean = false;

  // 僵尸生成定时器列表
  private spawnTimers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;
  }

  /**
   * 加载关卡配置
   */
  public loadLevel(levelConfig: LevelConfig): void {
    this.waveConfigs = levelConfig.waves;
    this.totalWaves = levelConfig.waves.length;
    this.currentWave = 0;
    this.isWaveInProgress = false;
    this.isPreparationPhase = true;

    console.log(`WaveSystem loaded level ${levelConfig.id} with ${this.totalWaves} waves`);
  }

  /**
   * 开始第一波
   */
  public start(): void {
    console.log('WaveSystem started');
    this.startPreparationPhase();
  }

  /**
   * 开始准备阶段
   */
  private startPreparationPhase(): void {
    this.isPreparationPhase = true;
    console.log('Preparation phase started');

    // 显示准备提示
    this.showNotification('准备阶段', 2000);

    // 准备时间后开始第一波
    this.waveTimer = this.scene.time.delayedCall(WAVE_CONFIG.PREPARATION_TIME, () => {
      this.startWave();
    });
  }

  /**
   * 开始波次
   */
  public startWave(): void {
    if (this.currentWave >= this.totalWaves) {
      this.onAllWavesComplete();
      return;
    }

    this.isWaveInProgress = true;
    this.isPreparationPhase = false;
    this.currentWave++;

    const waveConfig = this.waveConfigs[this.currentWave - 1];

    console.log(`Wave ${this.currentWave}/${this.totalWaves} started`);

    // 发送波次开始事件
    this.scene.game.events.emit(GameEvents.WAVE_STARTED, {
      waveNumber: this.currentWave,
      totalWaves: this.totalWaves,
      isFlagWave: waveConfig.isFlagWave
    });

    // 如果是旗帜波，显示警告
    if (waveConfig.isFlagWave) {
      this.showFlagWaveWarning();
    }

    // 生成僵尸
    this.spawnWaveZombies(waveConfig);

    // 更新进度
    this.updateProgress();
  }

  /**
   * 生成波次僵尸
   */
  private spawnWaveZombies(waveConfig: WaveConfig): void {
    let totalDelay = 0;
    let totalZombies = 0;

    waveConfig.zombies.forEach(zombieGroup => {
      const { type, count, delay = 3000, row } = zombieGroup;
      totalZombies += count;

      for (let i = 0; i < count; i++) {
        const spawnDelay = totalDelay + i * delay;

        const timer = this.scene.time.delayedCall(spawnDelay, () => {
          this.spawnZombie(type, row);
        });
        this.spawnTimers.push(timer);
      }

      totalDelay += count * delay;
    });

    // 记录本波次僵尸总数
    this.waveZombieCount = totalZombies;
    this.waveZombieKilled = 0;
    this.waveSpawnComplete = false;

    // 所有僵尸生成完成后标记为完成
    this.scene.time.delayedCall(totalDelay + 1000, () => {
      this.waveSpawnComplete = true;
    });

    // 波次结束后检查
    this.checkInterval = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.checkWaveComplete()) {
          this.checkInterval?.remove();
          this.checkInterval = null;
          this.onWaveComplete();
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  /**
   * 生成单个僵尸
   */
  private spawnZombie(type: string, row?: number): void {
    const gridRows = 5;
    const targetRow = row ?? Phaser.Math.Between(0, gridRows - 1);

    // 计算生成位置（屏幕右侧）
    const spawnX = 850;
    const spawnY = 80 + targetRow * 100 + 50; // 基于网格系统

    // 发送僵尸生成事件
    const eventData: ZombieSpawnedEventData = {
      zombieType: type,
      row: targetRow,
      position: { x: spawnX, y: spawnY }
    };

    this.scene.game.events.emit(GameEvents.ZOMBIE_SPAWNED, eventData);

    console.log(`Spawned zombie ${type} at row ${targetRow}`);
  }

  /**
   * 检查波次是否完成
   */
  private checkWaveComplete(): boolean {
    // 需要满足两个条件：所有僵尸已生成，且所有僵尸被消灭
    return this.waveSpawnComplete && this.waveZombieKilled >= this.waveZombieCount;
  }

  /**
   * 波次完成
   */
  public onWaveComplete(): void {
    this.isWaveInProgress = false;

    console.log(`Wave ${this.currentWave} completed`);

    // 发送波次完成事件
    this.scene.game.events.emit(GameEvents.WAVE_COMPLETED, {
      waveNumber: this.currentWave
    });

    // 如果不是最后一波，开始准备下一波
    if (this.currentWave < this.totalWaves) {
      const nextWaveDelay = this.waveConfigs[this.currentWave]?.timeBeforeWave ?? WAVE_CONFIG.WAVE_INTERVAL;

      // 显示警告（如果是最终波）
      if (this.currentWave === this.totalWaves - 1) {
        this.scene.game.events.emit(GameEvents.FINAL_WAVE_WARNING);
        this.showNotification('一大波僵尸正在接近！', 3000);
      }

      this.waveTimer = this.scene.time.delayedCall(nextWaveDelay, () => {
        this.startWave();
      });
    } else {
      this.onAllWavesComplete();
    }
  }

  /**
   * 所有波次完成
   */
  private onAllWavesComplete(): void {
    console.log('All waves completed!');
    this.scene.game.events.emit(GameEvents.ALL_WAVES_COMPLETED);
    this.showNotification('胜利！所有僵尸已被击退！', 3000);
  }

  /**
   * 显示旗帜波警告
   */
  private showFlagWaveWarning(): void {
    // 播放旗帜波警告音效
    if (this.currentWave === this.totalWaves) {
      this.audioManager?.playSfx(SoundEffect.FINAL_WAVE);
    } else {
      this.audioManager?.playSfx(SoundEffect.HUGE_WAVE);
    }

    this.showNotification('🚩 旗帜波次！', 2000);
  }

  /**
   * 显示通知文字
   */
  private showNotification(text: string, duration: number): void {
    // 移除旧的通知
    if (this.warningText) {
      this.warningText.destroy();
    }

    const { width, height } = this.scene.cameras.main;

    // 创建通知文字
    this.warningText = this.scene.add.text(width / 2, height / 3, text, {
      fontSize: '36px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.warningText.setOrigin(0.5);

    // 动画
    this.scene.tweens.add({
      targets: this.warningText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 2
    });

    // 自动消失
    this.scene.time.delayedCall(duration, () => {
      if (this.warningText) {
        this.scene.tweens.add({
          targets: this.warningText,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.warningText?.destroy();
            this.warningText = null;
          }
        });
      }
    });
  }

  /**
   * 更新进度显示
   */
  private updateProgress(): void {
    // 这里更新UI进度条
    const progress = this.currentWave / this.totalWaves;
    this.scene.game.events.emit('wave:progress', progress);
  }

  /**
   * 获取当前波次
   */
  public getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * 获取总波次数
   */
  public getTotalWaves(): number {
    return this.totalWaves;
  }

  /**
   * 是否在波次进行中
   */
  public getIsWaveInProgress(): boolean {
    return this.isWaveInProgress;
  }

  /**
   * 更新
   */
  public update(delta: number): void {
    // 波次逻辑更新
  }

  /**
   * 通知僵尸被击杀（由外部调用）
   */
  public onZombieKilled(): void {
    if (this.isWaveInProgress) {
      this.waveZombieKilled++;
      console.log(`Zombie killed: ${this.waveZombieKilled}/${this.waveZombieCount}`);
    }
  }

  /**
   * 清理
   */
  public destroy(): void {
    // 清理波次定时器
    if (this.waveTimer) {
      this.waveTimer.remove();
      this.waveTimer = null;
    }

    // 清理警告定时器
    if (this.warningTimer) {
      this.warningTimer.remove();
      this.warningTimer = null;
    }

    // 清理检查定时器
    if (this.checkInterval) {
      this.checkInterval.remove();
      this.checkInterval = null;
    }

    // 清理所有僵尸生成定时器
    this.spawnTimers.forEach(timer => timer.remove());
    this.spawnTimers = [];

    // 清理UI
    if (this.warningText) {
      this.scene.tweens.killTweensOf(this.warningText);
      this.warningText.destroy();
      this.warningText = null;
    }

    if (this.progressBar) {
      this.progressBar.destroy();
      this.progressBar = null;
    }
  }
}
