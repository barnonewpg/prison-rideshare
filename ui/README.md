# Prison Rideshare UI [![UI](https://github.com/barnonewpg/prison-rideshare/actions/workflows/ui.yml/badge.svg)](https://github.com/barnonewpg/prison-rideshare/actions/workflows/ui.yml) [![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/Bar-None/prison-rideshare-ui)

This is an Ember front-end for the [prison rideshare API](../api). Visit the [sandbox](https://sandbox.barnonewpg.org/login)!

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [mise](https://mise.jdx.dev/), which installs the Node and pnpm versions in `mise.toml`
* [Ember CLI](https://cli.emberjs.com/release/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd prison-rideshare/ui`
* `mise install`
* `pnpm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint`
* `npm run lint:fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
