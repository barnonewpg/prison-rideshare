'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const { setConfig } = await import('@warp-drive/build-config');
  const deployTarget = process.env.DEPLOY_TARGET;

  let autoImport = {};
  let fingerprint = {};
  let terser = {};

  if (deployTarget) {
    const s3Bucket = require('./config/deploy')(process.env.DEPLOY_TARGET).s3
      .bucket;

    autoImport.publicAssetURL = `//${s3Bucket}.s3.amazonaws.com/assets/`;
    fingerprint.prepend = `//${s3Bucket}.s3.amazonaws.com/`;
  }

  // Keep class and function names in PR previews so the Ember Inspector
  // shows real component names instead of minified ones. Webpack's own
  // minification of ember-auto-import chunks ignores these options, so it's
  // turned off and ember-cli-terser minifies those chunks instead.
  if (process.env.PREVIEW_PR_NUMBER) {
    terser = { terser: { keep_classnames: true, keep_fnames: true } };
    autoImport.webpack = { optimization: { minimize: false } };
  }

  const app = new EmberApp(defaults, {
    autoImport,
    babel: {
      plugins: [
        require.resolve('decorator-transforms'),
        require.resolve('ember-concurrency/async-arrow-task-transform'),
        // Required for dynamic import() to be code-split into its own chunk
        // rather than left as a bare specifier the browser cannot resolve.
        require.resolve('ember-auto-import/babel-plugin'),
      ],
    },
    'ember-cli-babel': {
      disableDecoratorTransforms: true,
    },
    fingerprint,
    'ember-cli-terser': terser,
    minifyCSS: {
      enabled: false,
    },
    sourcemaps: {
      enabled: true,
    },
    sassOptions: {
      precision: 4,
      includePaths: [
        './node_modules/@hashicorp/design-system-tokens/dist/products/css',
        './node_modules/@hashicorp/design-system-components/dist/styles',
      ],
    },
  });

  setConfig(app, __dirname, {
    deprecations: {
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  return app.toTree();
};
