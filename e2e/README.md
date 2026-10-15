# End-to-end smoke tests

A few [Playwright](https://playwright.dev) tests that drive the production UI build against the real Phoenix API and a database loaded with the sandbox seeds. The UI’s acceptance tests run against Mirage and the API’s tests run without a browser, so these are what catch the two disagreeing: payload shapes, units, auth.

Keep them few and broad; detailed UI behaviour belongs in `ui/tests`.

## Running locally

The API runs on port 4100 against its own `prison_rideshare_e2e` database, so a dev server on 4000 and its data are untouched. Postgres needs a `postgres`/`postgres` user, as for the API’s tests.

```sh
pnpm install
pnpm exec playwright install chromium

pnpm build:ui   # production build pointed at localhost:4100
pnpm reset-db   # recreate the e2e database from the sandbox seeds
pnpm test
```

Playwright starts the API and a static server for `ui/dist` itself. The tests change the data they use, so run `pnpm reset-db` again before rerunning; the driver report test runs out of reportable rides after a few runs.
