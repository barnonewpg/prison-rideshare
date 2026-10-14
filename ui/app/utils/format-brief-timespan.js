import { formatDate, toDateTime } from 'prison-rideshare-ui/utils/dates';

function isAnteMeridiem(time) {
  return time.hour < 12;
}

export default function formatBriefTimespan(start, end) {
  const startTime = toDateTime(start);
  const endTime = toDateTime(end);
  let startTimeFormat, endTimeFormat;

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

  return `${formatDate(startTime, startTimeFormat)}—${formatDate(
    endTime,
    endTimeFormat,
  )}`;
}
