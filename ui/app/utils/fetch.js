import { waitForPromise } from '@ember/test-waiters';

// Native fetch, tracked so tests wait for requests to settle as they did
// with ember-fetch.
export default function fetch(...args) {
  return waitForPromise(window.fetch(...args));
}
