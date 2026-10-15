/* eslint-disable ember/no-mixins */
import { service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class DriversRoute extends AuthenticatedRoute {
  @service store;

  model() {
    // FIXME this formerly used the people service but it wasn’t getting new records…
    // Reload so last ride starts are present, as people embedded in rides lack them
    return this.store.findAll('person', { reload: true });
  }
}
