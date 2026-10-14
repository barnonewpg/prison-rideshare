/* eslint-disable ember/no-mixins */
import { action } from '@ember/object';
import { service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class RidesRoute extends AuthenticatedRoute {
  @service institutions;
  @service store;

  queryParams = {
    showCompleted: { refreshModel: true },
    showCancelled: { refreshModel: true },
  };

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

  // Keep showing the current rides while toggling filters refetches them
  @action
  loading(transition) {
    if (transition.from?.name !== 'rides') {
      return true;
    }

    const controller = this.controllerFor('rides');
    controller.loadingTransition = transition;

    transition.promise.finally(() => {
      if (controller.loadingTransition === transition) {
        controller.loadingTransition = undefined;
      }
    });

    return false;
  }
}
