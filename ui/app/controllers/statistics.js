/* eslint-disable ember/classic-decorator-hooks, ember/classic-decorator-no-classic-methods, ember/no-classic-classes, ember/no-computed-properties-in-native-classes */
import { action, computed } from '@ember/object';
import Controller from '@ember/controller';
import { DateTime } from 'luxon';
import { formatDate, toDateTime } from 'prison-rideshare-ui/utils/dates';

// Sunset theme adapted from here: https://github.com/highcharts/highcharts/blob/master/js/themes/sunset.js
const theme = {
  colors: ['#FDD089', '#FF7F79', '#A0446E', '#251535'],

  plotOptions: {
    map: {
      nullColor: '#fefefc',
    },
  },

  navigator: {
    series: {
      color: '#FF7F79',
      lineColor: '#A0446E',
    },
  },
};

export default class StatisticsController extends Controller {
  queryParams = ['start', 'end', 'grouping'];
  grouping = 'rides';

  init() {
    super.init(...arguments);
    this.send('setPastYear');
  }

  theme = theme;

  @computed('model.@each.start', 'start', 'end')
  get rides() {
    const rangeStart = toDateTime(this.start);
    const rangeEnd = toDateTime(this.end);

    return this.model.filter((ride) => {
      const start = toDateTime(ride.get('start'));

      return start && rangeStart < start && rangeEnd > start;
    });
  }

  @computed('rides.length')
  get clipboardText() {
    return (
      'date\tinstitution\taddress\tpassengers\tdistance\tfood expenses\treimbursement\n' +
      this.rides
        .filter(
          (ride) =>
            !ride.cancelled && ride.reimbursementExpensesSum && ride.complete,
        )
        .sort((a, b) => a.start - b.start)
        .map((ride) => {
          return (
            `${formatDate(ride.get('start'), 'yyyy-MM-dd')}\t` +
            `${ride.get('institution.name')}\t` +
            `${ride.get('allAnonymisedAddresses')}\t` +
            `${ride.get('allPassengers')}\t` +
            `${ride.get('distance')}\t` +
            `${ride.get('foodExpensesDollars') || ''}\t` +
            `${ride.get('reimbursementExpensesSum') / 100}\t`
          );
        })
        .join('\n')
    );
  }

  @computed('clipboardText')
  get copyButtonTitle() {
    return `This will copy the following to the clipboard:\n${this.clipboardText}`;
  }

  @action
  setPastYear() {
    this.set('start', DateTime.now().minus({ years: 1 }).toISODate());
    this.set('end', DateTime.now().toISODate());
  }

  @action
  setPastTwoWeeks() {
    this.set('start', DateTime.now().minus({ weeks: 2 }).toISODate());
    this.set('end', DateTime.now().toISODate());
  }

  @action
  setThisYear() {
    this.set('start', DateTime.now().startOf('year').toISODate());
    this.set('end', DateTime.now().toISODate());
  }

  @action
  updateStart(event) {
    const value = event?.target?.value ?? '';

    this.set('start', value);
  }

  @action
  updateEnd(event) {
    const value = event?.target?.value ?? '';

    this.set('end', value);
  }

  @action
  setGrouping(grouping) {
    this.set('grouping', grouping);
  }
}
