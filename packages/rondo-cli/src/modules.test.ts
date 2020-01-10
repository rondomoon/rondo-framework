import { platform } from 'os'
import { findNodeModules, getPathSeparator, getPathVariable } from './modules'

describe('modules', () => {

  describe('getPathSeparator', () => {
    it('returns ";" when win32', () => {
      expect(getPathSeparator('win32')).toEqual(';')
    })
    it('returns ":" otherwise', () => {
      expect(getPathSeparator('linux')).toEqual(':')
      expect(getPathSeparator('darwin')).toEqual(':')
      expect(getPathSeparator('mac')).toEqual(':')
    })
  })

  describe('findNodeModules', () => {
    it('should find node_modules/.bin dirs in parent path(s)', () => {
      const dirs = findNodeModules()
      expect(dirs.length).toBeGreaterThanOrEqual(1)
    })
    it('should not fail when path does not exist', () => {
      const dirs = findNodeModules('/non/existing/path/bla/123')
      expect(dirs).toEqual([])
    })
  })

  describe('addToPath', () => {
    it('does nothing when pathsToAdd is empty', () => {
      const paths = getPathVariable([])
      expect(paths).toEqual(process.env.PATH)
    })
    it('adds paths to path variable', () => {
      const separator = getPathSeparator(platform())
      const paths = getPathVariable(['/a', '/b'], '/c')
      expect(paths).toEqual(`/a${separator}/b${separator}/c`)
    })
    it('adds node modules paths to path variable by default', () => {
      const paths = findNodeModules()
      const separator = getPathSeparator(platform())
      expect(paths.length).toBeGreaterThanOrEqual(1)
      expect(getPathVariable())
      .toEqual(`${paths.join(separator)}${separator}${process.env.PATH}`)
    })
  })

})
