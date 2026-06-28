import { Page } from 'playwright';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Page object for the Income Tax e-Filing portal.
 * Encapsulates all portal-specific selectors and navigation logic.
 *
 * Selector strategy: We use data-testid where available, then aria roles,
 * then CSS selectors as a fallback. Selectors may need updating if the
 * portal's HTML structure changes.
 */
export class TaxPortalBot {
  constructor(private readonly page: Page) {}

  /**
   * Navigate to the Income Tax portal login page.
   */
  async navigateToPortal(): Promise<void> {
    logger.info({ url: env.portalUrl }, 'Navigating to IT portal');
    await this.page.goto(env.portalUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    // Wait for the login form to be visible
    await this.page.waitForSelector('#panNumber, input[name="panNumber"]', {
      timeout: 15000,
    });
    logger.info('Portal login page loaded');
  }

  /**
   * Enter PAN number in the login form.
   */
  async enterPan(pan: string): Promise<void> {
    logger.info('Entering PAN number');
    const panInput = this.page.locator('#panNumber, input[name="panNumber"]');
    await panInput.fill(pan);
    // Click Continue to proceed to CAPTCHA/OTP
    const continueBtn = this.page.locator(
      'button:has-text("Continue"), button:has-text("continue")',
    );
    await continueBtn.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if a CAPTCHA is present on the page.
   */
  async isCaptchaPresent(): Promise<boolean> {
    try {
      const captchaEl = await this.page.$(
        '#captchaImg, img[alt*="captcha"], .captcha-image, #captchaCanvas',
      );
      return captchaEl !== null;
    } catch {
      return false;
    }
  }

  /**
   * Capture the CAPTCHA image as a base64 string.
   */
  async captureCaptchaImage(): Promise<string | null> {
    try {
      const captchaEl = await this.page.$(
        '#captchaImg, img[alt*="captcha"], .captcha-image, #captchaCanvas',
      );
      if (!captchaEl) return null;

      const screenshot = await captchaEl.screenshot({ type: 'png' });
      return screenshot.toString('base64');
    } catch (error) {
      logger.error({ error }, 'Failed to capture CAPTCHA image');
      return null;
    }
  }

  /**
   * Enter the CAPTCHA solution.
   */
  async enterCaptcha(captcha: string): Promise<void> {
    logger.info('Entering CAPTCHA solution');
    const captchaInput = this.page.locator(
      '#captchaText, input[name="captchaText"], input[placeholder*="captcha"]',
    );
    await captchaInput.fill(captcha);
  }

  /**
   * Submit the login form (after CAPTCHA entry).
   */
  async submitLogin(): Promise<void> {
    logger.info('Submitting login form');
    const submitBtn = this.page.locator(
      'button[type="submit"]:has-text("Login"), button:has-text("Login"), button:has-text("Submit")',
    );
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
  }

  /**
   * Check if the OTP page is displayed.
   */
  async isOtpPagePresent(): Promise<boolean> {
    try {
      const otpEl = await this.page.$(
        'input[name="otp"], #otp, input[placeholder*="OTP"], input[maxlength="6"]',
      );
      return otpEl !== null;
    } catch {
      return false;
    }
  }

  /**
   * Enter the OTP.
   */
  async enterOtp(otp: string): Promise<void> {
    logger.info('Entering OTP');
    const otpInput = this.page.locator(
      'input[name="otp"], #otp, input[placeholder*="OTP"], input[maxlength="6"]',
    );
    await otpInput.fill(otp);
  }

  /**
   * Submit OTP verification.
   */
  async submitOtp(): Promise<void> {
    logger.info('Submitting OTP');
    const verifyBtn = this.page.locator(
      'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Validate")',
    );
    await verifyBtn.click();
    await this.page.waitForTimeout(3000);
  }

  /**
   * Check if verification was successful (landed on dashboard or confirmation page).
   */
  async isVerificationSuccessful(): Promise<boolean> {
    try {
      // Look for elements that indicate successful login
      const success = await this.page.$(
        '.dashboard, .welcome-message, .user-profile, [class*="success"]',
      );
      return success !== null;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to credential generation page.
   * This is portal-specific and may need customization.
   */
  async navigateToCredentialGeneration(): Promise<void> {
    logger.info('Navigating to credential generation');
    // Portal-specific navigation — will be customized based on actual portal flow
    await this.page.waitForTimeout(2000);
  }

  /**
   * Extract generated credentials from the portal.
   * Returns userId and password if found.
   */
  async extractCredentials(): Promise<{ userId: string; password: string } | null> {
    try {
      // These selectors are placeholders — actual selectors depend on the portal page
      const userIdEl = await this.page.$('#userId, .user-id, [data-testid="userId"]');
      const passwordEl = await this.page.$('#password, .password, [data-testid="password"]');

      if (!userIdEl || !passwordEl) {
        logger.warn('Could not find credential elements on page');
        return null;
      }

      const userId = (await userIdEl.textContent()) || '';
      const password = (await passwordEl.textContent()) || '';

      if (!userId || !password) return null;

      return { userId: userId.trim(), password: password.trim() };
    } catch (error) {
      logger.error({ error }, 'Failed to extract credentials');
      return null;
    }
  }

  /**
   * Check for error messages on the page.
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorEl = await this.page.$(
        '.error-message, .alert-danger, [class*="error"], [role="alert"]',
      );
      if (errorEl) {
        return (await errorEl.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get the current page URL.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take a full page screenshot.
   */
  async fullScreenshot(): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, type: 'png' });
  }
}
