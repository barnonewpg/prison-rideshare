// @ts-check
const { test: base, expect } = require('@playwright/test');

// Created by api/priv/repo/sandbox_seeds.exs
const ADMIN_EMAIL = 'jorts@jants.ca';
const ADMIN_PASSWORD = 'password';

const API = 'http://localhost:4100';

// Fail any test whose page throws, as a payload Mirage shapes differently
// from the real API would make it
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await use(page);

    expect(errors, 'uncaught page errors').toEqual([]);
  },
});

async function logIn(page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/rides$/);
}

async function adminToken(request) {
  const response = await request.post(`${API}/token`, {
    form: {
      grant_type: 'password',
      username: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).access_token;
}

test('a driver submits a ride report that the API stores', async ({
  page,
  request,
}) => {
  await page.goto('/reports/new');

  const rides = page.getByRole('radio');
  await expect(
    rides.first(),
    'expected seeded rides to report on',
  ).toBeVisible();
  const rideCount = await rides.count();

  const firstRide = rides.first();
  const rideId = await firstRide.getAttribute('value');
  await firstRide.check();

  const notes = `Smoke test ${Date.now()}`;
  await page.getByLabel('Distance in kilometres').fill('87.5');
  await page.getByLabel('Food expenses if wanting reimbursement').fill('12.34');
  await page.getByLabel('Notes').fill(notes);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Your report was saved')).toBeVisible();
  await expect(rides).toHaveCount(rideCount - 1);

  const token = await adminToken(request);
  const response = await request.get(`${API}/rides/${rideId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();

  const { attributes } = (await response.json()).data;
  expect(attributes).toMatchObject({
    complete: true,
    distance: 87.5,
    'food-expenses': 1234,
    'report-notes': notes,
  });
});

test('an admin logs in and the main lists load', async ({ page }) => {
  await logIn(page);
  await expect(page.getByText(`Log out ${ADMIN_EMAIL}`)).toBeVisible();
  await expect(page.locator('tbody tr.ride').first()).toBeVisible();

  await page.goto('/drivers');
  await expect(page.getByRole('row').nth(1)).toBeVisible();

  await page.goto('/reimbursements');
  await expect(page.getByRole('row').nth(1)).toBeVisible();

  await page.goto('/institutions');
  await expect(page.getByRole('row').nth(1)).toBeVisible();
});

test('an admin edits a driver and the change survives a reload', async ({
  page,
}) => {
  await logIn(page);
  await page.goto('/drivers');

  const notes = `Smoke test ${Date.now()}`;

  const row = page.getByRole('row').nth(1);
  await row.getByRole('button', { name: 'Edit' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Notes').fill(notes);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();

  await page.reload();
  await expect(page.getByText(notes)).toBeVisible();
});

test.describe('in a browser outside Winnipeg', () => {
  // Far enough from Winnipeg that using the browser’s zone by mistake
  // would show a different day
  test.use({ timezoneId: 'Asia/Tokyo' });

  test('ride times entered in Winnipeg time reach the API in UTC', async ({
    page,
    request,
  }) => {
    await logIn(page);

    const row = page.locator('tbody tr.ride').first();
    const rideId = await row.getAttribute('data-ride-id');
    await row.getByRole('button', { name: 'Edit ride' }).click();

    // December, so a browser still on CST (UTC-6) would store 00:00Z
    // rather than Manitoba’s permanent UTC-5
    await page.getByLabel('Timespan').fill('Dec 2 2030 from 6p to 8p');
    await page.getByRole('button', { name: 'Save' }).click();

    const token = await adminToken(request);
    await expect(async () => {
      const response = await request.get(`${API}/rides/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { attributes } = (await response.json()).data;

      // The API appends Z to the naive time it stores
      expect(attributes).toMatchObject({
        start: '2030-12-02T23:00:00Z',
        end: '2030-12-03T01:00:00Z',
      });
    }).toPass();

    await page.reload();
    await expect(
      page.locator(`tbody tr.ride[data-ride-id="${rideId}"]`),
    ).toContainText(/Dec 2 2030\s*6p\s*—\s*8\b/);
  });
});
