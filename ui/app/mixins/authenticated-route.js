/* eslint-disable ember/no-new-mixins */
import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class AuthenticatedRoute extends Route {
  @service router;
  @service session;

  beforeModel() {
    if (!this.session.isAuthenticated) {
      this.router.transitionTo('login');
    }
  }
}
