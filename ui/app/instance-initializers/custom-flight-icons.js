import { IconRegistry } from '@hashicorp/flight-icons/symbol-js/registry';
import customFlightIconSprite from 'prison-rideshare-ui/utils/custom-flight-icon-sprite';

const SYMBOL_REGEX =
  /<symbol\s[^>]*?id="hds-icon-flight-([a-z0-9-]+)-(16|24)"[\s\S]*?<\/symbol>/g;

// HDS looks icons up in the flight-icons registry and lazily loads each size’s
// <symbol> markup into its own sprite, so custom icons are registered the same way.
export function initialize() {
  for (const [markup, name, size] of customFlightIconSprite.matchAll(
    SYMBOL_REGEX,
  )) {
    IconRegistry[name] ??= { flight: {}, carbon: null };
    IconRegistry[name].flight[size] = () =>
      Promise.resolve({ default: markup });
  }
}

export default {
  initialize,
};
