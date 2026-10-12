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

export default defineConfig({
  base: base(),
  build: {
    // Helios has selectors like ::file-selector-button.mock-hover that the
    // CSS minifier rejects, so CSS stays unminified as it was before Vite.
    cssMinify: false,
    sourcemap: true,
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
