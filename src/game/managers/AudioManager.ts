import Phaser from 'phaser';
import { SoundEffect, BackgroundMusic, SFX_CONFIGS, BGM_CONFIGS } from '../config/AudioConfig';
import { ProceduralAudio } from '../utils/ProceduralAudio';

/**
 * 音频管理器
 * 管理所有游戏音频的播放、音量控制和资源加载
 */
export class AudioManager {
  private scene: Phaser.Scene;

  // 音效
  private sfx: Map<string, Phaser.Sound.BaseSound> = new Map();

  // 背景音乐
  private bgm: Map<string, Phaser.Sound.BaseSound> = new Map();
  private currentBgm: string | null = null;

  // 音量设置
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private bgmVolume: number = 0.5;

  // 是否静音
  private isMuted: boolean = false;

  // 程序化音频生成器（作为后备）
  private proceduralAudio: ProceduralAudio;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.proceduralAudio = new ProceduralAudio();
  }

  /**
   * 预加载音频资源
   */
  public preload(): void {
    // 检查是否跳过外部资源加载（如果资产目录为空）
    // 在本项目的当前状态下，我们知道外部音效文件不存在，为了避免 EncodingError，我们暂时跳过加载
    // 开发者可以在添加实际资源后移除此检查
    const skipExternalLoading = true; 

    if (skipExternalLoading) {
      console.info('Skipping external audio loading, using procedural fallback only.');
      return;
    }

    // 加载音效（设置失败回调）
    SFX_CONFIGS.forEach(config => {
      this.scene.load.audio(config.key, config.path);
    });

    // 加载背景音乐（设置失败回调）
    BGM_CONFIGS.forEach(config => {
      this.scene.load.audio(config.key, config.path);
    });

    // 监听加载错误，不抛出异常
    this.scene.load.on('fileerror', (file: any) => {
      console.warn(`Audio file load failed: ${file.key}, will use procedural fallback`);
    });
  }

  /**
   * 初始化音频
   */
  public init(): void {
    // 创建音效实例（仅当资源存在时）
    SFX_CONFIGS.forEach(config => {
      // 检查资源是否成功加载
      const isLoaded = this.scene.cache.audio.has(config.key);
      if (!isLoaded) {
        console.warn(`Audio resource not found: ${config.key}, will use procedural fallback`);
        return;
      }

      const sound = this.scene.sound.add(config.key, {
        volume: config.volume ?? 1.0,
        loop: config.loop ?? false,
        rate: config.rate ?? 1.0
      });
      this.sfx.set(config.key, sound);
    });

    // 创建背景音乐实例（仅当资源存在时）
    BGM_CONFIGS.forEach(config => {
      // 检查资源是否成功加载
      const isLoaded = this.scene.cache.audio.has(config.key);
      if (!isLoaded) {
        console.warn(`BGM resource not found: ${config.key}`);
        return;
      }

      const sound = this.scene.sound.add(config.key, {
        volume: (config.volume ?? 1.0) * this.bgmVolume,
        loop: config.loop ?? true,
        rate: config.rate ?? 1.0
      });
      this.bgm.set(config.key, sound);
    });

    console.log('AudioManager initialized');
  }

  /**
   * 播放音效
   */
  public playSfx(key: SoundEffect | string, config?: { volume?: number; rate?: number }): void {
    if (this.isMuted) return;

    const sound = this.sfx.get(key);
    if (!sound) {
      // 如果音效不存在，使用程序化音频作为后备
      this.playProceduralSfx(key as SoundEffect);
      return;
    }

    const volume = (config?.volume ?? 1.0) * this.sfxVolume * this.masterVolume;
    const rate = config?.rate ?? 1.0;

    if (sound instanceof Phaser.Sound.WebAudioSound) {
      sound.setVolume(volume);
      sound.setRate(rate);
      sound.play();
    } else {
      sound.play({ volume, rate });
    }
  }

  /**
   * 使用程序化音频播放音效
   */
  private playProceduralSfx(key: SoundEffect): void {
    // 恢复音频上下文（可能被浏览器暂停）
    this.proceduralAudio.resume();

    switch (key) {
      case SoundEffect.PLANT:
        this.proceduralAudio.playPlant();
        break;
      case SoundEffect.SHOOT:
        this.proceduralAudio.playShoot();
        break;
      case SoundEffect.HIT:
        this.proceduralAudio.playHit();
        break;
      case SoundEffect.EXPLOSION:
        this.proceduralAudio.playExplosion();
        break;
      case SoundEffect.SUN_COLLECT:
        this.proceduralAudio.playSunCollect();
        break;
      case SoundEffect.BUTTON_CLICK:
        this.proceduralAudio.playButtonClick();
        break;
      case SoundEffect.ERROR:
        this.proceduralAudio.playError();
        break;
      case SoundEffect.WIN:
        this.proceduralAudio.playWin();
        break;
      case SoundEffect.LOSE:
        this.proceduralAudio.playLose();
        break;
      default:
        // 其他音效暂不处理
        break;
    }
  }

  /**
   * 播放背景音乐
   */
  public playBgm(key: BackgroundMusic | string, fadeDuration: number = 1000): void {
    if (this.currentBgm === key) return;

    // 停止当前背景音乐
    if (this.currentBgm) {
      this.stopBgm(fadeDuration);
    }

    const sound = this.bgm.get(key);
    if (!sound) {
      console.warn(`Background music not found: ${key}, using procedural fallback`);
      this.proceduralAudio.startAmbientLoop();
      this.currentBgm = key;
      return;
    }

    // 淡入效果
    if (fadeDuration > 0 && sound instanceof Phaser.Sound.WebAudioSound) {
      sound.setVolume(0);
      sound.play();

      this.scene.tweens.add({
        targets: sound,
        volume: this.bgmVolume * this.masterVolume,
        duration: fadeDuration,
        ease: 'Linear'
      });
    } else {
      sound.play();
    }

    this.currentBgm = key;
  }

  /**
   * 停止背景音乐
   */
  public stopBgm(fadeDuration: number = 1000): void {
    if (!this.currentBgm) return;

    const sound = this.bgm.get(this.currentBgm);
    if (!sound) {
      this.proceduralAudio.stopAmbientLoop();
      this.currentBgm = null;
      return;
    }

    if (fadeDuration > 0 && sound instanceof Phaser.Sound.WebAudioSound) {
      this.scene.tweens.add({
        targets: sound,
        volume: 0,
        duration: fadeDuration,
        ease: 'Linear',
        onComplete: () => {
          sound.stop();
        }
      });
    } else {
      sound.stop();
    }

    this.currentBgm = null;
  }

  /**
   * 暂停背景音乐
   */
  public pauseBgm(): void {
    if (!this.currentBgm) return;

    const sound = this.bgm.get(this.currentBgm);
    if (sound) {
      sound.pause();
    }
  }

  /**
   * 恢复背景音乐
   */
  public resumeBgm(): void {
    if (this.isMuted) return;
    if (!this.currentBgm) return;

    const sound = this.bgm.get(this.currentBgm);
    if (sound) {
      sound.resume();
    }
  }

  /**
   * 设置主音量
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateAllVolumes();
  }

  /**
   * 设置音效音量
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateSfxVolumes();
  }

  /**
   * 设置背景音乐音量
   */
  public setBgmVolume(volume: number): void {
    this.bgmVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateBgmVolumes();
  }

  /**
   * 更新所有音量
   */
  private updateAllVolumes(): void {
    this.updateSfxVolumes();
    this.updateBgmVolumes();
  }

  /**
   * 更新音效音量
   */
  private updateSfxVolumes(): void {
    this.sfx.forEach((sound, key) => {
      const config = SFX_CONFIGS.find(c => c.key === key);
      if (config && sound instanceof Phaser.Sound.WebAudioSound) {
        sound.setVolume((config.volume ?? 1.0) * this.sfxVolume * this.masterVolume);
      }
    });
  }

  /**
   * 更新背景音乐音量
   */
  private updateBgmVolumes(): void {
    this.bgm.forEach((sound, key) => {
      const config = BGM_CONFIGS.find(c => c.key === key);
      if (config && sound instanceof Phaser.Sound.WebAudioSound) {
        const targetVolume = (config.volume ?? 1.0) * this.bgmVolume * this.masterVolume;

        // 如果是当前播放的音乐，平滑过渡
        if (key === this.currentBgm) {
          this.scene.tweens.add({
            targets: sound,
            volume: targetVolume,
            duration: 300,
            ease: 'Linear'
          });
        } else {
          sound.setVolume(targetVolume);
        }
      }
    });
  }

  /**
   * 静音/取消静音
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.scene.sound.mute = true;
    } else {
      this.scene.sound.mute = false;
    }

    return this.isMuted;
  }

  /**
   * 设置静音状态
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.scene.sound.mute = muted;
  }

  /**
   * 是否静音
   */
  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 获取当前背景音乐
   */
  public getCurrentBgm(): string | null {
    return this.currentBgm;
  }

  /**
   * 播放随机僵尸音效
   */
  public playRandomZombieSound(): void {
    const sounds = [
      SoundEffect.ZOMBIE_GROAN,
      SoundEffect.ZOMBIE_EATING
    ];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    this.playSfx(randomSound);
  }

  /**
   * 停止所有音频
   */
  public stopAll(): void {
    this.sfx.forEach(sound => sound.stop());
    this.stopBgm(0);
  }

  /**
   * 暂停所有音频
   */
  public pauseAll(): void {
    this.sfx.forEach(sound => sound.pause());
    this.pauseBgm();
  }

  /**
   * 恢复所有音频
   */
  public resumeAll(): void {
    if (this.isMuted) return;
    this.sfx.forEach(sound => sound.resume());
    this.resumeBgm();
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.stopAll();
    this.sfx.clear();
    this.bgm.clear();
  }
}
