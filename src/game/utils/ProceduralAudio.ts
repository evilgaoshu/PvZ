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
    this.playTone(440, 0.1, 'sine', 0.3);
  }

  /**
   * 播放射击音效
   */
  public playShoot(): void {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * 播放击中音效
   */
  public playHit(): void {
    if (!this.audioContext) return;
    this.playNoise(0.1, 0.3);
  }

  /**
   * 播放爆炸音效
   */
  public playExplosion(): void {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.audioContext.currentTime + 0.3);

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 播放阳光收集音效
   */
  public playSunCollect(): void {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.type = 'sine';
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * 播放按钮点击音效
   */
  public playButtonClick(): void {
    if (!this.audioContext) return;
    this.playTone(600, 0.05, 'square', 0.2);
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
