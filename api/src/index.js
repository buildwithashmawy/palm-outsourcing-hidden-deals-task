import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.js';
import { load, watchFile } from './lib/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve(__dirname, '../../data/listings.json');

const PORT = process.env.PORT || 3000;

const n = await load(DATA_PATH);
console.log(`loaded ${n} listings from ${DATA_PATH}`);
watchFile(DATA_PATH, (newCount) => {
  console.log(`reloaded ${newCount} listings`);
});

const app = createApp();
app.listen(PORT, () => {
  console.log(`api listening on :${PORT}`);
});
