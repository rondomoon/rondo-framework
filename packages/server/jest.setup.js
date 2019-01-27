if (!process.env.LOG) {
  process.env.LOG = 'sql:warn'
}
process.chdir(__dirname)
// jest.mock('./src/server/database/namespace')
