# TODO

- [x] Add team manager
- [x] Add site manager
- [x] Add site list
- [x] Isolate public routes from ensureLoggedIn - done by using jsonrpc
- [x] Add `Comments` component
- [ ] Add tests for site manager
- [ ] Fix React SSR error handling
- [ ] Add React error boundaries
- [x] Use strings as ids for big decimals TODO verify

- [ ] Social logins
  - [ ] GitHub
  - [ ] Twitter
  - [ ] Google
  - [ ] Facebook
- [ ] Framework development
  - [ ] Improve comments
  - [ ] Generate docs using using `typedoc`
  - [ ] Generate framework website using Docusaurus
  - [ ] Split framework projects and actual projects

- [ ] Styled components
  - [x] SSR
  - [ ] Replace bulma/blommer css framework with styled components
  - [ ] Check if restyped still significantly slows down TS compilation

- [x] Use JSON schema instead of @Entity decorators
- [x] Extract database into a separate module
- [x] Replace tslint with eslint:
  https://github.com/typescript-eslint/typescript-eslint

- [x] Do not import express when importing jsonrpc
- [ ] Custom subdomains
- [ ] Customizable user profile

- [ ] Privacy
  - [ ] User account creation with username/password only
  - [ ] Preventing fake accounts/spam
    - [ ] Using moderation techniques described below
    - [ ] Require proof of work during acct creation?

- [ ] Email
  - [ ] Verification emails
  - [ ] Password reset emails
  - [ ] Digest emails (low priority)

- [ ] Web push notifications
  - [ ] Replies to parent comment
  - [ ] User references via @-prefix

- [ ] Realtime notifications
  - [ ] Socket.io w/ Redis
  - [ ] Investigate if web push notifications would eleminate immediate need for socket.io/redis

- [ ] Benchmarks
  - [ ] Test how long would it take to load and sort comments full tree of 100.000 comments
  - [ ] Investigate what could be done to keep loading this many comments without hogging the server
  - [ ] Reduce JS payload size

- [ ] Pagination
  - [ ] offset/limit or last id
  - [ ] Check TypeORM's offset/limit support

- [ ] Embedding comments
  - [ ] Iframe
    - [ ] Automatically resize iframe height
  - [ ] JavaScript

- [x] Add ability to bootstrap server in cluster mode

- [ ] OpenGraphScraper
  - [x] Add support for scraping URLs
  - [ ] Do we need to respect robots.txt?
  - [ ] How can Telegram cache site contents using InstantView? Is it legal?
  - [ ] Prevent DDoS by scanning sites in queue (tasq module should help)
  - [ ] Disable access to localhost, local IP addresses, etc
  - [ ] Think about fallback if site is not scanned within 4 seconds

- [ ] Project name

- [ ] Comments representation
  - [x] Tree (reddit/hn-style)
  - [ ] Forum
  - [ ] Q&A (forum w/ 1st level comments)

- [ ] Voting
  - [x] Add ability to upvote
  - [ ] Add (optional) ability to dowmvote
  - [ ] Add per-site configuration to enable/disable voting

- [ ] Spam
  - [x] Add ability to mark comments as spam

- [ ] Moderation
  - [ ] Add ability for admins/moderators to approve comments
  - [ ] Add ability for admins/moderators to ban users
  - [ ] Add ability for admins/moderators to hide comments by default

- [ ] Monitoring
  - [ ] Prometheus
  - [ ] Server side errors
  - [ ] Client side errors

- [ ] SaaS Payments

- [ ] License


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
