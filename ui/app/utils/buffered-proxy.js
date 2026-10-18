/* eslint-disable ember/no-get */
/* eslint-disable ember/no-new-mixins */
import ObjectProxy from '@ember/object/proxy';
import Mixin from '@ember/object/mixin';
import { isArray } from '@ember/array';
import { readOnly } from '@ember/object/computed';
import {
  defineProperty,
  getProperties,
  set,
  get,
  notifyPropertyChange,
} from '@ember/object';

// Adapted from ember-buffered-proxy 2.1.1 (MIT, https://github.com/yapplabs/ember-buffered-proxy),
// which is unmaintained and reads Ember.meta from the `ember` module that
// Ember 7 removed. It used meta to tell whether the object was still being
// created; a flag set in init does the same.

const hasOwnProp = Object.prototype.hasOwnProperty;

function empty(obj) {
  return Object.keys(obj).length === 0;
}

const BufferedProxyMixin = Mixin.create({
  buffer: null,
  hasBufferedChanges: false,

  hasChanges: readOnly('hasBufferedChanges'),

  init() {
    this._bufferInitialized = true;
    this.initializeBuffer();
    set(this, 'hasBufferedChanges', false);
    this._super(...arguments);
  },

  initializeBuffer(onlyTheseKeys) {
    if (isArray(onlyTheseKeys) && onlyTheseKeys.length > 0) {
      onlyTheseKeys.forEach((key) => delete this.buffer[key]);
    } else {
      set(this, 'buffer', Object.create(null));
    }
  },

  unknownProperty(key) {
    const buffer = get(this, 'buffer');

    return buffer && hasOwnProp.call(buffer, key)
      ? buffer[key]
      : this._super(key);
  },

  setUnknownProperty(key, value) {
    if (!this._bufferInitialized) {
      // Properties passed to create() are defined rather than buffered
      defineProperty(this, key, null, value);
      return value;
    }

    const { buffer, content } = getProperties(this, ['buffer', 'content']);
    let current;

    if (content != null) {
      current = get(content, key);
    }

    const previous = hasOwnProp.call(buffer, key) ? buffer[key] : current;

    if (previous === value) {
      return;
    }

    if (current === value) {
      delete buffer[key];
      if (empty(buffer)) {
        set(this, 'hasBufferedChanges', false);
      }
    } else {
      buffer[key] = value;
      set(this, 'hasBufferedChanges', true);
    }

    notifyPropertyChange(this, key);

    return value;
  },

  applyBufferedChanges(onlyTheseKeys) {
    const { buffer, content } = getProperties(this, ['buffer', 'content']);

    Object.keys(buffer).forEach((key) => {
      if (isArray(onlyTheseKeys) && !onlyTheseKeys.includes(key)) {
        return;
      }

      set(content, key, buffer[key]);
    });

    this.initializeBuffer(onlyTheseKeys);

    if (empty(get(this, 'buffer'))) {
      set(this, 'hasBufferedChanges', false);
    }
  },

  discardBufferedChanges(onlyTheseKeys) {
    const buffer = get(this, 'buffer');

    this.initializeBuffer(onlyTheseKeys);

    Object.keys(buffer).forEach((key) => {
      if (isArray(onlyTheseKeys) && !onlyTheseKeys.includes(key)) {
        return;
      }

      notifyPropertyChange(this, key);
    });

    if (empty(get(this, 'buffer'))) {
      set(this, 'hasBufferedChanges', false);
    }
  },

  applyChanges(...args) {
    return this.applyBufferedChanges(...args);
  },

  discardChanges(...args) {
    return this.discardBufferedChanges(...args);
  },

  // Whether the given key has a buffered value that differs from the content
  hasChanged(key) {
    const { buffer, content } = getProperties(this, ['buffer', 'content']);

    if (typeof key !== 'string' || typeof get(buffer, key) === 'undefined') {
      return false;
    }

    return get(buffer, key) !== get(content, key);
  },
});

export default ObjectProxy.extend(BufferedProxyMixin);
