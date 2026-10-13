import { DateTime } from 'luxon';
import { formatDate, toDateTime } from 'prison-rideshare-ui/utils/dates';

function isAnteMeridiem(time) {
  return time.hour < 12;
}

export default function formatTimespan(start, end, date = true) {
  const startTime = toDateTime(start);
  const endTime = toDateTime(end);
  let startDateFormat, startTimeFormat, endTimeFormat;

  if (startTime && DateTime.now().year == startTime.year) {
    startDateFormat = 'EEE LLL d';
  } else {
    startDateFormat = 'EEE LLL d yyyy';
  }

  if (startTime && startTime.minute === 0) {
    startTimeFormat = 'ha';
  } else {
    startTimeFormat = 'h:mma';
  }

  if (endTime && endTime.minute === 0) {
    endTimeFormat = 'h';
  } else {
    endTimeFormat = 'h:mm';
  }

  if (
    !startTime ||
    !endTime ||
    isAnteMeridiem(startTime) !== isAnteMeridiem(endTime)
  ) {
    endTimeFormat += 'a';
  }

  let startDateString = formatDate(startTime, 'yyyy-MM-dd');
  let endDateString = formatDate(endTime, 'yyyy-MM-dd');

  let yearsDiffer = Boolean(
    startTime && endTime && startTime.year !== endTime.year,
  );

  if (yearsDiffer) {
    if (!endTimeFormat.includes('a')) {
      endTimeFormat += 'a';
    }

    endTimeFormat = `EEE LLL d yyyy ${endTimeFormat}`;
  } else if (startDateString !== endDateString) {
    endTimeFormat = `EEE ${endTimeFormat}`;
  }

  return `${date ? `${formatDate(startTime, startDateFormat)} ` : ''}${formatDate(
    startTime,
    startTimeFormat,
  )} — ${formatDate(endTime, endTimeFormat)}`;
}
