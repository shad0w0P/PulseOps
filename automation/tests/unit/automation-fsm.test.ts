import { JobState } from '@anas/shared';
import { AutomationFSM, FSMContext, BaseStateHandler } from '../../src/state-machine/automation-fsm';
import { BrowserManager } from '../../src/bot/browser-manager';

// Mock Webhook Emitter to avoid sending real HTTP requests
jest.mock('../../src/services/webhook-emitter.service', () => ({
  webhookEmitter: {
    emit: jest.fn().mockResolvedValue(undefined),
    resetJob: jest.fn(),
  },
}));

class MockCreatedHandler extends BaseStateHandler {
  readonly state = JobState.CREATED;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.STARTING_BROWSER;
  }
}

class MockStartingBrowserHandler extends BaseStateHandler {
  readonly state = JobState.STARTING_BROWSER;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.OPENING_PORTAL;
  }
}

class MockOpeningPortalHandler extends BaseStateHandler {
  readonly state = JobState.OPENING_PORTAL;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.ENTERING_PAN;
  }
}

class MockEnteringPanHandler extends BaseStateHandler {
  readonly state = JobState.ENTERING_PAN;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.WAITING_FOR_CAPTCHA;
  }
}

class MockWaitingCaptchaHandler extends BaseStateHandler {
  readonly state = JobState.WAITING_FOR_CAPTCHA;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.CAPTCHA_SUBMITTED;
  }
}

class MockCaptchaSubmittedHandler extends BaseStateHandler {
  readonly state = JobState.CAPTCHA_SUBMITTED;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.WAITING_FOR_OTP;
  }
}

class MockWaitingOtpHandler extends BaseStateHandler {
  readonly state = JobState.WAITING_FOR_OTP;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.OTP_RECEIVED;
  }
}

class MockOtpReceivedHandler extends BaseStateHandler {
  readonly state = JobState.OTP_RECEIVED;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.VERIFYING_OTP;
  }
}

class MockVerifyingOtpHandler extends BaseStateHandler {
  readonly state = JobState.VERIFYING_OTP;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.GENERATING_CREDENTIALS;
  }
}

class MockGeneratingCredentialsHandler extends BaseStateHandler {
  readonly state = JobState.GENERATING_CREDENTIALS;
  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return JobState.SUCCESS;
  }
}

describe('AutomationFSM', () => {
  let context: FSMContext;
  let browserManager: BrowserManager;

  beforeEach(() => {
    browserManager = {
      launch: jest.fn(),
      getPage: jest.fn(),
      screenshot: jest.fn(),
      elementScreenshot: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
      isOpen: jest.fn().mockReturnValue(false),
    } as any;

    context = {
      jobId: 'test-job-id',
      pan: 'ABCDE1234F',
      requestId: 'test-request-id',
      browserManager,
    };
  });

  it('should initialize and register handlers correctly', () => {
    const fsm = new AutomationFSM(context);
    const mockHandler = new MockCreatedHandler();
    fsm.registerHandler(mockHandler);
    expect(fsm.getCurrentState()).toBe(JobState.CREATED);
  });

  it('should transition and execute states correctly until SUCCESS', async () => {
    const fsm = new AutomationFSM(context);
    fsm.registerHandler(new MockCreatedHandler());
    fsm.registerHandler(new MockStartingBrowserHandler());
    fsm.registerHandler(new MockOpeningPortalHandler());
    fsm.registerHandler(new MockEnteringPanHandler());
    fsm.registerHandler(new MockWaitingCaptchaHandler());
    fsm.registerHandler(new MockCaptchaSubmittedHandler());
    fsm.registerHandler(new MockWaitingOtpHandler());
    fsm.registerHandler(new MockOtpReceivedHandler());
    fsm.registerHandler(new MockVerifyingOtpHandler());
    fsm.registerHandler(new MockGeneratingCredentialsHandler());

    await fsm.run();

    expect(fsm.getCurrentState()).toBe(JobState.SUCCESS);
    expect(browserManager.close).toHaveBeenCalledTimes(1);
  });
});
