/**
 * Web Audio API 音效生成器
 * 用于生成程序化的音效，作为备用方案
 */
export class ProceduralAudio {
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * 播放种植音效
   */
  public playPlant(): void {
    if (!this.audioContext) return;
    this.resume();
    
    // 两个振荡器层叠，一个是基础音调，一个是短暂的冲击音
    const now = this.audioContext.currentTime;
    
    // 基础音
    this.playTone(330, 0.15, 'sine', 0.2);
    
    // 冲击噪音
    const noise = this.createNoiseBuffer(0.05);
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    
    noiseSource.buffer = noise;
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    noiseSource.start(now);
  }

  /**
   * 播放射击音效
   */
  public playShoot(): void {
    if (!this.audioContext) return;
    this.resume();
    
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    // 频率快速下滑，模拟“噗”的一声
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    // 滤波器
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 播放击中音效
   */
  public playHit(): void {
    if (!this.audioContext) return;
    this.resume();
    
    const now = this.audioContext.currentTime;
    
    // 高频瞬时噪音
    const noise = this.createNoiseBuffer(0.05);
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    
    source.buffer = noise;
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    source.start(now);
    
    // 配合一个低频打击音
    this.playTone(150, 0.08, 'triangle', 0.2);
  }

  /**
   * 播放爆炸音效
   */
  public playExplosion(): void {
    if (!this.audioContext) return;
    this.resume();
    
    const now = this.audioContext.currentTime;
    
    // 1. 低频冲击
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
    
    // 2. 持续白噪音
    const noise = this.createNoiseBuffer(0.5);
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    noiseSource.start(now);
  }

  /**
   * 播放阳光收集音效
   */
  public playSunCollect(): void {
    if (!this.audioContext) return;
    this.resume();
    
    const now = this.audioContext.currentTime;
    
    // 两个正弦波层叠，形成叮当声
    this.playTone(880, 0.3, 'sine', 0.15); // A5
    
    setTimeout(() => {
      this.playTone(1318.51, 0.4, 'sine', 0.1); // E6
    }, 50);
    
    setTimeout(() => {
      this.playTone(1760, 0.5, 'sine', 0.1); // A6
    }, 100);
  }

  /**
   * 播放按钮点击音效
   */
  public playButtonClick(): void {
    if (!this.audioContext) return;
    this.resume();
    this.playTone(1200, 0.05, 'sine', 0.2);
    setTimeout(() => this.playTone(800, 0.05, 'sine', 0.15), 20);
  }

  /**
   * 停止当前背景循环
   */
  public stopAmbientLoop(): void {
    if (this.currentBgmNodes) {
      this.currentBgmNodes.forEach(node => {
        try { node.stop(); } catch {}
      });
      this.currentBgmNodes = [];
    }
  }

  private currentBgmNodes: AudioScheduledSourceNode[] = [];

  /**
   * 启动程序化背景音乐循环
   */
  public startAmbientLoop(): void {
    if (!this.audioContext) return;
    this.resume();
    this.stopAmbientLoop();

    const now = this.audioContext.currentTime;
    
    // 创建一个简单的氛围低音
    const createDrone = (freq: number, vol: number) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 2);
      
      osc.start(now);
      this.currentBgmNodes.push(osc);
    };

    // 播放几个和谐的低频音
    createDrone(110, 0.05); // A2
    createDrone(164.81, 0.03); // E3
  }

  /**
   * 辅助方法：创建指定时长的噪音缓存
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 播放错误音效
   */
  public playError(): void {
    if (!this.audioContext) return;
    this.playTone(150, 0.2, 'sawtooth', 0.3);
  }

  /**
   * 播放胜利音效
   */
  public playWin(): void {
    if (!this.audioContext) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 100);
    });
  }

  /**
   * 播放失败音效
   */
  public playLose(): void {
    if (!this.audioContext) return;
    const notes = [440, 349.23, 293.66, 246.94]; // Descending
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.3), i * 200);
    });
  }

  /**
   * 播放简单音调
   */
  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.type = type;
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  /**
   * 播放噪音
   */
  private playNoise(duration: number, volume: number): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();

    noise.buffer = buffer;
    noise.connect(gain);
    gain.connect(this.audioContext.destination);

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    noise.start(this.audioContext.currentTime);
  }

  /**
   * 恢复音频上下文（用于浏览器自动暂停）
   */
  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// 导出单例
export const proceduralAudio = new ProceduralAudio();
