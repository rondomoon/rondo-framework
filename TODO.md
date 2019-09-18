# TODO

- [x] Add team manager
- [x] Add site manager
- [x] Add site list
- [x] Isolate public routes from ensureLoggedIn - done by using jsonrpc
- [x] Add `Comments` component
- [ ] Add tests for site manager
- [ ] Fix React SSR error handling
- [ ] Add React error boundaries
- [ ] Use strings as ids for big decimals
- [ ] Integrate Google (and other social fb/twitter) logins
- [ ] Framework development
  - [ ] Improve comments
  - [ ] Generate docs using using `typedoc`
  - [ ] Generate framework website using Docusaurus
  - [ ] Split framework projects and actual projects
- [ ] Experiment with styled components
- [ ] Use JSON schema instead of @Entity decorators
- [x] Extract database into a separate module
- [x] Replace tslint with eslint:
  https://github.com/typescript-eslint/typescript-eslint

# JSONRPC

- [x] Implement JSONRPC
- [x] Make it easy to create actions and reducers based on JSONRPC method
  sigatures
- [x] Refactor part of functionality as POC
- [x] Refactor comments projects to only use JSONRPC

# ORM

- [x] Fix migrations so that they do not recreate a bunch of changes that
  are not needed. Possibly related to fix in 517dd2f

# Tests

- [x] Figure out a way to make server-side tests execute successfully without

  `--runInBand`
  Done by using unique user ids per jest thread, using the
  `process.env.JEST_WORKER_ID` variable on the mysql projects.

  The `server/` tests run migrations at the beginning and each jest worker
  creates a new in-memory SQLite database because TypeORM will not allow
  multiple (queued) transactions - it only uses a single SQLite connection.

# Issues
