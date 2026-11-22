/* eslint-disable ember/no-mixins */
import { service } from '@ember/service';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';

export default class ReimbursementsRoute extends AuthenticatedRoute {
  @service store;

  model() {
    // Rides are included so they don't each need a separate request
    return this.store.findAll('reimbursement', {
      include: 'person,ride,ride.institution',
      reload: true,
    });
  }
}
