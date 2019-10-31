process.stdin.on('data', data => {
  process.stdout.write(data)
  process.exit(0)
})
