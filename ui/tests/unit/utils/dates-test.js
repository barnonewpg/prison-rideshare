import { formatDate, toDateTime } from 'prison-rideshare-ui/utils/dates';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { winnipegDate } from '../../helpers/winnipeg-date';

module('Unit | Utility | dates', function () {
  test('it formats with a single-letter meridiem', function (assert) {
    assert.strictEqual(
      formatDate(winnipegDate(2010, 5, 26, 9, 5), 'EEE LLL d yyyy h:mma'),
      'Sat Jun 26 2010 9:05a',
    );
    assert.strictEqual(formatDate(winnipegDate(2010, 5, 26, 13), 'ha'), '1p');
  });

  test('it leaves quoted text alone', function (assert) {
    assert.strictEqual(
      formatDate(winnipegDate(2010, 5, 26, 13), "EEE 'at' ha"),
      'Sat at 1p',
    );
  });

  test('it returns an empty string for missing or invalid dates', function (assert) {
    assert.strictEqual(formatDate(undefined, 'yyyy'), '');
    assert.strictEqual(formatDate(null, 'yyyy'), '');
    assert.strictEqual(formatDate('not a date', 'yyyy'), '');
  });

  test('it accepts dates, ISO strings, and DateTimes', function (assert) {
    assert.strictEqual(formatDate('2026-10', 'LLLL yyyy'), 'October 2026');
    assert.strictEqual(
      formatDate(DateTime.local(2026, 11, 1), 'yyyy-MM-dd'),
      '2026-11-01',
    );
    assert.strictEqual(toDateTime(new Date(0)).toMillis(), 0);
  });

  test('it keeps Winnipeg at UTC-5 from March 2026 on', function (assert) {
    assert.strictEqual(
      formatDate(new Date('2025-12-01T15:00:00Z'), 'h:mma'),
      '9:00a',
      'before the change, winter is UTC-6',
    );
    assert.strictEqual(
      formatDate(new Date('2026-12-01T14:00:00Z'), 'h:mma'),
      '9:00a',
      'after the change, winter is UTC-5',
    );
    assert.strictEqual(
      DateTime.fromObject({ year: 2027, month: 1, day: 5, hour: 9 }).toISO(),
      '2027-01-05T09:00:00.000-05:00',
    );
  });
});
