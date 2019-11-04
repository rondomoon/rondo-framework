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
- [ ] Regenerate session id after logging in to prevent session hijacking

- [ ] react-test
  - [ ] Do not use a class
  - [ ] Call findRenderedComponentWithType after render, do not return
        intermediary TestContainer

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
  - [ ] Check if reakit still significantly slows down TS compilation

- [x] Use JSON schema instead of @Entity decorators
- [x] Extract database into a separate module
- [x] Replace tslint with eslint:
  https://github.com/typescript-eslint/typescript-eslint

- [x] Do not import express when importing jsonrpc
- [ ] Custom subdomains

- [ ] User Profile
  - [ ] Customize user data
  - [ ] Reset password
  - [ ] Delete account
  - [ ] Add/Remove profile picture

- [ ] Privacy
  - [x] Do not require email for account creation
  - [ ] Preventing fake accounts/spam using either:
    - [ ] Moderation techniques described below
    - [ ] Require proof of work during acct creation?
    - [ ] Open Source machine learning model for posts, if it exists
    - [x] svg-captcha from npm. Could prevent blind users from creating an account. Also, new ML models can probably read this format.
    - [x] Possible solution: use TTS like say.js to generate audio. Use tasq lib to prevent too much cpu usage if more users arrive.
    - [x] FIXME debug why espeak sometimes does not stream responses:w
  - [ ] Add privacy policy statement

- [ ] Email
  - [ ] Verification emails
  - [ ] Password reset emails
  - [ ] Digest emails (low priority)

- [ ] Web push notifications
  - [ ] Replies to parent comment
  - [ ] User references via @-prefix

- [ ] Add ability to cross-reference posts

- [ ] Realtime notifications
  - [ ] Socket.io w/ Redis
  - [ ] Investigate if web push notifications would eliminate immediate need for socket.io/redis

- [ ] Benchmarks
  - [ ] Test how long would it take to load and sort comments full tree of 100.000 comments, with 500-1000 chars each.
  - [ ] Test how much would profile images slow down the loading process
  - [ ] Investigate what could be done to keep loading this many comments without hogging the server
  - [ ] Reduce JS payload size. Hard because ReactDOM already uses more than 90kb compressed (I think).

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

- [ ] Think of a better project name

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
  - [ ] admins/moderators to approve comments
  - [ ] admins/moderators to ban users
  - [ ] admins/moderators to hide comments by default
  - [ ] start requiring approval for users who have been consequtively marked as spam 

- [ ] Monitoring
  - [ ] Prometheus
  - [ ] Server side errors
  - [ ] Client side errors

- [ ] Monetization
  - [ ] License: figure out the best license
  - [ ] SaaS payments
  - [ ] Donations
  - [ ] Consulting

- [ ] Meta posts
  - [ ] Add ability for users to start discussions without a relevant link
  - [ ] Add option to allow only certain roles to be able to author posts
  - [ ] This could potentially allow users to write blog posts with comments

- [ ] Aggregation
  - [ ] Post/story tags
  - [ ] Show latest posts/similar posts
      - [ ] From same site
      - [ ] From other sites
  - [ ] Pagination

- [ ] Images
  - [x] Client-side resize before upload
  - [ ] CDN
  - [ ] Storage for image uploads

# Possible future direction of development

- [ ] Mastodon
  - [ ] Allow users from multiple instances to reply to each other's posts. Would have to think about how to make money.

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
