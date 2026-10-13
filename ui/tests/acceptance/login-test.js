/* eslint-disable qunit/require-expect */
import {
  currentRouteName,
  currentURL,
  settled,
  waitUntil,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from '../helpers/application-tests';
import percySnapshot from '@percy/ember';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { overrideRoute } from '../helpers/override-route';

import page from 'prison-rideshare-ui/tests/pages/login';
import reportPage from 'prison-rideshare-ui/tests/pages/report';
import shared from 'prison-rideshare-ui/tests/pages/shared';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.server.post('/token', (schema, { requestBody }) => {
      authenticateSession({ access_token: 'abcdef' });

      // FIXME yeah… weird to create the user here!

      if (requestBody.includes('jorts')) {
        schema.create('user', {
          email: 'jorts@jants.ca',
          password: 'aaaaaaaaa',
          admin: true,
        });
      } else if (requestBody.includes('jj')) {
        schema.create('user', {
          email: 'jj@jj.ca',
          password: 'aaaaaaaaa',
        });
      }

      return {
        access_token: 'abcdef',
      };
    });
  });

  test('successful admin login forwards to the rides list', async function (assert) {
    await page.visit();

    await page.fillEmail('jorts@jants.ca');
    await page.fillPassword('aaaaaaaaa');

    await page.submit();

    assert.strictEqual(currentRouteName(), 'rides');
    assert.strictEqual(shared.session.text, 'Log out jorts@jants.ca');
  });

  test('rides loaded for reporting are discarded on admin login', async function (assert) {
    this.server.create('ride', { complete: false });
    this.server.create('ride', { complete: true });

    await reportPage.visit();
    assert.strictEqual(reportPage.rides.length, 1);

    const store = this.owner.lookup('service:store');
    let ridesInStoreWhenFetchingAll;

    overrideRoute(this.server, 'get', '/rides', function ({ rides }) {
      ridesInStoreWhenFetchingAll = store.peekAll('ride').length;
      return rides.all();
    });

    await page.visit();
    await page.fillEmail('jorts@jants.ca');
    await page.fillPassword('aaaaaaaaa');
    await page.submit();

    assert.strictEqual(currentRouteName(), 'rides');
    assert.strictEqual(
      ridesInStoreWhenFetchingAll,
      0,
      'expected the partial ride list to be unloaded before fetching all rides',
    );
    assert.strictEqual(store.peekAll('ride').length, 2);
  });

  test('overlaps are refetched when logging in again', async function (assert) {
    await page.visit();
    await page.fillEmail('jorts@jants.ca');
    await page.fillPassword('aaaaaaaaa');
    await page.submit();

    assert.ok(shared.ridesBadge.isHidden);

    await shared.session.click();

    let ride = this.server.create('ride', {
      start: new Date(2117, 11, 4, 17, 0),
      end: new Date(2117, 11, 4, 19, 0),
    });
    let person = this.server.create('person');
    let slot = this.server.create('slot', {
      start: new Date(2117, 11, 4, 17, 30),
      end: new Date(2117, 11, 4, 20),
    });
    ride.createCommitment({ slot, person });
    ride.save();

    await page.visit();
    await page.fillEmail('jorts@jants.ca');
    await page.fillPassword('aaaaaaaaa');
    await page.submit();

    assert.strictEqual(shared.ridesBadge.text, '1');
  });

  test('the login button shows a loading state until rides load', async function (assert) {
    let ridesRequested = false;
    let resolveRides;
    const ridesResponse = new Promise((resolve) => (resolveRides = resolve));

    overrideRoute(this.server, 'get', '/rides', async function ({ rides }) {
      ridesRequested = true;
      await ridesResponse;
      return rides.all();
    });

    await page.visit();
    await page.fillEmail('jorts@jants.ca');
    await page.fillPassword('aaaaaaaaa');

    // Not awaited, as it would wait for the held rides response
    page.submit();
    await waitUntil(() => ridesRequested);

    assert.strictEqual(currentRouteName(), 'login');
    assert.strictEqual(page.submitText, 'Logging in…');
    assert.true(page.submitDisabled);

    resolveRides();
    await settled();

    assert.strictEqual(currentRouteName(), 'rides');
  });

  test('successful non-admin login forwards to the report route', async function (assert) {
    await page.visit();

    await page.fillEmail('jj@jj.ca');
    await page.fillPassword('aaaaaaaaa');
    await page.submit();

    assert.strictEqual(currentURL(), '/reports/new');
  });

  test('a failure from the current endpoint logs the user out', async function (assert) {
    this.server.get(
      '/users/current',
      () => {
        return {};
      },
      401,
    );

    await page.visit();
    await page.fillEmail('x@example.com');
    await page.fillPassword('x');
    await page.submit();

    assert.strictEqual(currentURL(), '/reports/new');
  });

  test('a failed login shows an error that clears on retry', async function (assert) {
    const restoreToken = overrideRoute(
      this.server,
      'post',
      '/token',
      () => new Response(401, {}, {}),
    );

    await page.visit();
    await page.fillEmail('x@example.com');
    await page.fillPassword('wrong-password');
    await page.submit();

    await percySnapshot(assert);

    assert.strictEqual(currentURL(), '/login');
    assert.strictEqual(
      shared.inlineAlert.text,
      'There was an error logging you in.',
    );
    assert.strictEqual(page.submitText, 'Log in');
    assert.false(page.submitDisabled);

    restoreToken();
    this.server.create('user', {
      email: 'x@example.com',
      password: 'correcthorsebatterystaple',
    });

    await page.fillPassword('correcthorsebatterystaple');
    await page.submit();

    assert.strictEqual(currentURL(), '/reports/new');
    assert.notOk(shared.inlineAlert.isPresent);
  });
});
