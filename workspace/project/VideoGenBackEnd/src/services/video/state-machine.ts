import { injectable } from 'tsyringe';
import { GenerationStatus, StateHooks } from './types';
import { InvalidStatusTransitionError } from './errors';

// Valid state transitions
const VALID_TRANSITIONS: Record<GenerationStatus, GenerationStatus[]> = {
  [GenerationStatus.QUEUED]: [GenerationStatus.PREPARING, GenerationStatus.FAILED],
  [GenerationStatus.PREPARING]: [GenerationStatus.GENERATING, GenerationStatus.FAILED],
  [GenerationStatus.GENERATING]: [GenerationStatus.PROCESSING, GenerationStatus.FAILED],
  [GenerationStatus.PROCESSING]: [GenerationStatus.COMPLETED, GenerationStatus.FAILED],
  [GenerationStatus.COMPLETED]: [], // Terminal state
  [GenerationStatus.FAILED]: []    // Terminal state
};

@injectable()
export class VideoStateMachine {
  private currentState: GenerationStatus;
  private hooks: StateHooks;

  constructor(
    generationId: string,
    initialState: GenerationStatus,
    hooks: StateHooks
  ) {
    this.currentState = initialState;
    this.hooks = hooks;
  }

  getCurrentState(): GenerationStatus {
    return this.currentState;
  }

  async transitionTo(to: GenerationStatus): Promise<void> {
    const from = this.currentState;
    if (!this.isValidTransition(from, to)) {
      throw new InvalidStatusTransitionError(from, to);
    }

    try {
      // Execute before transition hook if exists
      if (this.hooks.beforeTransition) {
        await this.hooks.beforeTransition(from, to);
      }

      this.currentState = to;

      // Execute after transition hook if exists
      if (this.hooks.afterTransition) {
        await this.hooks.afterTransition(from, to);
      }
    } catch (error) {
      // Execute error hook if exists
      if (this.hooks.onError) {
        const normalizedError = error instanceof Error ? error : new Error('Unknown error occurred');
        await this.hooks.onError(normalizedError, from, to);
      }
      throw error;
    }
  }

  private isValidTransition(from: GenerationStatus, to: GenerationStatus): boolean {
    const validNextStates = VALID_TRANSITIONS[from];
    return validNextStates.includes(to);
  }

  getValidTransitions(): GenerationStatus[] {
    return VALID_TRANSITIONS[this.currentState] || [];
  }

  isTerminal(): boolean {
    return VALID_TRANSITIONS[this.currentState].length === 0;
  }
} 