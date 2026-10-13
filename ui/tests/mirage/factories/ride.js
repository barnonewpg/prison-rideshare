import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';
import { winnipegDate } from '../../helpers/winnipeg-date';
faker.seed(1919);

export default Factory.extend({
  name() {
    return faker.person.firstName();
  },
  address() {
    return faker.location.streetAddress();
  },
  contact() {
    return Math.random() < 0.2 ? faker.internet.email() : faker.phone.number();
  },

  passengers: 1,

  start(i) {
    return winnipegDate(2016, 11, 26, 20, 30 + i);
  },
  end() {
    return winnipegDate(2016, 11, 26, 22, 0);
  },
  complete() {
    return false;
  },
  requestConfirmed: true,
});
