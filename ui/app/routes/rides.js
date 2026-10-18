/* eslint-disable ember/no-mixins */
import { service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class RidesRoute extends AuthenticatedRoute {
  @service institutions;
  @service people;
  @service store;

  queryParams = {
    showCompleted: { refreshModel: true },
    showCancelled: { refreshModel: true },
  };

  activate() {
    super.activate(...arguments);

    // Driver and car owner selects only render when used, so the people they list are loaded ahead
    this.people.load();
  }

  async model({ showCompleted, showCancelled }) {
    const filter = {};

    // Avoid loading the entire ride history unless it's been asked for
    if (!showCompleted) {
      filter.complete = false;
    }

    if (!showCancelled) {
      filter.enabled = true;
    }

    await Promise.all([
      this.institutions.load(),
      this.store.query('ride', { filter }),
    ]);

    // The controller filters what to show; this keeps new and previously-loaded rides live
    return this.store.peekAll('ride');
  }
}
