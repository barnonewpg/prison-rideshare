import { A } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleService extends Service {
  @service
  store;

  @tracked people = A();
  @tracked loadPromise = null;

  constructor(owner, options) {
    super(owner, options);
    this.load();
  }

  load() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Visitors are people too, so the store holds more than this list should
    const promise = this.store
      .query('person', { filter: { role: 'driver' } })
      .then((people) => {
        this.people = people;
      })
      .finally(() => {
        this.loadPromise = null;
      });

    this.loadPromise = promise;
    return promise;
  }

  get all() {
    const people = this.people || A();
    return [...people].sort((a, b) => a.name.localeCompare(b.name));
  }

  get active() {
    return this.all.filter((person) => person.active);
  }
}
