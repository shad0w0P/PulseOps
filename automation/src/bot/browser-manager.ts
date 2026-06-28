import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Manages Playwright browser lifecycle.
 * Each job gets its own browser instance for isolation.
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Launch a new Chromium browser instance.
   */
  async launch(): Promise<Page> {
    logger.info({ headless: env.headless }, 'Launching browser');

    this.browser = await chromium.launch({
      headless: env.headless,
      slowMo: env.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    });

    this.page = await this.context.newPage();

    logger.info('Browser launched successfully');
    return this.page;
  }

  /**
   * Get the current page. Throws if browser is not launched.
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }
    return this.page;
  }

  /**
   * Take a screenshot of the current page.
   * Used for CAPTCHA capture and debugging.
   */
  async screenshot(): Promise<Buffer> {
    const page = this.getPage();
    return page.screenshot({ type: 'png' });
  }

  /**
   * Take a screenshot of a specific element.
   */
  async elementScreenshot(selector: string): Promise<Buffer | null> {
    const page = this.getPage();
    try {
      const element = await page.$(selector);
      if (!element) return null;
      return element.screenshot({ type: 'png' });
    } catch (error) {
      logger.warn({ error, selector }, 'Failed to capture element screenshot');
      return null;
    }
  }

  /**
   * Close the browser and clean up all resources.
   * Always safe to call, even if browser was never launched.
   */
  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      if (this.context) {
        await this.context.close().catch(() => {});
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
      logger.info('Browser closed');
    } catch (error) {
      logger.error({ error }, 'Error closing browser');
    }
  }

  /**
   * Check if the browser is currently open.
   */
  isOpen(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }
}
