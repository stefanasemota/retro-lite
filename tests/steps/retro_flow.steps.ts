import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';

let browser: Browser;
let adminPage: Page;
let participantPage: Page;

Before(async function () {
  browser = await chromium.launch({ headless: true });
  adminPage = await browser.newPage();
  participantPage = await browser.newPage();
});

After(async function () {
  await browser.close();
});

Given('Stephan erstellt eine neue Session {string}', async function (sessionName) {
  // Wir nutzen den testMode=true, um Auth zu mocken
  // Port 9003 wie in der Anforderung
  await adminPage.goto(`http://localhost:9003?testMode=true&role=admin`);
  await adminPage.fill('[data-testid="session-name-input"]', sessionName);
  await adminPage.click('[data-testid="btn-create-session"]');
});

Given('Michael tritt der Session {string} mit dem Code bei', async function (sessionName) {
  const code = await adminPage.innerText('[data-testid="session-code-display"]');
  await participantPage.goto(`http://localhost:9003?testMode=true&role=participant`);
  await participantPage.fill('[data-testid="join-code-input"]', code);
  await participantPage.click('[data-testid="btn-join-session"]');
});

When('Michael eine Karte {string} in {string} schreibt', async function (text, category) {
  await participantPage.fill('[data-testid="entry-input"]', text);
  await participantPage.click(`[data-testid="btn-category-${category.toLowerCase()}"]`);
  await participantPage.click('[data-testid="btn-submit-entry"]');
});

When('Stephan den Blur deaktiviert', async function () {
  await adminPage.click('[data-testid="btn-toggle-blur"]');
});

When('beide für die Karte {string} voten', async function (text) {
  await adminPage.click(`[data-testid="btn-vote-${text}"]`);
  await participantPage.click(`[data-testid="btn-vote-${text}"]`);
});

Then('sieht Stephan den Button {string} auf der Karte', async function (buttonText) {
  const btn = adminPage.locator(`button:has-text("${buttonText}")`);
  await expect(btn).toBeVisible();
});

When('Stephan auf {string} klickt', async function (action) {
  await adminPage.click(`button:has-text("${action}")`);
});

Then('wechselt die Ansicht für Michael automatisch zu {string}', async function (phaseName) {
  const header = participantPage.locator(`[data-testid="phase-header"]`);
  await expect(header).toContainText(phaseName);
});

Then('Michael sieht den Kontext-Pfad {string} in der Sidebar', async function (pathText) {
  const sidebar = participantPage.locator(`[data-testid="sidebar-context"]`);
  await expect(sidebar).toContainText(pathText);
});
