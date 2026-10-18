import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import reasonToIcon from 'prison-rideshare-ui/utils/reason-to-icon';
import fetch from 'prison-rideshare-ui/utils/fetch';
import { formatDate } from 'prison-rideshare-ui/utils/dates';
import ScrollTo from 'prison-rideshare-ui/components/scroll-to';
import LinkedContact from 'prison-rideshare-ui/components/linked-contact';
import RidePerson from 'prison-rideshare-ui/components/ride-person';
import ReimbursementUnit from 'prison-rideshare-ui/components/reimbursement-unit';
import {
  HdsButton,
  HdsIcon,
} from '@hashicorp/design-system-components/components';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import or from 'ember-truth-helpers/helpers/or';
import not from 'ember-truth-helpers/helpers/not';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';

export default class RideRow extends Component {
  <template>
    <@table.Tr
      class={{this.rowClass}}
      data-test-ride-row
      data-ride-id={{@ride.id}}
    >
      {{#if this.showCreation}}
        <@table.Td data-test-ride-creation>
          {{this.creation}}
        </@table.Td>
      {{/if}}
      <@table.Td
        class='date-cell'
        data-test-ride-date-cell
        {{on 'click' this.toggleCreation}}
      >
        {{#if @ride.isDivider}}
          <ScrollTo />
        {{/if}}
        <span class='date' data-test-ride-date>
          {{@ride.rideTimes}}
        </span>
      </@table.Td>
      <@table.Td class='institution' data-test-ride-institution>
        {{@ride.institution.name}}
      </@table.Td>
      <@table.Td>
        <span class='name' data-test-ride-name>
          {{@ride.namePlusPassengers}}
        </span>
        {{#if @ride.firstTime}}
          <HdsIcon
            @name='alert-triangle'
            @size='16'
            @isInline={{true}}
            @title='First-time rider'
            data-test-ride-first-time
          />
        {{/if}}
        <div data-test-ride-medium data-medium={{@ride.medium}}>
          {{#if this.mediumIcon}}
            <HdsIcon @name={{this.mediumIcon}} @size='16' @isInline={{true}} />
          {{/if}}
          <span data-test-ride-contact>
            <LinkedContact @contact={{@ride.contact}} />
          </span>
        </div>
      </@table.Td>
      <@table.Td data-test-ride-address>
        {{@ride.address}}
      </@table.Td>
      <@table.Td data-test-ride-assignments>
        <div class='assignments'>
          {{#if @combined}}
            {{#unless @rideToCombine}}
              <HdsButton
                data-test-combine-button
                @text='Uncombine this ride'
                title='Uncombine this ride'
                @size='small'
                @color='tertiary'
                @isIconOnly={{true}}
                @isInline={{true}}
                @icon='split'
                {{on 'click' (fn @uncombineRide @ride)}}
              />
            {{/unless}}
          {{else}}
            <RidePerson
              data-test-driver
              @ride={{@ride}}
              @property='driver'
              @onChange={{this.setDriver}}
            />
            <RidePerson
              data-test-car-owner
              @ride={{@ride}}
              @property='carOwner'
              @onChange={{this.setCarOwner}}
            />
            {{#if @ride.overridable}}
              <span data-test-overridable-indicator>
                <HdsIcon @name='car' @size='16' @isInline={{true}} />
              </span>
            {{/if}}
            {{#if (or (not this.rideChildrenArray) @rideToCombine)}}
              {{#let
                (and @rideToCombine (eq @ride.id @rideToCombine.id))
                as |maybeCombining|
              }}
                <HdsButton
                  data-test-combine-button
                  @text={{if maybeCombining 'Cancel combining' 'Combine'}}
                  title={{this.combineButtonTitle}}
                  @size='small'
                  @color='tertiary'
                  @isIconOnly={{not maybeCombining}}
                  @isInline={{true}}
                  @icon='merge'
                  {{on 'click' (fn @combineRide @ride)}}
                  data-active={{if maybeCombining 'true' 'false'}}
                />
              {{/let}}
            {{/if}}
          {{/if}}
        </div>
      </@table.Td>
      <@table.Td>
        <HdsButton
          data-test-cancellation-button
          data-cancellation-state={{this.cancellationState}}
          title={{this.cancellationButtonLabel}}
          @text={{this.cancellationButtonLabel}}
          @color='tertiary'
          @isIconOnly={{true}}
          @isInline={{true}}
          @icon={{if @ride.enabled 'x-circle' this.cancellationIcon}}
          {{on 'click' (fn @editCancellation @ride)}}
        />
        <HdsButton
          data-test-edit-ride
          @text='Edit ride'
          @color='tertiary'
          @isIconOnly={{true}}
          @isInline={{true}}
          @icon='edit'
          {{on 'click' (fn @editRide @ride)}}
        />
      </@table.Td>
    </@table.Tr>

    {{#each this.commitments as |commitment|}}
      <@table.Tr
        class='overlap highlighted no-top-border'
        data-test-overlap-row
      >
        {{#if this.showCreation}}
          <@table.Td />
        {{/if}}
        <@table.Td colspan='3'>
          <HdsIcon @name='calendar' @size='16' @isInline={{true}} />
          <span data-test-overlap-text>
            {{commitment.person.name}}
            committed to slot
            {{commitment.timespan}}
          </span>
        </@table.Td>
        <@table.Td colspan='3'>
          <button
            type='button'
            data-test-overlap-assign
            {{on 'click' (fn this.assignFromCommitment commitment)}}
          >
            Assign
          </button>
          <button
            type='button'
            data-test-overlap-ignore
            {{on 'click' (fn this.ignoreCommitment commitment)}}
          >
            Ignore
          </button>
        </@table.Td>
      </@table.Tr>
    {{/each}}

    {{#if @ride.requiresConfirmation}}
      <@table.Tr class='highlighted no-top-border' data-test-confirmation-row>
        {{#if this.showCreation}}
          <@table.Td />
        {{/if}}
        <@table.Td colspan='3'>
          {{#if this.mediumIcon}}
            <HdsIcon @name={{this.mediumIcon}} @size='16' @isInline={{true}} />
          {{/if}}
          <span class='text' data-test-confirmation-text>
            Contact visitor to confirm receipt of ride request
          </span>
        </@table.Td>
        <@table.Td colspan='3'>
          <button
            type='button'
            data-test-confirmation-mark
            {{on 'click' this.markConfirmed}}
          >
            Mark as contacted
          </button>
        </@table.Td>
      </@table.Tr>
    {{/if}}

    {{#if @ride.requestNotes}}
      <@table.Tr
        class='notes no-top-border
          {{if @ride.requiresConfirmation "highlighted"}}'
        data-test-notes-row
      >
        {{#if this.showCreation}}
          <@table.Td />
        {{/if}}
        <@table.Td data-test-notes colspan='6'>
          {{@ride.requestNotes}}
        </@table.Td>
      </@table.Tr>
    {{/if}}

    {{#if @ride.complete}}
      <@table.Tr class='report no-top-border' data-test-report-row>
        {{#if this.showCreation}}
          <@table.Td />
        {{/if}}
        <@table.Td colspan='6'>
          <HdsIcon @name='map' @size='16' @isInline={{true}} />

          <span class='distance' data-test-report-distance>
            {{@ride.distance}}
          </span>
          {{#if @ride.carExpenses}}
            <HdsIcon @name='fuel' @size='16' @isInline={{true}} />

            <span data-test-report-car-expenses>
              {{@ride.carExpensesDollars}}
            </span>
            {{#if (and @ride.rate (not @ride.overridable))}}
              (<span data-test-report-rate>{{@ride.rate}}<ReimbursementUnit
                /></span>)
            {{/if}}
          {{/if}}
          {{#if @ride.foodExpenses}}
            <HdsIcon @name='coffee' @size='16' @isInline={{true}} />

            <span data-test-report-food>
              {{@ride.foodExpensesDollars}}
            </span>
          {{/if}}
          {{#if @ride.reportNotes}}
            <span class='notes' data-test-report-notes>
              {{@ride.reportNotes}}
            </span>
          {{/if}}
          {{#if this.clearing}}
            Clear this report?
            <button
              type='button'
              data-test-report-clear-confirm
              {{on 'click' this.clearReport}}
            >
              Yes
            </button>
            <button
              type='button'
              data-test-report-clear-cancel
              {{on 'click' this.unproposeClear}}
            >
              No
            </button>
          {{else}}
            <button
              type='button'
              data-test-report-clear
              {{on 'click' this.proposeClear}}
            >
              Clear report
            </button>
          {{/if}}
        </@table.Td>
      </@table.Tr>
    {{/if}}
  </template>

  @service
  overlaps;

  @service
  session;

  @service
  store;

  @tracked clearing = false;
  @tracked showCreationOverride;

  get showCreation() {
    return this.showCreationOverride ?? this.args.showCreation;
  }

  get rowClass() {
    const ride = this.args.ride;

    return `ride ${ride.enabled ? 'enabled' : ''} ${
      this.uncombinable ? 'uncombinable' : ''
    } ${ride.isCombined ? 'combined' : ''} ${ride.isDivider ? 'divider' : ''} ${
      ride.requiresConfirmation || this.commitments.length ? 'highlighted' : ''
    }`;
  }

  get commitments() {
    return this.overlaps.commitmentsForRide(this.args.ride);
  }

  get creation() {
    return formatDate(this.args.ride.insertedAt, 'EEE LLL d yyyy h:mma');
  }

  get cancellationIcon() {
    const ride = this.args.ride;

    if (ride.enabled) {
      return 'slash';
    }

    return reasonToIcon[ride.cancellationReason] ?? 'alert-circle';
  }

  get cancellationButtonLabel() {
    const ride = this.args.ride;

    if (ride.enabled) {
      return 'Cancel ride';
    } else {
      return `Edit cancellation: ${ride.cancellationReason}`;
    }
  }

  get cancellationState() {
    const ride = this.args.ride;
    return ride.enabled ? 'not-cancelled' : ride.cancellationReason;
  }

  get combineButtonTitle() {
    if (this.args.ride.id === this.args.rideToCombine?.id) {
      return 'Cancel combining';
    }

    return 'Combine with another ride';
  }

  get uncombinable() {
    const sixHours = 1000 * 60 * 60 * 6;
    const rideToCombineStart = this.args.rideToCombine?.start;

    if (!rideToCombineStart) {
      return false;
    }

    return (
      Math.abs(
        new Date(rideToCombineStart).getTime() -
          new Date(this.args.ride.start).getTime(),
      ) > sixHours
    );
  }

  get mediumIcon() {
    switch (this.args.ride.medium) {
      case 'txt':
        return 'message-circle';
      case 'email':
        return 'mail';
      case 'phone':
        return 'phone';
      default:
        return null;
    }
  }

  get rideChildrenArray() {
    return this.args.ride.children.slice();
  }

  @action
  setDriver(driver) {
    const ride = this.args.ride;

    ride.set('driver', driver);

    return ride
      .get('carOwner')
      .then((carOwner) => {
        if (!carOwner) {
          ride.set('carOwner', driver);
        }

        return ride.save();
      })
      .then(() => this.overlaps.fetch());
  }

  @action
  setCarOwner(carOwner) {
    const ride = this.args.ride;

    ride.set('carOwner', carOwner);
    return ride.save();
  }

  @action
  assignFromCommitment(commitmentJson) {
    let person = this.store.peekRecord(
      'person',
      commitmentJson.relationships.person.data.id,
    );

    this.setDriver(person);
  }

  @action
  ignoreCommitment(commitmentJson) {
    let ride = this.args.ride;
    let url = `${ride.store
      .adapterFor('ride')
      .buildURL('ride', ride.id)}/ignore/${commitmentJson.id}`;
    let token = this.session.data?.authenticated?.access_token;

    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => this.overlaps.fetch());
  }

  @action
  markConfirmed() {
    let ride = this.args.ride;
    ride.set('requestConfirmed', true);
    return ride.save();
  }

  @action
  toggleCreation() {
    this.showCreationOverride = !this.showCreation;
  }

  @action
  proposeClear() {
    this.clearing = true;
  }

  @action
  unproposeClear() {
    this.clearing = false;
  }

  @action
  clearReport() {
    const ride = this.args.ride;

    ride.setProperties({
      donation: null,
      distance: null,
      reportNotes: null,
      foodExpenses: 0,
      carExpenses: 0,
      complete: false,
    });

    ride.save();
  }
}
