/* eslint-disable qunit/require-expect */
import parseTimespan from 'prison-rideshare-ui/utils/parse-timespan';
import { module, test } from 'qunit';
import { reset, travel } from 'chronokinesis';

import { formatDate } from 'prison-rideshare-ui/utils/dates';

module('Unit | Utility | parse timespan', function (hooks) {
  hooks.beforeEach(function () {
    const afterMidnight = new Date(1506490200000);
    travel(afterMidnight);
  });

  hooks.afterEach(function () {
    reset();
  });

  const formatString = 'yyyy-MM-dd HH:mm';

  const assertParsing = function (
    assert,
    timespanString,
    startString,
    endString,
  ) {
    const parsed = parseTimespan(timespanString);

    assert.strictEqual(formatDate(parsed.start, formatString), startString);
    assert.strictEqual(formatDate(parsed.end, formatString), endString);
  };

  test('it parses a well-specified timespan', function (assert) {
    assertParsing(
      assert,
      'september 27 2017 from 1pm to 3pm',
      '2017-09-27 13:00',
      '2017-09-27 15:00',
    );
  });

  test('it assumes the end meridiem is the same as the start meridiem', function (assert) {
    assertParsing(
      assert,
      'september 27 2017 from 1pm to 3',
      '2017-09-27 13:00',
      '2017-09-27 15:00',
    );
  });

  test('it allows the end meridiem to be overridden', function (assert) {
    assertParsing(
      assert,
      'september 27 2017 from 10am to 11pm',
      '2017-09-27 10:00',
      '2017-09-27 23:00',
    );
  });

  test('it assumes PM if unspecified', function (assert) {
    assertParsing(
      assert,
      'september 27 2017 from 630 to 9',
      '2017-09-27 18:30',
      '2017-09-27 21:00',
    );
  });

  test('it assumes PM if unspecified even for start alone', function (assert) {
    const parsed = parseTimespan('september 27 2017 from 630');

    assert.strictEqual(
      formatDate(parsed.start, formatString),
      '2017-09-27 18:30',
    );
    assert.notOk(parsed.end);
  });

  test('it assumes future dates unless fully specified', function (assert) {
    travel(new Date(1570925744254));
    // Saturday 2019-10-12 19:15

    assertParsing(
      assert,
      'thursday from 7 to 9',
      '2019-10-17 19:00',
      '2019-10-17 21:00',
    );

    assertParsing(
      assert,
      'oct 10 2019 from 1 to 4',
      '2019-10-10 13:00',
      '2019-10-10 16:00',
    );
  });

  test('it parses times after Manitoba stopped changing clocks as UTC-5', function (assert) {
    const parsed = parseTimespan('december 5 2026 9am to 11am');

    assert.strictEqual(parsed.start.toISOString(), '2026-12-05T14:00:00.000Z');
    assert.strictEqual(parsed.end.toISOString(), '2026-12-05T16:00:00.000Z');
  });
});
