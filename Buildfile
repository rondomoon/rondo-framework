build_ts:
  tsc -b packages/

watch_ts:
  tsc --build packages/ --watch --preserveWatchOutput

add:
  mkdir packages/$(name)
  cp -r template/* packages/$(name)/

clean:
  rm -rf packages/*/{lib,esm}

sync-esm-config:
  node scripts/sync-esm-config.js

test:
  jest
