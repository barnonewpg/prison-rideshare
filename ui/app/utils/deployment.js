import config from 'prison-rideshare-ui/config/environment';

export function isSandbox() {
  return window.location.hostname.indexOf('sandbox') > -1;
}

export function previewPullRequest() {
  return config.APP.previewPullRequest;
}

export function previewBranch() {
  return config.APP.previewBranch;
}

export function previewLabel() {
  const number = previewPullRequest();
  const name = number ? `#${number}` : previewBranch();

  if (!name) {
    return undefined;
  }

  return `${name} ${isSandbox() ? 'sandbox' : 'production'}`;
}
