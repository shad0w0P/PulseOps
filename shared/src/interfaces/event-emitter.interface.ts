import { AutomationEvent } from '../types';

/**
 * Interface for services that emit automation events.
 * Implemented by the automation webhook emitter and the backend event bus.
 */
export interface IEventEmitter {
  emit(event: AutomationEvent): Promise<void>;
}
