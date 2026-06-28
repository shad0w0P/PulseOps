import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4 identifier.
 * Centralized so the generation strategy can be changed in one place.
 */
export function generateId(): string {
  return uuidv4();
}
