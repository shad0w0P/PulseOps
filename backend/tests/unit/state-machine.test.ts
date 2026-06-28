import { JobState, VALID_TRANSITIONS, TERMINAL_STATES } from 'shared';
import { JobStateMachine } from '../../src/state-machine/job-state-machine';

describe('JobStateMachine', () => {
  describe('initialization', () => {
    it('should start in CREATED state by default', () => {
      const fsm = new JobStateMachine('test-job-1');
      expect(fsm.getCurrentState()).toBe(JobState.CREATED);
    });

    it('should accept a custom initial state', () => {
      const fsm = new JobStateMachine('test-job-2', JobState.WAITING_FOR_OTP);
      expect(fsm.getCurrentState()).toBe(JobState.WAITING_FOR_OTP);
    });
  });

  describe('valid transitions', () => {
    it('should transition CREATED → STARTING_BROWSER', () => {
      const fsm = new JobStateMachine('test-job');
      expect(fsm.transition(JobState.STARTING_BROWSER)).toBe(true);
      expect(fsm.getCurrentState()).toBe(JobState.STARTING_BROWSER);
    });

    it('should transition through the happy path', () => {
      const fsm = new JobStateMachine('test-job');
      const happyPath = [
        JobState.STARTING_BROWSER,
        JobState.OPENING_PORTAL,
        JobState.ENTERING_PAN,
        JobState.WAITING_FOR_CAPTCHA,
        JobState.CAPTCHA_SUBMITTED,
        JobState.WAITING_FOR_OTP,
        JobState.OTP_RECEIVED,
        JobState.VERIFYING_OTP,
        JobState.GENERATING_CREDENTIALS,
        JobState.SUCCESS,
      ];

      for (const state of happyPath) {
        expect(fsm.transition(state)).toBe(true);
      }
      expect(fsm.getCurrentState()).toBe(JobState.SUCCESS);
    });

    it('should allow FAILED from any non-terminal active state', () => {
      const statesThatCanFail = [
        JobState.STARTING_BROWSER,
        JobState.OPENING_PORTAL,
        JobState.ENTERING_PAN,
        JobState.WAITING_FOR_CAPTCHA,
        JobState.CAPTCHA_SUBMITTED,
        JobState.VERIFYING_OTP,
        JobState.GENERATING_CREDENTIALS,
      ];

      for (const state of statesThatCanFail) {
        const fsm = new JobStateMachine('test-job', state);
        expect(fsm.canTransition(JobState.FAILED)).toBe(true);
      }
    });

    it('should allow CANCELLED only from WAITING_FOR_OTP', () => {
      const fsm = new JobStateMachine('test-job', JobState.WAITING_FOR_OTP);
      expect(fsm.canTransition(JobState.CANCELLED)).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('should reject CREATED → SUCCESS', () => {
      const fsm = new JobStateMachine('test-job');
      expect(fsm.canTransition(JobState.SUCCESS)).toBe(false);
      expect(() => fsm.transition(JobState.SUCCESS)).toThrow();
    });

    it('should reject transitions from terminal states', () => {
      for (const terminal of TERMINAL_STATES) {
        const fsm = new JobStateMachine('test-job', terminal);
        expect(fsm.isTerminal()).toBe(true);
        expect(fsm.canTransition(JobState.CREATED)).toBe(false);
      }
    });

    it('should reject CANCELLED from non-OTP-waiting states', () => {
      const states = [
        JobState.CREATED,
        JobState.STARTING_BROWSER,
        JobState.OPENING_PORTAL,
        JobState.ENTERING_PAN,
      ];

      for (const state of states) {
        const fsm = new JobStateMachine('test-job', state);
        expect(fsm.canTransition(JobState.CANCELLED)).toBe(false);
      }
    });

    it('should reject skipping states', () => {
      const fsm = new JobStateMachine('test-job');
      // Cannot skip from CREATED to ENTERING_PAN
      expect(fsm.canTransition(JobState.ENTERING_PAN)).toBe(false);
    });
  });

  describe('terminal state detection', () => {
    it('should identify SUCCESS as terminal', () => {
      const fsm = new JobStateMachine('test-job', JobState.SUCCESS);
      expect(fsm.isTerminal()).toBe(true);
    });

    it('should identify FAILED as terminal', () => {
      const fsm = new JobStateMachine('test-job', JobState.FAILED);
      expect(fsm.isTerminal()).toBe(true);
    });

    it('should identify CANCELLED as terminal', () => {
      const fsm = new JobStateMachine('test-job', JobState.CANCELLED);
      expect(fsm.isTerminal()).toBe(true);
    });

    it('should not identify active states as terminal', () => {
      const fsm = new JobStateMachine('test-job', JobState.WAITING_FOR_OTP);
      expect(fsm.isTerminal()).toBe(false);
    });
  });

  describe('transition completeness', () => {
    it('should have transitions defined for all states', () => {
      const allStates = Object.values(JobState);
      for (const state of allStates) {
        expect(VALID_TRANSITIONS[state]).toBeDefined();
      }
    });

    it('terminal states should have empty transition arrays', () => {
      for (const terminal of TERMINAL_STATES) {
        expect(VALID_TRANSITIONS[terminal]).toEqual([]);
      }
    });
  });
});
