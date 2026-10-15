import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import { toDateTime } from 'prison-rideshare-ui/utils/dates';
import { task } from 'ember-concurrency';

export default class CalendarController extends Controller {
  @service toasts;

  get month() {
    return this.model?.month;
  }

  get slots() {
    return this.model?.slots;
  }

  get person() {
    return this.model?.person;
  }

  @tracked error = undefined;
  @tracked showPerson = false;

  get monthDate() {
    return toDateTime(this.month)?.toJSDate();
  }

  get httpSubscriptionUrl() {
    const person = this.person;
    const base = person.store
      .adapterFor('person')
      .buildURL('person', person.id);

    return `${base}/calendar?secret=${encodeURIComponent(
      person.calendarSecret,
    )}`;
  }

  get webcalSubscriptionUrl() {
    return this.httpSubscriptionUrl
      .replace('https', 'webcal')
      .replace('http', 'webcal');
  }

  savePerson = task({ drop: true }, async () => {
    try {
      await this.person.save();

      this.toasts.show('Saved your details');
      this.showPerson = false;
      this.error = undefined;
    } catch (e) {
      this.error = 'Couldn’t save your details';
    }
  });

  @action
  cancel() {
    this.showPerson = false;
    this.person.rollbackAttributes();
  }

  @action
  updateMonth(value) {
    if (this.model) {
      this.model.month = value;
    }
  }

  @action setError(error) {
    this.error = error;
  }
}
