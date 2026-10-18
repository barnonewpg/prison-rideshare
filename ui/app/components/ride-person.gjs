import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { modifier } from 'ember-modifier';
import PersonBadge from 'prison-rideshare-ui/components/person-badge';
import { HdsFormSuperSelectSingleField } from '@hashicorp/design-system-components/components';

export default class RidePerson extends Component {
  @service('people') peopleService;

  // A super select per ride row is slow to render, so a lookalike button stands in until it's used
  @tracked isSelecting = false;

  get person() {
    return this.args.ride.get(this.args.property);
  }

  get placeholder() {
    return this.args.property === 'driver' ? 'Driver' : 'Car Owner';
  }

  // Focus moves to the select so it can be used with a keyboard after the placeholder is gone
  focusTrigger = modifier((element) => element.focus());

  @action
  startSelecting() {
    this.isSelecting = true;
  }

  @action
  choose(person) {
    this.isSelecting = false;
    return this.args.onChange(person);
  }

  @action
  clear() {
    const ride = this.args.ride;
    ride.set(this.args.property, null);
    return ride.save();
  }

  <template>
    {{#if this.person}}
      <span class='ride-person' ...attributes>
        <PersonBadge
          @person={{this.person}}
          @property={{@property}}
          @clear={{this.clear}}
        />
      </span>
    {{else if this.isSelecting}}
      <HdsFormSuperSelectSingleField
        data-test-ride-person-select={{@property}}
        @placeholder={{this.placeholder}}
        @options={{this.peopleService.active}}
        @selected={{this.person}}
        @searchField='name'
        @allowClear={{true}}
        @onChange={{this.choose}}
        @initiallyOpened={{true}}
        ...attributes
        {{this.focusTrigger}}
        as |F|
      >
        <F.Options>
          {{#let F.options as |option|}}
            {{option.name}}
          {{/let}}
        </F.Options>
      </HdsFormSuperSelectSingleField>
    {{else}}
      <div class='hds-form-field--layout-vertical'>
        <div class='hds-form-field__control'>
          <div class='hds-form-super-select hds-form-super-select-single'>
            <div class='ember-basic-dropdown'>
              <button
                type='button'
                class='ember-basic-dropdown-trigger ember-basic-dropdown-trigger--in-place ember-power-select-trigger ride-person-placeholder'
                aria-haspopup='listbox'
                data-test-ride-person-placeholder={{@property}}
                ...attributes
                {{on 'click' this.startSelecting}}
              >
                <span
                  class='hds-text hds-typography-body-200 hds-font-weight-regular ember-power-select-placeholder'
                >{{this.placeholder}}</span>
                <span class='ember-power-select-status-icon'></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    {{/if}}
  </template>
}
