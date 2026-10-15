import 'decorator-transforms/globals';

import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'prison-rideshare-ui/config/environment';
import * as Sentry from '@sentry/ember';
import { registerDateLibrary } from 'ember-power-calendar';
import DateUtils from 'ember-power-calendar-luxon';
import { Settings } from 'luxon';
import { winnipegZone } from 'prison-rideshare-ui/utils/dates';
import '@warp-drive/ember/install';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
}

Sentry.init({
  dsn: config.sentry.dsn,
  sendDefaultPii: true,
});

Settings.defaultLocale = 'en-US';
Settings.defaultZone = winnipegZone;
registerDateLibrary(DateUtils);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix);
