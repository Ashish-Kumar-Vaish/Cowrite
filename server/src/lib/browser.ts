import { chromium, type Browser } from "playwright";
import { logger } from "../config/logger.js";

let browserPromise: Promise<Browser> | null = null;

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      })
      .catch((error) => {
        browserPromise = null;

        throw error;
      });
  }

  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;

    await browser.close();

    browserPromise = null;
    logger.info("Playwright browser closed");
  }
}
