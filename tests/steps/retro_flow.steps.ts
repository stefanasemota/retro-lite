import { Given, When, Then } from '@cucumber/cucumber';
import { expect, chromium, Page, Browser } from '@playwright/test';

let browser: Browser;
let page: Page;

Given('I am on the start page in test mode', async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  // Using localhost:5173 as default Vite port, adding testMode=true
  await page.goto('http://localhost:5173?testMode=true');
});

When('I create a new session named {string}', async function (name: string) {
  await page.click('[data-testid="host-session-button"]');
  await page.fill('[data-testid="session-name-input"]', name);
  await page.click('[data-testid="confirm-create-button"]');
  // Wait for session to be created (ID appears)
  await expect(page.locator('text=Live')).toBeVisible();
});

When('I enter {string} in the category {string}', async function (text: string, category: string) {
  // Select category if in Phase 1
  const catBtn = page.locator(`button:has-text("${category}")`);
  if (await catBtn.isVisible()) {
    await catBtn.click();
  }
  await page.fill('[data-testid="entry-textarea"]', text);
  await page.click('[data-testid="add-entry-button"]');
});

When('I reveal the board', async function () {
  // In our toggleBlur implementation, this is what reveals
  await page.click('button:has(svg.lucide-eye-off)'); 
});

When('I vote for the card {string}', async function (text: string) {
  const card = page.locator(`[data-testid="entry-text"]:has-text("${text}")`).locator('..');
  await card.locator('[data-testid="vote-button"]').click();
});

When('I identify the winner and start {string}', async function (action: string) {
  await page.click(`[data-testid="drill-button"]:has-text("${action}")`);
});

Then('the sidebar should show the anchor {string}', async function (text: string) {
  const sidebarText = page.locator('[data-testid="sidebar-step-text"]').first();
  await expect(sidebarText).toContainText(text);
});

When('I enter the cause {string}', async function (cause: string) {
  await page.fill('[data-testid="entry-textarea"]', cause);
  await page.click('[data-testid="add-entry-button"]');
});

When('I vote for the cause {string}', async function (cause: string) {
  const card = page.locator(`[data-testid="entry-text"]:has-text("${cause}")`).locator('..');
  await card.locator('[data-testid="vote-button"]').click();
});

When('I identifying the cause winner and start {string}', async function (action: string) {
  await page.click(`[data-testid="drill-button"]:has-text("${action}")`);
});

Then('the sidebar should show anchor and cause {string}', async function (cause: string) {
  const steps = page.locator('[data-testid="sidebar-step-text"]');
  await expect(steps.nth(1)).toContainText(cause);
});

When('I enter the solution {string}', async function (solution: string) {
  await page.fill('[data-testid="entry-textarea"]', solution);
  await page.click('[data-testid="add-entry-button"]');
});

When('I vote for the solution {string}', async function (solution: string) {
  const card = page.locator(`[data-testid="entry-text"]:has-text("${solution}")`).locator('..');
  await card.locator('[data-testid="vote-button"]').click();
});

When('I identify the solution winner and start {string}', async function (action: string) {
  await page.click(`[data-testid="drill-button"]:has-text("${action}")`);
});

Then('the sidebar should show the full context trail ⚓ 🔍 💡', async function () {
  const steps = page.locator('[data-testid="sidebar-step"]');
  await expect(steps).toHaveCount(3);
  await browser.close();
});
