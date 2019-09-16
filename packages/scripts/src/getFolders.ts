import { readdirSync, lstatSync } from "fs"
import { join } from "path"

export function getFolders(dir: string): string[] {
  return readdirSync(dir)
  .map(file => join(dir, file))
  .filter(dir => {
    const stat = lstatSync(dir)
    return stat.isDirectory()
  })
}
