/* eslint-disable ember/no-mixins */
import { inject as service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class DriversRoute extends AuthenticatedRoute {
  @service store;
  @service('people') peopleService;

  model() {
    return this.peopleService.load();
  }

  afterModel() {
    // FIXME this is ridiculous, should just be sync relationships perhaps, or have last ride be computed by API
    return this.store.findAll('ride');
  }
}
