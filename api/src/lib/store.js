import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { basename, dirname } from 'node:path';

let listings = [];
let loadedAt = null;
let reloadCount = 0;

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

export function getReloadCount() {
  return reloadCount;
}

// watching the file directly breaks after an atomic rename — the watched
// inode is replaced. watching the parent dir survives that.
export function watchFile(filePath, onReload) {
  const name = basename(filePath);
  let timer = null;
  const watcher = watch(dirname(filePath), (event, filename) => {
    if (filename !== name) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const n = await load(filePath);
        reloadCount += 1;
        onReload?.(n);
      } catch (err) {
        console.error('reload failed:', err.message);
      }
    }, 150);
  });
  watcher.on('error', (err) => console.error('watcher error:', err.message));
  return watcher;
}
