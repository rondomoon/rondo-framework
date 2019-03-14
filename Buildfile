ts:
  tsc -b packages/

add:
  mkdir packages/$(name)
  cp -r template/* packages/$(name)/

test:
  jest
