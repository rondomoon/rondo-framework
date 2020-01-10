# Rondo Framework

The Rondo Framework is a set of libraries and command line utilities to help
build modern applications using TypeScript with React Server-side Rendering. It
was developed for internal use at [rondomoon][rondomoon] and is now published
under the MIT license.

[rondomoon]: https://rondomoon.com

# Key Features

Most of libraries within this framework can be used on their own. Following is
a list of libraries with feature descriptions.

- @rondo.dev/argparse
  CLI argument parser library

- @rondo.dev/captcha
  A captcha middleware that uses the svg-captcha package under the hood.

- @rondo.dev/client
  A set of React components that can be used to build a basic web application
  with user and team management

- @rondo.dev/common
  Common functions and interface definitions shared between server and client,
  as well as interface definitions

- @rondo.dev/config
  A config library similar to node-config with some added goodies, the main
  one being able to load default configuration included in a published
  package.

- @rondo.dev/db
  A set of interfaces for generic database access

- @rondo.dev/db-typeorm
  Implements interfaces from @rondo.dev/db for TypeORM

- @rondo.dev/http-client
  HTTP client based on axios that can be easily mocked

- @rondo.dev/http-types
  Definitions of types required to make http frameworks type safe

- @rondo.dev/image-upload
  A React component for image-upload. Work in progress

- @rondo.dev/jsonrpc
  A set client and server-side library implementing JSON-RPC. The main selling
  point is that it can automatically generate type-safe clients on the
  client-side.

- @rondo.dev/logger
  Logger library borrowing ideas from winston and debug.

- @rondo.dev/middleware

- @rondo.dev/react-captcha
  Client-side React library for use with @rondo.dev/captcha

- @rondo.dev/react-test
  Additional testing methods for testing React components. Can automatically
  create providers when testing components using redux and/or
  styled-components.

- @rondo.dev/redux
  A wrapper around redux and react-redux. Provides a `pack` method which aids
  in wrapping and sharing redux components across projects.

- @rondo.dev/rondo-cli
  Provides useful command line features reduce the amount of repetitive tasks.

- @rondo.dev/server
  A set of tools to aid in creating application server supporting
  server-side rendering of React components and.

- @rondo.dev/tasq
  A task queue library that can be used to execute tasks in new subprocesses
  or as promises.

- @rondo.dev/test-utils
  A set of generic test utils.

- @rondo.dev/validator
  A tiny component to aid in validating data structures and generating
  helpful error messages.
