import { DateTime, FixedOffsetZone, IANAZone, Zone } from 'luxon';

// Manitoba stopped changing its clocks after springing forward on
// 2026-03-08 at 2am CST, so every Winnipeg time from then on is UTC-5.
// Browsers bundle their own time zone data and may not know that yet, so
// only earlier times consult it.
//
// Once browsers in use ship IANA tzdata 2026e or later, delete WinnipegZone
// and set Settings.defaultZone = 'America/Winnipeg' in app.js instead.
const PERMANENT_UTC_MINUS_5_START = Date.UTC(2026, 2, 8, 8);

const historicalZone = IANAZone.create('America/Winnipeg');
const permanentZone = FixedOffsetZone.instance(-5 * 60);

function zoneAt(ts) {
  return ts < PERMANENT_UTC_MINUS_5_START ? historicalZone : permanentZone;
}

export class WinnipegZone extends Zone {
  get type() {
    return 'winnipeg';
  }

  get name() {
    return 'America/Winnipeg';
  }

  get isUniversal() {
    return false;
  }

  get isValid() {
    return true;
  }

  offsetName(ts, opts) {
    return zoneAt(ts).offsetName(ts, opts);
  }

  formatOffset(ts, format) {
    return zoneAt(ts).formatOffset(ts, format);
  }

  offset(ts) {
    return zoneAt(ts).offset(ts);
  }

  equals(otherZone) {
    return otherZone instanceof WinnipegZone;
  }
}

export const winnipegZone = new WinnipegZone();

export function toDateTime(value) {
  if (DateTime.isDateTime(value)) {
    return value;
  } else if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  } else if (typeof value === 'string') {
    return DateTime.fromISO(value);
  } else if (typeof value === 'number') {
    return DateTime.fromMillis(value);
  }

  return null;
}

// Formats with Luxon tokens, except that an unquoted “a” becomes a
// single-letter meridiem (“a” or “p”) rather than Luxon’s “AM”/“PM”.
export function formatDate(value, format) {
  const dateTime = toDateTime(value);

  if (!dateTime?.isValid) {
    return '';
  }

  const meridiem = dateTime.hour < 12 ? 'a' : 'p';

  return dateTime.toFormat(
    format.replace(
      /('[^']*')|a/g,
      (match, quoted) => quoted ?? `'${meridiem}'`,
    ),
  );
}
