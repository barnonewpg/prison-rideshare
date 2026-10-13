import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @service session;

  @tracked error;
  @tracked isLoggingIn = false;

  @action
  updateEmail(event) {
    const value = event.target.value;
    this.model.email = value;
  }

  @action
  updatePassword(event) {
    const value = event.target.value;
    this.model.password = value;
  }

  @action
  login(event) {
    event.preventDefault();

    const user = this.model;

    this.error = undefined;
    this.isLoggingIn = true;

    // On success this stays true while the next route loads.
    this.session
      .authenticate(
        'authenticator:application',
        user.get('email'),
        user.get('password'),
      )
      .catch((error) => {
        this.isLoggingIn = false;
        this.error =
          error?.errors?.[0]?.detail ?? 'There was an error logging you in.';
      });
  }
}
