import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

setDefaultTimeout(10000);

let browser: Browser;
let page: Page;

Before(async function () {
  browser = await chromium.launch({ headless: process.env.CI ? true : false });
  page = await browser.newPage();
  
  // Pipe browser console to terminal for debugging
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
});

After(async function (scenario) {
  // Collect coverage if available
  const coverage = await page.evaluate('window.__coverage__');
  if (coverage) {
    const coverageDir = path.join(process.cwd(), '.nyc_output');
    if (!fs.existsSync(coverageDir)) fs.mkdirSync(coverageDir);
    fs.writeFileSync(
      path.join(coverageDir, `coverage-${scenario.pickle.id}.json`),
      JSON.stringify(coverage)
    );
  }
  await browser.close();
});

Given('ich bin auf der Startseite im Test-Modus', async function () {
  await page.goto('http://localhost:9003?testMode=true&role=admin');
});

When('ich eine neue Session namens {string} erstelle', async function (sessionName) {
  await page.click('[data-testid="host-session-button"]');
  const input = page.locator('[data-testid="session-name-input"]');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  
  // Clear pre-filled value
  await input.fill('');
  await input.type(sessionName, { delay: 50 });
  
  const submitBtn = page.locator('[data-testid="btn-create-session"]');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  
  console.log(`[TEST] Clicking create button for: ${sessionName}`);
  await submitBtn.click();
  
  // Wait for transition to board
  await page.waitForSelector('[data-testid="entry-input"]', { state: 'visible', timeout: 5000 });
});

When('ich eine Karte {string} in der Kategorie {string} schreibe', async function (text, category) {
  await page.click(`[data-testid="btn-category-${category.toLowerCase()}"]`, { force: true });
  await page.type('[data-testid="entry-input"]', text, { delay: 20 });
  await page.click('[data-testid="btn-submit-entry"]', { force: true });
});

When('ich den Blur deaktiviere', async function () {
  await page.click('[data-testid="btn-toggle-blur"]', { force: true });
});

When('ich für die Karte {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`, { force: true });
});

When('ich den Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]', { force: true });
});

Then('sollte die Sidebar den Anker {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText(text);
});

When('ich die Ursache {string} eingebe', async function (text) {
  await page.type('[data-testid="entry-input"]', text, { delay: 20 });
  await page.click('[data-testid="btn-submit-entry"]', { force: true });
});

When('ich für die Ursache {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`, { force: true });
});

When('ich den Ursachen-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]', { force: true });
});

Then('sollte die Sidebar Anker und Ursache {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText(text);
});

When('ich die Lösung {string} eingebe', async function (text) {
  await page.type('[data-testid="entry-input"]', text, { delay: 20 });
  await page.click('[data-testid="btn-submit-entry"]', { force: true });
});

When('ich für die Lösung {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`, { force: true });
});

When('ich den Lösungs-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]', { force: true });
});

Then('sollte die Sidebar den vollen Kontext-Pfad ⚓ 🔍 💡 zeigen', async function () {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText('⚓');
  await expect(sidebar).toContainText('🔍');
  await expect(sidebar).toContainText('💡');
});

When('ich die Massnahme {string} eingebe', async function (text) {
  await page.type('[data-testid="entry-input"]', text, { delay: 20 });
  await page.click('[data-testid="btn-submit-entry"]', { force: true });
});

When('ich für die Massnahme {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`, { force: true });
});

Then('sollte die Karte {string} als finaler Winner markiert sein', async function (text) {
  await expect(page.locator('[data-testid="winner-trophy"]')).toBeVisible();
  const card = page.locator(`.bg-white:has-text("${text}")`);
  await expect(card).toBeVisible();
});
