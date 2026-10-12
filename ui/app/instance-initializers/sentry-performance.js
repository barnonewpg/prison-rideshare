import { instrumentAppInstancePerformance } from '@sentry/ember';
import config from 'prison-rideshare-ui/config/environment';

// Traces page loads, route transitions and the requests they make. Only
// production builds with a Sentry DSN set up Sentry at all.
export function initialize(appInstance) {
  if (config.sentry.dsn) {
    instrumentAppInstancePerformance(appInstance);
  }
}

export default {
  initialize,
};
