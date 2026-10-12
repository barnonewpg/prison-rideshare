import { service } from '@ember/service';
import Route from '@ember/routing/route';

import momentAddLocaleShortMeridiemFormat from 'prison-rideshare-ui/utils/moment-add-locale-short-meridiem-format';

export default class ApplicationRoute extends Route {
  @service account;
  @service moment;
  @service session;
  @service toasts;

  async beforeModel() {
    await this.session.setup();

    momentAddLocaleShortMeridiemFormat(this.moment);

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.account.loadCurrentUser().catch(() => {
      this.toasts.show('Please log in');
      this.session.invalidate();
    });
  }
}
