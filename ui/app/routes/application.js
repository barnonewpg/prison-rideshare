import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  @service account;
  @service session;
  @service toasts;

  async beforeModel() {
    await this.session.setup();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.account.loadCurrentUser().catch(() => {
      this.toasts.show('Please log in');
      this.session.invalidate();
    });
  }
}
