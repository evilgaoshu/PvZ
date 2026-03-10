import Phaser from 'phaser';

/**
 * 场景基类
 * 所有游戏场景的抽象基类
 */
export abstract class BaseScene extends Phaser.Scene {
  /**
   * 场景键名
   */
  public readonly sceneKey: string;

  /**
   * 是否已初始化
   */
  protected isInitialized: boolean = false;

  /**
   * 游戏事件发射器
   */
  protected gameEvents: Phaser.Events.EventEmitter;

  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.sceneKey = config.key || 'BaseScene';
    this.gameEvents = new Phaser.Events.EventEmitter();
  }

  /**
   * 场景初始化（自动调用）
   */
  init(data?: any): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.onInit();
  }

  /**
   * 预加载资源（自动调用）
   */
  preload(): void {
    this.onPreload();
  }

  /**
   * 创建场景（自动调用）
   */
  create(): void {
    this.onCreate();
    this.setupInput();
  }

  /**
   * 更新场景（每帧调用）
   */
  update(time: number, delta: number): void {
    this.onUpdate(time, delta);
  }

  /**
   * 初始化回调（子类重写）
   */
  protected abstract onInit(): void;

  /**
   * 预加载回调（子类重写）
   */
  protected abstract onPreload(): void;

  /**
   * 创建回调（子类重写）
   */
  protected abstract onCreate(): void;

  /**
   * 更新回调（子类重写）
   */
  protected abstract onUpdate(time: number, delta: number): void;

  /**
   * 设置输入处理
   */
  protected setupInput(): void {
    // 基础输入处理，子类可扩展
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onPointerDown(pointer);
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.onPointerUp(pointer);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.onPointerMove(pointer);
    });

    // 键盘输入
    this.input.keyboard?.on('keydown-ESC', () => {
      this.onPause();
    });
  }

  /**
   * 指针按下回调（子类重写）
   */
  protected onPointerDown(pointer: Phaser.Input.Pointer): void {
    // 子类实现
  }

  /**
   * 指针抬起回调（子类重写）
   */
  protected onPointerUp(pointer: Phaser.Input.Pointer): void {
    // 子类实现
  }

  /**
   * 指针移动回调（子类重写）
   */
  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    // 子类实现
  }

  /**
   * 暂停回调（子类重写）
   */
  protected onPause(): void {
    // 子类实现
  }

  /**
   * 过渡进入场景
   */
  protected transitionIn(duration: number = 500): void {
    this.cameras.main.fadeIn(duration, 0, 0, 0);
  }

  /**
   * 过渡离开场景
   */
  protected transitionOut(duration: number = 500, callback?: () => void): void {
    this.cameras.main.fadeOut(duration, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (callback) callback();
    });
  }

  /**
   * 切换到指定场景
   */
  protected switchScene(key: string, data?: any): void {
    this.transitionOut(300, () => {
      this.scene.start(key, data);
    });
  }

  /**
   * 返回上一个场景
   */
  protected goBack(): void {
    this.scene.resume();
    this.scene.stop();
  }

  /**
   * 获取场景中心点
   */
  protected getCenter(): { x: number; y: number } {
    return {
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2
    };
  }

  /**
   * 获取游戏尺寸
   */
  protected getGameSize(): { width: number; height: number } {
    return {
      width: this.cameras.main.width,
      height: this.cameras.main.height
    };
  }

  /**
   * 创建文本
   */
  protected createText(
    x: number,
    y: number,
    text: string,
    style?: Phaser.Types.GameObjects.Text.TextStyle
  ): Phaser.GameObjects.Text {
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      ...style
    };

    return this.add.text(x, y, text, defaultStyle);
  }

  /**
   * 创建按钮
   */
  protected createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.rectangle(0, 0, width, height, 0x4ade80);
    bg.setStrokeStyle(3, 0x166534);
    container.add(bg);

    // 按钮文字
    const textObj = this.createText(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff'
    });
    textObj.setOrigin(0.5);
    container.add(textObj);

    // 交互
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x22c55e);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4ade80);
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x15803d);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x22c55e);
      callback();
    });

    return container;
  }

  /**
   * 场景销毁
   */
  shutdown(): void {
    this.onShutdown();
    this.gameEvents.removeAllListeners();
  }

  /**
   * 销毁回调（子类重写）
   */
  protected onShutdown(): void {
    // 子类实现
  }
}
