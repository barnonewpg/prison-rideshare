import chrono from 'chrono-node';
import { DateTime } from 'luxon';

const assumeEndDay = new chrono.Refiner();
assumeEndDay.refine = function (text, results) {
  results.forEach(({ start, end }) => {
    if (
      start &&
      end &&
      !end.isCertain('meridiem') &&
      start.isCertain('meridiem') &&
      start.get('meridiem') === 1
    ) {
      end.assign('meridiem', 1);
      end.assign('year', start.get('year'));
      end.assign('month', start.get('month'));
      end.assign('day', start.get('day'));
      end.assign('hour', end.get('hour') + 12);
    }
  });

  return results;
};

const assumePM = new chrono.Refiner();
assumePM.refine = function (text, results) {
  results.forEach(({ start, end }) => {
    if (start && !start.isCertain('meridiem')) {
      start.assign('meridiem', 1);
      start.assign('hour', start.get('hour') + 12);

      if (end) {
        end.assign('meridiam', 1);
        end.assign('hour', end.get('hour') + 12);
      }
    }
  });

  return results;
};

const chronoInstance = new chrono.Chrono();
chronoInstance.refiners.push(assumeEndDay);
chronoInstance.refiners.push(assumePM);

// chrono works in the device’s time zone, so give it the current Winnipeg
// wall-clock time and read the parsed wall-clock fields back as Winnipeg.
function winnipegNowAsDeviceDate() {
  const now = DateTime.now();

  return new Date(now.year, now.month - 1, now.day, now.hour, now.minute);
}

function componentToDate(component) {
  return DateTime.fromObject({
    year: component.get('year'),
    month: component.get('month'),
    day: component.get('day'),
    hour: component.get('hour'),
    minute: component.get('minute'),
  }).toJSDate();
}

export default function parseTimespan(value) {
  const [parsed] = chronoInstance.parse(value, winnipegNowAsDeviceDate(), {
    forwardDate: true,
  });

  if (!parsed) {
    return undefined;
  }

  return {
    start: parsed.start ? componentToDate(parsed.start) : undefined,
    end: parsed.end ? componentToDate(parsed.end) : undefined,
  };
}
