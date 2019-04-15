comments:
  build -C packages/comments-server js
  build -C packages/comments-client js build_css
  mkdir -p build/comments/assets/
  cp packages/comments-client/build/client.js build/comments/assets/client.js
  cp packages/comments-client/build/style.css build/comments/assets/
  cp packages/comments-client/build/*.png build/comments/assets/
  cp packages/comments-client/svg/*.svg build/comments/assets/
  cp packages/comments-server/build/server.min.js build/comments/

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
