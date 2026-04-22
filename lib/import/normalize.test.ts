import { describe, expect, it } from "vitest";

import {
  extractZips,
  leadAreasMatch,
  normalizeLeadArea,
  normalizeString,
} from "./normalize";

describe("normalizeString", () => {
  it("lowercases, trims, collapses whitespace, strips trailing punctuation", () => {
    expect(normalizeString("  Foo   BAR  ")).toBe("foo bar");
    expect(normalizeString("Hello, World.,.")).toBe("hello world");
    expect(normalizeString(null)).toBe("");
    expect(normalizeString(undefined)).toBe("");
  });
});

describe("extractZips", () => {
  it("extracts multiple zips from a city line", () => {
    expect(extractZips("Austin, TX 78701 78702")).toEqual(["78701", "78702"]);
  });

  it("dedupes and sorts", () => {
    expect(extractZips("78702 78701 78702")).toEqual(["78701", "78702"]);
  });
});

describe("leadAreasMatch", () => {
  it("matches on zip overlap", () => {
    expect(leadAreasMatch("78701", "78701, 78702, 78703")).toBe(true);
  });

  it("matches when formatting differs but normalized text matches", () => {
    expect(leadAreasMatch("Pflugerville TX", "pflugerville, tx")).toBe(true);
  });

  it("returns false for different markets without zip overlap", () => {
    expect(leadAreasMatch("Austin, TX", "Houston, TX")).toBe(false);
  });
});

describe("normalizeLeadArea", () => {
  it("joins segments with pipe and normalizes", () => {
    expect(normalizeLeadArea(["  A  ", null, "B  "])).toBe("a | b");
  });
});
