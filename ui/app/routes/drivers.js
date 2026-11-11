/* eslint-disable ember/no-mixins */
import { service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class DriversRoute extends AuthenticatedRoute {
  @service store;
  @service('people') peopleService;

  model() {
    // Reloads so last ride starts are present, as people embedded in rides lack them
    return this.peopleService.load();
  }
}
