import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const PROGRESS_RE = /fetching page (\d+)/i;
const DONE_RE = /wrote (\d+) listings/i;

let current = null;

export function getJob() {
  return current;
}

export function isRunning() {
  return current?.status === 'running';
}

export function startScrape({ maxPages, repoRoot }) {
  if (isRunning()) {
    throw Object.assign(new Error('scrape already running'), { code: 'CONFLICT' });
  }

  const scraperDir = path.join(repoRoot, 'scraper');
  const outPath = path.join(repoRoot, 'data', 'listings.json');
  const python = resolvePython(repoRoot);

  const job = {
    id: randomUUID(),
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    maxPages,
    pagesScraped: 0,
    totalListings: null,
    error: null,
    stderrTail: '',
  };
  current = job;

  const args = ['-m', 'scraper.main', '--max-pages', String(maxPages), '--out', outPath, '--delay', '0.8,1.5'];
  const child = spawn(python, args, { cwd: scraperDir });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    job.stderrTail = (job.stderrTail + text).slice(-2000);
    const p = text.match(PROGRESS_RE);
    if (p) job.pagesScraped = Math.max(job.pagesScraped, parseInt(p[1], 10));
    const d = text.match(DONE_RE);
    if (d) job.totalListings = parseInt(d[1], 10);
  });

  child.on('error', (err) => {
    job.status = 'error';
    job.error = err.message;
    job.finishedAt = new Date().toISOString();
  });

  child.on('exit', (code) => {
    if (job.status === 'error') return;
    if (code === 0) {
      job.status = 'done';
    } else {
      job.status = 'error';
      job.error = `scraper exited with code ${code}`;
    }
    job.finishedAt = new Date().toISOString();
  });

  return job;
}

function resolvePython(repoRoot) {
  if (process.env.SCRAPER_PYTHON) return process.env.SCRAPER_PYTHON;
  const venv = path.join(repoRoot, '.venv', 'bin', 'python');
  if (existsSync(venv)) return venv;
  return 'python3';
}
