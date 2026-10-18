import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

const require = createRequire(import.meta.url);

// Deploys serve index.html from Redis and the assets from S3.
function base() {
  const deployTarget = process.env.DEPLOY_TARGET;

  if (!deployTarget) {
    return '/';
  }

  const { bucket } = require('./config/deploy')(deployTarget).s3;
  return `https://${bucket}.s3.amazonaws.com/`;
}

// Keep names in PR previews so the Ember Inspector shows real component
// names instead of minified ones. Components compile to anonymous classes
// assigned to variables, so their names only survive if variables aren't
// mangled. Outside previews this leaves Embroider's Terser defaults alone.
function terserOptions() {
  if (!process.env.PREVIEW_PR_NUMBER) {
    return undefined;
  }

  return {
    module: true,
    compress: {
      passes: 3,
      keep_fargs: false,
      toplevel: true,
      keep_classnames: true,
      keep_fnames: true,
    },
    mangle: false,
  };
}

export default defineConfig({
  base: base(),
  build: {
    // Helios has selectors like ::file-selector-button.mock-hover that the
    // CSS minifier rejects, so CSS stays unminified as it was before Vite.
    cssMinify: false,
    sourcemap: true,
    terserOptions: terserOptions(),
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [
          'node_modules',
          'node_modules/@hashicorp/design-system-tokens/dist/products/css',
          'node_modules/@hashicorp/design-system-components/dist/styles',
        ],
      },
    },
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
