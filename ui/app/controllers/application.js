import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @service overlaps;
  @service sidebar;
  @service session;
  @service store;
  @service userSocket;

  @tracked headerElement;

  get ridesBadgeCount() {
    const overlapsCount = this.overlaps.count ?? 0;

    return overlapsCount + this.sidebar.requiresConfirmationCount;
  }

  @action
  logout() {
    this.session.invalidate();
    this.store.unloadAll();
  }
}
