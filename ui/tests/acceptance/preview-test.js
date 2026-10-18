import { module, test } from 'qunit';
import { setupApplicationTest } from '../helpers/application-tests';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit } from '@ember/test-helpers';
import { getPageTitle } from 'ember-page-title/test-support';
import config from 'prison-rideshare-ui/config/environment';

module('Acceptance | preview', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession(this.application);
  });

  hooks.afterEach(function () {
    delete config.APP.previewPullRequest;
    delete config.APP.previewBranch;
  });

  test('a preview shows its pull request in the title and header', async function (assert) {
    config.APP.previewPullRequest = '12';

    await visit('/institutions');

    assert.strictEqual(
      getPageTitle(),
      '#12 production · Institutions · Prison Rideshare',
    );
    assert.dom('[data-test-preview-tag]').hasText('PR #12 · production data');
  });

  test('a branch preview shows its branch in the title and header', async function (assert) {
    config.APP.previewBranch = 'visitors';

    await visit('/institutions');

    assert.strictEqual(
      getPageTitle(),
      'visitors production · Institutions · Prison Rideshare',
    );
    assert.dom('[data-test-preview-tag]').hasText('visitors · production data');
  });

  test('other builds have no preview label', async function (assert) {
    await visit('/institutions');

    assert.strictEqual(getPageTitle(), 'Institutions · Prison Rideshare');
    assert.dom('[data-test-preview-tag]').doesNotExist();
  });
});
