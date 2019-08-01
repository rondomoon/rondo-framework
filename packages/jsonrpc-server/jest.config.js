module.exports = {
  globals: {
    'ts-jest': {
      compiler: 'ttypescript'
    }
  },
  roots: [
    '<rootDir>/src'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.tsx?$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: false
}
