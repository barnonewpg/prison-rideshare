import formatTimespan from 'prison-rideshare-ui/utils/format-timespan';
import { module, test } from 'qunit';
import { winnipegDate } from '../../helpers/winnipeg-date';

module('Unit | Utility | format timespan', function () {
  test('it makes timespans readable', function (assert) {
    const noMinutesSameMeridiem = formatTimespan(
      winnipegDate(2010, 5, 26, 13, 0, 0),
      winnipegDate(2010, 5, 26, 15, 0, 0),
    );

    assert.strictEqual(noMinutesSameMeridiem, 'Sat Jun 26 2010 1p — 3');

    const minutesSameMeridiem = formatTimespan(
      winnipegDate(2010, 5, 26, 15, 30, 0),
      winnipegDate(2010, 5, 26, 16, 48, 0),
    );

    assert.strictEqual(minutesSameMeridiem, 'Sat Jun 26 2010 3:30p — 4:48');

    const sameDayDifferentMeridiem = formatTimespan(
      winnipegDate(2010, 5, 27, 10, 22, 0),
      winnipegDate(2010, 5, 27, 19, 0, 0),
    );

    assert.strictEqual(sameDayDifferentMeridiem, 'Sun Jun 27 2010 10:22a — 7p');

    const differentDay = formatTimespan(
      winnipegDate(2010, 5, 27, 10, 22, 0),
      winnipegDate(2010, 5, 29, 19, 0, 0),
    );

    assert.strictEqual(differentDay, 'Sun Jun 27 2010 10:22a — Tue 7p');
  });
});
