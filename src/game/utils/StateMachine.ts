import { EntityState } from '@/types/index';

/**
 * 状态接口
 */
export interface IState<T> {
  enter(context: T): void;
  update(context: T, time: number, delta: number): void;
  exit(context: T): void;
}

/**
 * 有限状态机类
 */
export class StateMachine<T> {
  private states: Map<EntityState, IState<T>> = new Map();
  private currentState: IState<T> | null = null;
  private currentKey: EntityState | null = null;
  private context: T;

  constructor(context: T) {
    this.context = context;
  }

  public addState(key: EntityState, state: IState<T>): void {
    this.states.set(key, state);
  }

  public changeState(key: EntityState): void {
    if (this.currentKey === key) return;

    const nextState = this.states.get(key);
    if (!nextState) return;

    if (this.currentState) {
      this.currentState.exit(this.context);
    }

    this.currentKey = key;
    this.currentState = nextState;
    this.currentState.enter(this.context);
  }

  public update(time: number, delta: number): void {
    if (this.currentState) {
      this.currentState.update(this.context, time, delta);
    }
  }

  public getCurrentState(): EntityState | null {
    return this.currentKey;
  }
}
