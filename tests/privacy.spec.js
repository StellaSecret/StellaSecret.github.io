// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Base URL is injected via PLAYWRIGHT_BASE_URL in CI,
 * falling back to the local webServer for local runs.
 */
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Assert the page background is dark (not blank white — CSS loaded). */
async function expectDarkBackground(page) {
  const bg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  expect(bg, 'Background should not be white — CSS may not have loaded').not.toBe(
    'rgb(255, 255, 255)'
  );
}

// ── Landing page ─────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/StellaSecret/);
  });

  test('background is not blank white — CSS loaded', async ({ page }) => {
    await expectDarkBackground(page);
  });

  test('hero heading is visible', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('shows 2 released app cards', async ({ page }) => {
    // Use data-i18n attribute — text changes with FR/EN locale
    const released = page.locator('section.section-block').filter({
      has: page.locator('[data-i18n="sectionReleased"]'),
    });
    await expect(released.locator('article.card')).toHaveCount(2);
  });

  test('shows 3 coming-soon app cards', async ({ page }) => {
    const soon = page.locator('section.section-block').filter({
      has: page.locator('[data-i18n="sectionComingSoon"]'),
    });
    await expect(soon.locator('article.card')).toHaveCount(3);
  });

  test('each card has a visible title', async ({ page }) => {
    const titles = page.locator('.card h2.title');
    await expect(titles).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(titles.nth(i)).toBeVisible();
    }
  });

  test('all external links have noopener', async ({ page }) => {
    const blankLinks = page.locator('a[target="_blank"]');
    const count = await blankLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const rel = await blankLinks.nth(i).getAttribute('rel');
      expect(rel, `Link ${i} missing noopener`).toContain('noopener');
    }
  });

  test('footer has privacy policies link pointing to /privacy-pages/', async ({ page }) => {
    const link = page.locator('footer a[href="/privacy-pages/"]');
    await expect(link).toBeVisible();
  });

  test('footer has GitHub link', async ({ page }) => {
    const link = page.locator('footer a[href*="github.com/StellaSecret"]');
    await expect(link).toBeVisible();
  });

  test('theme toggle button is visible and clickable', async ({ page }) => {
    const btn = page.locator('#themeToggle');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await btn.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  });

  test('lang toggle switches label between EN and FR', async ({ page }) => {
    const label = page.locator('#langLabel');
    const initial = await label.textContent();
    await page.locator('#langToggle').click();
    const toggled = await label.textContent();
    expect(toggled).not.toBe(initial);
    await page.locator('#langToggle').click();
    await expect(label).toHaveText(initial);
  });

  test('lang toggle updates hero heading text', async ({ page }) => {
    const h1 = page.locator('h1');
    const before = await h1.textContent();
    await page.locator('#langToggle').click();
    const after = await h1.textContent();
    expect(after).not.toBe(before);
  });
});

// ── Privacy index ─────────────────────────────────────────────────────────────

test.describe('Privacy index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/privacy-pages/');
  });

  test('loads and is not blank', async ({ page }) => {
    await expectDarkBackground(page);
    await expect(page).toHaveTitle(/Stella Secret/);
  });

  test('lang toggle button is visible', async ({ page }) => {
    await expect(page.locator('.lang-btn')).toBeVisible();
  });

  test('EN toggle switches language', async ({ page }) => {
    const btn = page.locator('.lang-btn');
    const initial = await btn.textContent();
    await btn.click();
    const toggled = await btn.textContent();
    expect(toggled).not.toBe(initial);
  });

  test('shows 7 app links', async ({ page }) => {
    // Class is .app-link, not .app-card
    await expect(page.locator('.app-link')).toHaveCount(7);
  });

  test('each app link has an id', async ({ page }) => {
    const expectedIds = [
      'link-asthmetrack',
      'link-tripmind',
      'link-strategicjournal',
      'link-gametracker',
      'link-peoplemodeler',
      'link-smartshoppingcalculator',
      'link-cvgenerator',
    ];
    for (const id of expectedIds) {
      await expect(page.locator(`#${id}`), `Missing link: #${id}`).toBeAttached();
    }
  });
});

// ── Per-app privacy pages ─────────────────────────────────────────────────────

const APPS = [
  {
    name: 'AsthmeTrack',
    fr: '/privacy-pages/asthmetrack/privacy.html',
    en: '/privacy-pages/asthmetrack/privacy-en.html',
  },
  {
    name: 'TripMind',
    fr: '/privacy-pages/tripmind/privacy.html',
    en: '/privacy-pages/tripmind/privacy-en.html',
  },
  {
    name: 'StrategicJournal',
    fr: '/privacy-pages/strategicjournal/privacy.html',
    en: '/privacy-pages/strategicjournal/privacy-en.html',
  },
  {
    name: 'GameTracker',
    fr: '/privacy-pages/gametracker/privacy.html',
    en: '/privacy-pages/gametracker/privacy-en.html',
  },
  {
    name: 'PeopleModeler',
    fr: '/privacy-pages/peoplemodeler/privacy.html',
    en: '/privacy-pages/peoplemodeler/privacy-en.html',
  },
  {
    name: 'CVGenerator',
    fr: '/privacy-pages/cvgenerator/privacy.html',
    en: '/privacy-pages/cvgenerator/privacy-en.html',
  },
];

for (const app of APPS) {
  test.describe(`${app.name}`, () => {
    test('FR page loads and is not blank', async ({ page }) => {
      await page.goto(BASE + app.fr);
      await expectDarkBackground(page);
      await expect(page.locator('h1')).toContainText('Politique de confidentialité');
    });

    test('FR page has back link to privacy index', async ({ page }) => {
      await page.goto(BASE + app.fr);
      const back = page.locator('.back');
      await expect(back).toBeVisible();
      await expect(back).toHaveAttribute('href', '../');
    });

    test('FR page links to EN version', async ({ page }) => {
      await page.goto(BASE + app.fr);
      const langLink = page.locator('.lang-link');
      await expect(langLink).toHaveText('EN');
      await expect(langLink).toHaveAttribute('href', /privacy-en\.html/);
    });

    test('EN page loads and is not blank', async ({ page }) => {
      await page.goto(BASE + app.en);
      await expectDarkBackground(page);
      await expect(page.locator('h1')).toContainText('Privacy Policy');
    });

    test('EN page has back link to privacy index', async ({ page }) => {
      await page.goto(BASE + app.en);
      const back = page.locator('.back');
      await expect(back).toBeVisible();
      await expect(back).toHaveAttribute('href', '../');
    });

    test('EN page links back to FR version', async ({ page }) => {
      await page.goto(BASE + app.en);
      const langLink = page.locator('.lang-link');
      await expect(langLink).toHaveText('FR');
      await expect(langLink).toHaveAttribute('href', /privacy\.html/);
    });

    test('highlight summary box is visible', async ({ page }) => {
      await page.goto(BASE + app.en);
      await expect(page.locator('.highlight')).toBeVisible();
    });

    test('has at least 3 section headings', async ({ page }) => {
      await page.goto(BASE + app.en);
      const headings = page.locator('h2');
      await expect(headings.first()).toBeVisible();
      expect(await headings.count()).toBeGreaterThanOrEqual(3);
    });

    test('all external links have noopener', async ({ page }) => {
      await page.goto(BASE + app.en);
      const blankLinks = page.locator('a[target="_blank"]');
      const count = await blankLinks.count();
      for (let i = 0; i < count; i++) {
        const rel = await blankLinks.nth(i).getAttribute('rel');
        expect(rel, `Link ${i} missing noopener`).toContain('noopener');
      }
    });
  });
}
