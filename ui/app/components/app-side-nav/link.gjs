import Component from '@glimmer/component';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';

// See docs/helios-overrides.md
export default class AppSideNavLinkComponent extends Component {
  @service router;

  get hasModel() {
    return this.args.model !== undefined && this.args.model !== null;
  }

  get isActive() {
    // Read currentURL so this recomputes on every transition.
    this.router.currentURL;

    return this.hasModel
      ? this.router.isActive(this.args.route, this.args.model)
      : this.router.isActive(this.args.route);
  }

  <template>
    <li class='app-side-nav__item'>
      {{#if this.hasModel}}
        <LinkTo
          @route={{@route}}
          @model={{@model}}
          class='app-side-nav__link
            {{if this.isActive "app-side-nav__link--active"}}'
          ...attributes
        >
          <span class='app-side-nav__link-label'>
            {{@text}}
          </span>
          {{yield}}
        </LinkTo>
      {{else}}
        <LinkTo
          @route={{@route}}
          class='app-side-nav__link
            {{if this.isActive "app-side-nav__link--active"}}'
          ...attributes
        >
          <span class='app-side-nav__link-label'>
            {{@text}}
          </span>
          {{yield}}
        </LinkTo>
      {{/if}}
    </li>
  </template>
}
