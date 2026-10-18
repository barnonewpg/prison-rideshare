/* eslint-disable ember/no-classic-classes */
import Model, { belongsTo } from '@warp-drive/legacy/model';

export default Model.extend({
  slot: belongsTo('slot', { async: false, inverse: 'commitments' }),
  person: belongsTo('person', { async: false, inverse: null }),
});
