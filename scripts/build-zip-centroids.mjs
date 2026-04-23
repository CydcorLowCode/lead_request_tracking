#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SIMPLEMAPS_ZIP_URL =
  "https://simplemaps.com/static/data/us-zips/1.912/basic/simplemaps_uszips_basicv1.912.zip";
const TEMP_ZIP_PATH = path.join(os.tmpdir(), "simplemaps_uszips_basicv1.912.zip");
const OUTPUT_PATH = path.join(process.cwd(), "public", "data", "zip-centroids.json");

function parseCsvRow(line) {
  const row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  return row;
}

async function extractCsvText(filePath) {
  if (filePath.toLowerCase().endsWith(".csv")) {
    return readFile(filePath, "utf8");
  }

  if (filePath.toLowerCase().endsWith(".zip")) {
    const { stdout } = await execFileAsync("unzip", ["-p", filePath]);
    if (!stdout || !stdout.trim()) {
      throw new Error(`No CSV content found in ${filePath}`);
    }
    return stdout;
  }

  throw new Error(`Unsupported input file type: ${filePath}`);
}

async function downloadZipToTemp() {
  const response = await fetch(SIMPLEMAPS_ZIP_URL);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(TEMP_ZIP_PATH, Buffer.from(arrayBuffer));
  return TEMP_ZIP_PATH;
}

function buildCentroids(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV appears to be empty.");
  }

  const header = parseCsvRow(lines[0]).map((h) => h.trim().toLowerCase());
  const zipIndex = header.indexOf("zip");
  const latIndex = header.indexOf("lat") !== -1 ? header.indexOf("lat") : header.indexOf("latitude");
  const lngIndex = header.indexOf("lng") !== -1 ? header.indexOf("lng") : header.indexOf("longitude");

  if (zipIndex === -1 || latIndex === -1 || lngIndex === -1) {
    throw new Error(
      "CSV is missing one or more required columns: zip, lat/latitude, lng/longitude",
    );
  }

  /** @type {Record<string, [number, number]>} */
  const centroids = {};

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvRow(lines[i]);
    const zipRaw = row[zipIndex]?.trim();
    const latRaw = row[latIndex]?.trim();
    const lngRaw = row[lngIndex]?.trim();

    if (!zipRaw || !latRaw || !lngRaw) continue;

    const zip = zipRaw.padStart(5, "0").slice(0, 5);
    const lat = Number.parseFloat(latRaw);
    const lng = Number.parseFloat(lngRaw);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    centroids[zip] = [lat, lng];
  }

  return centroids;
}

async function main() {
  const inputPath = process.argv[2];
  let csvText;

  if (inputPath) {
    csvText = await extractCsvText(path.resolve(inputPath));
  } else {
    try {
      const downloadedZipPath = await downloadZipToTemp();
      csvText = await extractCsvText(downloadedZipPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        [
          "Unable to download the SimpleMaps ZIP automatically.",
          `Reason: ${message}`,
          "Please download the CSV manually (for example to /tmp/simplemaps_uszips.csv),",
          "then rerun:",
          "  node scripts/build-zip-centroids.mjs /tmp/simplemaps_uszips.csv",
        ].join("\n"),
      );
      process.exit(1);
    }
  }

  const centroids = buildCentroids(csvText);
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(centroids));

  console.log(
    `Wrote ${OUTPUT_PATH} with ${Object.keys(centroids).length.toLocaleString()} ZIP centroids.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
