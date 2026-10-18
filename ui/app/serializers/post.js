/* eslint-disable ember/no-classic-classes*/
import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';

export default JSONAPISerializer.extend({
  attrs: {
    body: 'content',
  },
});
