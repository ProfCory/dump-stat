#!/usr/bin/env node
import { mkdir, readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const approvedDir = join(root, "public", "approved-content")

await mkdir(approvedDir, { recursive: true })
const files = (await readdir(approvedDir, { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".json") &&
      entry.name.toLowerCase() !== "manifest.json",
  )
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b))

const labelFor = (file) =>
  file
    .replace(/\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const manifest = {
  version: 1,
  packs: files.map((file) => ({ file, label: labelFor(file) })),
}

await writeFile(join(approvedDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Approved content manifest: ${files.length} pack${files.length === 1 ? "" : "s"}`)
