import { service } from '@ember/service';
import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { isSandbox } from 'prison-rideshare-ui/utils/deployment';

export default class LoginRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication();
  }

  model() {
    const user = {};

    if (isSandbox()) {
      user.email = 'jorts@jants.ca';
      user.password = 'password';
    }

    return EmberObject.create(user);
  }
}
