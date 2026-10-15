import { DateTime } from 'luxon';
import { winnipegZone } from 'prison-rideshare-ui/utils/dates';

// Like new Date(year, monthIndex, …) but in Winnipeg time rather than the
// device’s, which is how the app displays and parses times.
export function winnipegDate(
  year,
  monthIndex,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
) {
  return DateTime.fromObject(
    { year, month: monthIndex + 1, day, hour, minute, second },
    { zone: winnipegZone },
  ).toJSDate();
}
