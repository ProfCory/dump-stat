import { withBasePath } from "@/lib/config/deploy-mode"
import { parseDumpStatExportJson } from "@/lib/import/dump-stat-export-format"
import { importDumpStatExportItemsLocal } from "./local-import"

export type ApprovedContentPack = {
  file: string
  label: string
}

export type ApprovedContentManifest = {
  version: 1
  generatedAt?: string
  packs: ApprovedContentPack[]
}

export type ApprovedContentImportResult = {
  packs: number
  count: number
  breakdown: Record<string, number>
}

const SAFE_PACK_FILE = /^[a-z0-9][a-z0-9._ -]*\.json$/i

function defaultPackLabel(file: string): string {
  return file
    .replace(/\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function parseApprovedContentManifest(value: unknown): ApprovedContentManifest {
  if (typeof value !== "object" || value === null) {
    throw new Error("The approved-content manifest is not valid JSON.")
  }

  const record = value as Record<string, unknown>
  if (record.version !== 1 || !Array.isArray(record.packs)) {
    throw new Error("The approved-content manifest must use version 1 and include a packs list.")
  }

  const packs = record.packs.map((entry, index) => {
    const candidate =
      typeof entry === "string"
        ? { file: entry, label: defaultPackLabel(entry) }
        : typeof entry === "object" && entry !== null
          ? {
              file: String((entry as Record<string, unknown>).file ?? ""),
              label: String((entry as Record<string, unknown>).label ?? ""),
            }
          : { file: "", label: "" }

    if (
      !SAFE_PACK_FILE.test(candidate.file) ||
      candidate.file.toLowerCase() === "manifest.json"
    ) {
      throw new Error(`Approved content pack ${index + 1} has an invalid file name.`)
    }

    return {
      file: candidate.file,
      label: candidate.label.trim() || defaultPackLabel(candidate.file),
    }
  })

  return {
    version: 1,
    generatedAt: typeof record.generatedAt === "string" ? record.generatedAt : undefined,
    packs,
  }
}

export async function importApprovedContent(
  fetcher: typeof fetch = fetch,
): Promise<ApprovedContentImportResult> {
  const manifestResponse = await fetcher(withBasePath("/approved-content/manifest.json"), {
    cache: "no-store",
  })
  if (!manifestResponse.ok) {
    throw new Error("Approved content is not available from this deployment yet.")
  }

  const manifest = parseApprovedContentManifest(await manifestResponse.json())
  if (manifest.packs.length === 0) return { packs: 0, count: 0, breakdown: {} }

  // Validate every remote pack before writing any of them into browser storage.
  const loadedPacks = await Promise.all(
    manifest.packs.map(async (pack) => {
      const url = withBasePath(`/approved-content/${encodeURIComponent(pack.file)}`)
      const response = await fetcher(url, { cache: "no-store" })
      if (!response.ok) throw new Error(`Could not download approved pack “${pack.label}”.`)
      const items = parseDumpStatExportJson(await response.text())
      if (!items?.length) throw new Error(`Approved pack “${pack.label}” is not a valid Dump Stat export.`)
      return { pack, items }
    }),
  )

  const result: ApprovedContentImportResult = { packs: loadedPacks.length, count: 0, breakdown: {} }
  for (const { pack, items } of loadedPacks) {
    const imported = await importDumpStatExportItemsLocal(items, `Approved: ${pack.label}`)
    result.count += imported.count
    for (const [type, count] of Object.entries(imported.breakdown)) {
      result.breakdown[type] = (result.breakdown[type] ?? 0) + count
    }
  }

  return result
}
