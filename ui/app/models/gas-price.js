/* eslint-disable ember/no-classic-classes*/
import Model, { attr } from '@warp-drive/legacy/model';

export default Model.extend({
  price: attr(),
  closeRate: attr(),
  farRate: attr(),

  insertedAt: attr('date'),
});
