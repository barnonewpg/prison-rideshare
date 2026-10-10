import config from 'prison-rideshare-ui/config/environment';

export function isSandbox() {
  return window.location.hostname.indexOf('sandbox') > -1;
}

export function previewPullRequest() {
  return config.APP.previewPullRequest;
}

export function previewLabel() {
  const number = previewPullRequest();

  if (!number) {
    return undefined;
  }

  return `#${number} ${isSandbox() ? 'sandbox' : 'production'}`;
}
