import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

setDefaultTimeout(30000);

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
  const sid = await page.locator('[data-testid="session-code-display"]').textContent();
  console.log(`[TEST] Writing card in session ${sid}: "${text}" in ${category}`);
  
  const catBtn = page.locator(`[data-testid="btn-category-${category.toLowerCase()}"]`);
  await catBtn.click({ force: true });
  
  const input = page.locator('[data-testid="entry-input"]');
  await input.focus();
  await input.fill(text);
  
  const submitBtn = page.locator('[data-testid="btn-submit-entry"]');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  
  // Use dispatchEvent to ensure the click reaches the React handler if hit-testing is weird
  console.log(`[TEST] Clicking submit button for card`);
  await submitBtn.dispatchEvent('click');
});

When('ich den Blur deaktiviere', async function () {
  const btn = page.locator('[data-testid="btn-toggle-blur"]');
  console.log('[TEST] Clicking toggle blur button');
  await btn.dispatchEvent('click');
});

When('ich für die Karte {string} vote', async function (text) {
  const card = page.locator('[data-testid="retro-card"]').filter({ hasText: text });
  try {
    await card.waitFor({ state: 'visible', timeout: 10000 });
  } catch (err) {
    console.log(`[DIAGNOSTIC] Timeout waiting for card: "${text}"`);
    const cardsCount = await page.locator('[data-testid="retro-card"]').count();
    console.log(`[DIAGNOSTIC] Visible cards count: ${cardsCount}`);
    
    // Take and store screenshot in current dir for debugging
    const screenshotPath = path.join(process.cwd(), `bdd-failure-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`[DIAGNOSTIC] Screenshot saved to: ${screenshotPath}`);
    
    // Save board HTML to file
    const htmlPath = path.join(process.cwd(), `bdd-failure-${Date.now()}.html`);
    const boardHtml = await page.innerHTML('main');
    fs.writeFileSync(htmlPath, boardHtml);
    console.log(`[DIAGNOSTIC] Board HTML saved to: ${htmlPath}`);
    
    throw err;
  }
  
  console.log(`[TEST] Clicking vote button for card: "${text}"`);
  await card.locator('[data-testid^="btn-vote-"]').dispatchEvent('click');
});

When('ich den Gewinner ermittle und mit {string} starte', async function (phaseName) {
  const drillBtn = page.locator('[data-testid="drill-button"]');
  try {
    await drillBtn.waitFor({ state: 'visible', timeout: 15000 });
  } catch (err) {
    console.log(`[DIAGNOSTIC] Timeout waiting for drill-button for phase: ${phaseName}`);
    
    // Save board HTML to file
    const htmlPath = path.join(process.cwd(), `bdd-drill-failure-${Date.now()}.html`);
    const boardHtml = await page.innerHTML('main');
    fs.writeFileSync(htmlPath, boardHtml);
    console.log(`[DIAGNOSTIC] Board HTML saved to: ${htmlPath}`);
    
    throw err;
  }
  console.log(`[TEST] Clicking drill button for phase: ${phaseName}`);
  await drillBtn.dispatchEvent('click');
});

Then('sollte die Sidebar den Anker {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  try {
    await expect(sidebar).toContainText(text, { timeout: 10000 });
  } catch (err) {
    console.log(`[DIAGNOSTIC] Sidebar missing text: "${text}"`);
    
    // Save board HTML to file
    const htmlPath = path.join(process.cwd(), `bdd-sidebar-failure-${Date.now()}.html`);
    const boardHtml = await page.innerHTML('main');
    fs.writeFileSync(htmlPath, boardHtml);
    console.log(`[DIAGNOSTIC] Board HTML saved to: ${htmlPath}`);
    
    throw err;
  }
});

When('ich die Ursache {string} eingebe', async function (text) {
  const input = page.locator('[data-testid="entry-input"]');
  await input.fill(text);
  
  const submitBtn = page.locator('[data-testid="btn-submit-entry"]');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  console.log(`[TEST] Clicking submit button for cause: "${text}"`);
  await submitBtn.dispatchEvent('click');
});

When('ich für die Ursache {string} vote', async function (text) {
  const card = page.locator('[data-testid="retro-card"]').filter({ hasText: text });
  await card.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[TEST] Clicking vote button for cause: "${text}"`);
  await card.locator('[data-testid^="btn-vote-"]').dispatchEvent('click');
});

When('ich den Ursachen-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  const drillBtn = page.locator('[data-testid="drill-button"]');
  await drillBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[TEST] Clicking drill button for phase (Ursache): ${phaseName}`);
  await drillBtn.dispatchEvent('click');
});

Then('sollte die Sidebar Anker und Ursache {string} zeigen', async function (text) {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText(text, { timeout: 10000 });
});

When('ich die Lösung {string} eingebe', async function (text) {
  const input = page.locator('[data-testid="entry-input"]');
  await input.fill(text);
  
  const submitBtn = page.locator('[data-testid="btn-submit-entry"]');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  console.log(`[TEST] Clicking submit button for solution: "${text}"`);
  await submitBtn.dispatchEvent('click');
});

When('ich für die Lösung {string} vote', async function (text) {
  const card = page.locator('[data-testid="retro-card"]').filter({ hasText: text });
  await card.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[TEST] Clicking vote button for solution: "${text}"`);
  await card.locator('[data-testid^="btn-vote-"]').dispatchEvent('click');
});

When('ich den Lösungs-Gewinner ermittle und mit {string} starte', async function (phaseName) {
  const drillBtn = page.locator('[data-testid="drill-button"]');
  await drillBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[TEST] Clicking drill button for phase (Lösung): ${phaseName}`);
  await drillBtn.dispatchEvent('click');
});

Then('sollte die Sidebar den vollen Kontext-Pfad ⚓ 🔍 💡 zeigen', async function () {
  const sidebar = page.locator('[data-testid="sidebar-context"]');
  await expect(sidebar).toContainText('⚓', { timeout: 10000 });
  await expect(sidebar).toContainText('🔍', { timeout: 10000 });
  await expect(sidebar).toContainText('💡', { timeout: 10000 });
});

When('ich die Massnahme {string} eingebe', async function (text) {
  const input = page.locator('[data-testid="entry-input"]');
  await input.fill(text);
  
  const submitBtn = page.locator('[data-testid="btn-submit-entry"]');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  console.log(`[TEST] Clicking submit button for measure: "${text}"`);
  await submitBtn.dispatchEvent('click');
});

When('ich für die Massnahme {string} vote', async function (text) {
  const card = page.locator('[data-testid="retro-card"]').filter({ hasText: text });
  await card.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[TEST] Clicking vote button for measure: "${text}"`);
  await card.locator('[data-testid^="btn-vote-"]').dispatchEvent('click');
});

Then('sollte die Karte {string} als finaler Winner markiert sein', async function (text) {
  await expect(page.locator('[data-testid="winner-trophy"]')).toBeVisible({ timeout: 10000 });
  const card = page.locator(`.bg-white:has-text("${text}")`);
  await expect(card).toBeVisible({ timeout: 10000 });
});
