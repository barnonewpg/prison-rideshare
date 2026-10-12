import SessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Session extends SessionService {
  @service overlaps;
  @service store;
  @service userSocket;

  @tracked currentUser;

  handleAuthentication(routeAfterAuthentication) {
    // Logged-out visitors only receive the rides that can be reported on,
    // discard them so they don't flash on the rides list before the full
    // list loads.
    this.store.unloadAll();

    this.userSocket.connect();

    // The overlaps service outlives logout, so refetch for this session.
    this.overlaps.fetch();

    super.handleAuthentication(routeAfterAuthentication);
  }
}
