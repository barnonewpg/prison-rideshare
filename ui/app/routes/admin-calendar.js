/* eslint-disable ember/no-mixins */
import { service } from '@ember/service';
import { formatDate } from 'prison-rideshare-ui/utils/dates';
import AuthenticatedRoute from 'prison-rideshare-ui/mixins/authenticated-route';
import CalendarState from 'prison-rideshare-ui/utils/calendar-state';

export default class AdminCalendarRoute extends AuthenticatedRoute {
  @service store;
  @service('people') peopleService;

  async model({ month }) {
    await this.store.findAll('slot');
    const slots = this.store
      .peekAll('slot')
      .filter((slot) => formatDate(slot.get('start'), 'yyyy-MM') === month);
    await this.peopleService.load();

    return new CalendarState({
      slots,
      month,
    });
  }
}
