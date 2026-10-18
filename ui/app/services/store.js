import { useLegacyStore } from '@warp-drive/legacy';
import { JSONAPICache } from '@warp-drive/json-api';

// Models, adapters, serializers and the store.findAll/query/etc. methods
// still work as they did with the ember-data package.
export default useLegacyStore({
  linksMode: false,
  legacyRequests: true,
  cache: JSONAPICache,
});
