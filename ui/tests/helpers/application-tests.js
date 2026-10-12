import { setupApplicationTest as qunitSetup } from 'ember-qunit';
import { setupMirage } from 'ember-mirage/test-support';
import makeServer from 'prison-rideshare-ui/tests/mirage/config';

function setupApplicationTest(hooks) {
  qunitSetup(hooks);
  setupMirage(hooks, { createServer: makeServer });

  hooks.afterEach(function () {
    let toasts = this.owner.lookup('service:toasts');
    toasts.dismiss();
  });
}

export { setupApplicationTest };
