/* eslint-disable qunit/require-expect */
import { module, test } from 'qunit';
import { setupApplicationTest } from '../helpers/application-tests';

import { authenticateSession } from 'ember-simple-auth/test-support';

import page from 'prison-rideshare-ui/tests/pages/statistics';
import { getPageTitle } from 'ember-page-title/test-support';

import { DateTime } from 'luxon';

module('Acceptance | statistics', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession();
  });

  test('has convenience buttons for timespans', async function (assert) {
    await page.visit();

    assert.strictEqual(getPageTitle(), 'Statistics · Prison Rideshare');
    assert.strictEqual(
      page.start.value,
      DateTime.now().minus({ years: 1 }).toISODate(),
      'expected the start date to be a year ago',
    );
    assert.strictEqual(
      page.end.value,
      DateTime.now().toISODate(),
      'expected the end date to be today',
    );

    await page.pastTwoWeeks.click();

    assert.strictEqual(
      page.start.value,
      DateTime.now().minus({ weeks: 2 }).toISODate(),
      'expected the start date to be two weeks ago',
    );
    assert.strictEqual(
      page.end.value,
      DateTime.now().toISODate(),
      'expected the end date to be today',
    );

    await page.thisYear.click();

    assert.strictEqual(
      page.start.value,
      DateTime.now().startOf('year').toISODate(),
      'expected the start date to be the beginning of this year',
    );
    assert.strictEqual(
      page.end.value,
      DateTime.now().toISODate(),
      'expected the end date to be today',
    );

    await page.pastYear.click();

    assert.strictEqual(
      page.start.value,
      DateTime.now().minus({ years: 1 }).toISODate(),
      'expected the start date to be a year ago',
    );
    assert.strictEqual(
      page.end.value,
      DateTime.now().toISODate(),
      'expected the end date to be today',
    );
  });
});
