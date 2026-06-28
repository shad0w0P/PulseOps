import { JobState, VALID_TRANSITIONS, EventLevel } from '@anas/shared';
import { BrowserManager } from '../bot/browser-manager';
import { TaxPortalBot } from '../bot/tax-portal.bot';
import { webhookEmitter } from '../services/webhook-emitter.service';
import { logger } from '../utils/logger';

export interface FSMContext {
  jobId: string;
  pan: string;
  requestId: string;
  browserManager: BrowserManager;
  bot?: TaxPortalBot;
  captchaSolution?: string;
  otpValue?: string;
  error?: string;
  generatedCredentials?: { userId: string; password: string };
}

export abstract class BaseStateHandler {
  abstract readonly state: JobState;
  
  /**
   * Run the state business logic.
   * Returns the next state to transition to, or null if pausing/ended.
   */
  abstract handle(context: FSMContext, fsm: AutomationFSM): Promise<JobState | null>;
}

export class AutomationFSM {
  private currentState: JobState = JobState.CREATED;
  private handlers = new Map<JobState, BaseStateHandler>();

  constructor(
    private readonly context: FSMContext
  ) {}

  registerHandler(handler: BaseStateHandler): void {
    this.handlers.set(handler.state, handler);
  }

  getCurrentState(): JobState {
    return this.currentState;
  }

  getContext(): FSMContext {
    return this.context;
  }

  /**
   * Transition to a new state and emit a webhook event.
   */
  async transitionTo(
    nextState: JobState,
    step: string,
    message: string,
    metadata?: Record<string, any>,
    credentials?: { userId: string; password: string }
  ): Promise<void> {
    const fromState = this.currentState;
    
    // Validate transition
    const allowed = VALID_TRANSITIONS[fromState];
    if (nextState !== JobState.FAILED && nextState !== JobState.CANCELLED && (!allowed || !allowed.includes(nextState))) {
      const errorMsg = `Invalid state transition requested: ${fromState} -> ${nextState}`;
      logger.error({ jobId: this.context.jobId, fromState, nextState }, errorMsg);
      throw new Error(errorMsg);
    }

    this.currentState = nextState;
    logger.info({ jobId: this.context.jobId, fromState, nextState }, `Transitioning state: ${fromState} -> ${nextState}`);

    // Emit event to Backend
    await webhookEmitter.emit({
      jobId: this.context.jobId,
      requestId: this.context.requestId,
      level: nextState === JobState.FAILED
        ? EventLevel.ERROR
        : nextState === JobState.SUCCESS
        ? EventLevel.SUCCESS
        : EventLevel.INFO,
      phase: nextState,
      step,
      message,
      metadata,
      previousState: fromState,
      credentials,
    });
  }

  /**
   * Start executing the FSM. Starts from current state and runs handlers sequentially.
   */
  async run(): Promise<void> {
    while (this.currentState !== JobState.SUCCESS && this.currentState !== JobState.FAILED && this.currentState !== JobState.CANCELLED) {
      const handler = this.handlers.get(this.currentState);
      if (!handler) {
        throw new Error(`No handler registered for state: ${this.currentState}`);
      }

      try {
        const nextState = await handler.handle(this.context, this);
        if (nextState === null) {
          // Execution paused (waiting for OTP or CAPTCHA input)
          logger.info({ jobId: this.context.jobId, state: this.currentState }, 'FSM Execution paused/stopped');
          break;
        }
        await this.transitionTo(
          nextState,
          `Transition to ${nextState}`,
          `Successfully transitioned to state ${nextState}`,
          undefined,
          nextState === JobState.SUCCESS ? this.context.generatedCredentials : undefined
        );
      } catch (error: any) {
        logger.error({ jobId: this.context.jobId, state: this.currentState, error: error.message }, 'Error in FSM execution');
        this.context.error = error.message;
        
        // Transition to FAILED state
        await this.transitionTo(
          JobState.FAILED,
          'Automation failed',
          `Automation execution failed in state ${this.currentState}: ${error.message}`
        );
        break;
      }
    }

    // Clean up browser if terminal state reached
    if (this.isTerminal()) {
      await this.context.browserManager.close();
      webhookEmitter.resetJob(this.context.jobId);
    }
  }

  /**
   * Resume FSM execution after external input (OTP / CAPTCHA).
   */
  async resume(): Promise<void> {
    logger.info({ jobId: this.context.jobId, state: this.currentState }, 'Resuming FSM execution');
    await this.run();
  }

  isTerminal(): boolean {
    return (
      this.currentState === JobState.SUCCESS ||
      this.currentState === JobState.FAILED ||
      this.currentState === JobState.CANCELLED
    );
  }
}
