import { readFile } from 'node:fs/promises';

let listings = [];
let loadedAt = null;

export async function load(path) {
  const raw = await readFile(path, 'utf-8');
  listings = JSON.parse(raw);
  loadedAt = new Date().toISOString();
  return listings.length;
}

export function getAll() {
  return listings;
}

export function getLoadedAt() {
  return loadedAt;
}
