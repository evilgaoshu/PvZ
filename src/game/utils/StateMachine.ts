import { EntityState } from '@/types/index';

/**
 * 状态接口
 */
export interface IState {
  enter(): void;
  update(time: number, delta: number): void;
  exit(): void;
}

/**
 * 有限状态机类
 */
export class StateMachine {
  private states: Map<EntityState, IState> = new Map();
  private currentState: IState | null = null;
  private currentKey: EntityState | null = null;

  public addState(key: EntityState, state: IState): void {
    this.states.set(key, state);
  }

  public changeState(key: EntityState): void {
    if (this.currentKey === key) return;

    const nextState = this.states.get(key);
    if (!nextState) return;

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentKey = key;
    this.currentState = nextState;
    this.currentState.enter();
  }

  public update(time: number, delta: number): void {
    if (this.currentState) {
      this.currentState.update(time, delta);
    }
  }

  public getCurrentState(): EntityState | null {
    return this.currentKey;
  }
}
