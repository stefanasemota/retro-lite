import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

let browser: Browser;
let page: Page;

Before(async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
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
  await page.fill('[data-testid="session-name-input"]', sessionName);
  await page.click('[data-testid="btn-create-session"]');
});

When('ich eine Karte {string} in der Kategorie {string} schreibe', async function (text, category) {
  await page.click(`[data-testid="btn-category-${category.toLowerCase()}"]`);
  await page.fill('[data-testid="entry-input"]', text);
  await page.click('[data-testid="btn-submit-entry"]');
});

When('ich den Blur deaktiviere', async function () {
  await page.click('[data-testid="btn-toggle-blur"]');
});

When('ich für die Karte {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`);
});

When('ich den Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]');
});

Then('sollte die Sidebar den Anker {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText(text);
});

When('ich die Ursache {string} eingebe', async function (text) {
  await page.fill('[data-testid="entry-input"]', text);
  await page.click('[data-testid="btn-submit-entry"]');
});

When('ich für die Ursache {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`);
});

When('ich den Ursachen-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]');
});

Then('sollte die Sidebar Anker und Ursache {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText(text);
});

When('ich die Lösung {string} eingebe', async function (text) {
  await page.fill('[data-testid="entry-input"]', text);
  await page.click('[data-testid="btn-submit-entry"]');
});

When('ich für die Lösung {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`);
});

When('ich den Lösungs-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  await page.click('[data-testid="drill-button"]');
});

Then('sollte die Sidebar den vollen Kontext-Pfad ⚓ 🔍 💡 zeigen', async function () {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText('⚓');
  await expect(sidebar).toContainText('🔍');
  await expect(sidebar).toContainText('💡');
});

When('ich die Massnahme {string} eingebe', async function (text) {
  await page.fill('[data-testid="entry-input"]', text);
  await page.click('[data-testid="btn-submit-entry"]');
});

When('ich für die Massnahme {string} vote', async function (text) {
  await page.click(`[data-testid="btn-vote-${text}"]`);
});

Then('sollte die Karte {string} als finaler Winner markiert sein', async function (text) {
  const card = page.locator(`.bg-white:has-text("${text}")`);
  const trophy = card.locator('.lucide-trophy'); // Trophy icon via class
  await expect(trophy).toBeVisible();
});
