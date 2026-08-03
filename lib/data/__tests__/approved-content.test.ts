import { describe, expect, it } from "vitest"
import { parseApprovedContentManifest } from "../approved-content"

describe("approved content manifest", () => {
  it("accepts generated entries and supplies labels for string entries", () => {
    expect(
      parseApprovedContentManifest({
        version: 1,
        packs: [
          { file: "campaign-feats.json", label: "Campaign Feats" },
          "house_rules.json",
        ],
      }).packs,
    ).toEqual([
      { file: "campaign-feats.json", label: "Campaign Feats" },
      { file: "house_rules.json", label: "House Rules" },
    ])
  })

  it("rejects paths outside the approved folder", () => {
    expect(() =>
      parseApprovedContentManifest({ version: 1, packs: ["../private.json"] }),
    ).toThrow(/invalid file name/i)
  })

  it("rejects malformed manifests", () => {
    expect(() => parseApprovedContentManifest({ version: 2, packs: [] })).toThrow(
      /version 1/i,
    )
  })
})
