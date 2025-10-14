#!/usr/bin/env node
/**
 * fastdlcli - Simple, reliable Node.js downloader CLI
 * © 2025 Yogesh Bhavsar | Source available under BSL 1.1 (non-commercial use)
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const readline = require('readline');
const { URL } = require('url');
const path = require('path');

const URL_FILE = 'downloads.txt'; // default list file
const MAX_REDIRECTS = 5;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36';

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
function formatSpeed(bytes, elapsedMs) {
  const seconds = elapsedMs / 1000;
  const speedMBps = (bytes / (1024 * 1024)) / seconds;
  return speedMBps.toFixed(2) + ' MB/s';
}
function formatETA(downloaded, total, elapsedMs) {
  const speed = downloaded / (elapsedMs / 1000);
  if (speed === 0) return '∞';
  const remaining = total - downloaded;
  const etaSeconds = remaining / speed;
  const mins = Math.floor(etaSeconds / 60);
  const secs = Math.floor(etaSeconds % 60);
  return `${mins}m ${secs}s`;
}
function showProgress(downloaded, total, startTime, label = '') {
  const percent = ((downloaded / total) * 100).toFixed(2);
  const barLength = 30;
  const filledLength = Math.floor(barLength * downloaded / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(barLength - filledLength);
  const elapsed = Date.now() - startTime;
  const speed = formatSpeed(downloaded, elapsed);
  const eta = formatETA(downloaded, total, elapsed);

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`${label} [${bar}] ${percent}% | ${speed} | ETA: ${eta}   `);
}
function getFileNameFromHeader(res, fallback) {
  const disposition = res.headers['content-disposition'];
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) return match[1];
  }
  return fallback;
}
function getSafeFileName(name) {
  let base = name;
  let ext = '';
  const dot = name.lastIndexOf('.');
  if (dot > -1) {
    base = name.slice(0, dot);
    ext = name.slice(dot);
  }
  let counter = 1;
  let fileName = name;
  while (fs.existsSync(fileName)) {
    fileName = `${base} (${counter})${ext}`;
    counter++;
  }
  return fileName;
}

/**
 * Follow redirects (up to MAX_REDIRECTS)
 */
function fetchWithRedirects(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const REFERER = new URL(url).origin;

    const options = {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': REFERER,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity'
      }
    };

    protocol.get(url, options, (res) => {
      const isRedirect = [301, 302, 303, 307, 308].includes(res.statusCode);
      if (isRedirect && res.headers.location) {
        if (redirects >= MAX_REDIRECTS) {
          res.destroy();
          return reject(new Error('Too many redirects'));
        }
        const newUrl = new URL(res.headers.location, url).toString();
        res.destroy();
        resolve(fetchWithRedirects(newUrl, redirects + 1));
      } else {
        resolve(res);
      }
    }).on('error', reject);
  });
}

function readUrlsFromFile(filename) {
  const content = fs.readFileSync(filename, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

async function askForUrls() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n📥 Enter URLs (separated by space, comma, or newline):\n> ', (answer) => {
      rl.close();
      const urls = answer.split(/[\s,]+/).map(u => u.trim()).filter(Boolean);
      resolve(urls);
    });
  });
}

async function downloadSequentially(url, index) {
  return new Promise(async (resolve) => {
    const startTime = Date.now();
    try {
      const res = await fetchWithRedirects(url);

      if (res.statusCode !== 200) {
        console.error(`\n❌ Failed (${res.statusCode}) ${url}`);
        if (res.statusCode === 403) {
          console.warn(`⚠️ The server refused access. Some sites use security protection (e.g., Cloudflare) that blocks automated tools.
   Try opening this link in a browser instead.`);
        } else if (res.statusCode === 429) {
          console.warn(`⚠️ Too many requests — the server is rate-limiting your downloads.`);
        }
        res.destroy();
        return resolve(false);
      }

      const fallback = path.basename(new URL(url).pathname) || `file-${index}.bin`;
      let fileName = getFileNameFromHeader(res, fallback);
      fileName = getSafeFileName(fileName);

      const total = parseInt(res.headers['content-length'], 10) || 0;
      let downloaded = 0;
      const file = fs.createWriteStream(fileName);

      res.on('data', chunk => {
        downloaded += chunk.length;
        if (total) showProgress(downloaded, total, startTime, fileName.padEnd(25));
      });

      res.pipe(file);

      file.on('finish', () => {
        file.close(() => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          const speed = formatSpeed(downloaded, Date.now() - startTime);
          process.stdout.write(`\n✅ ${fileName} done in ${duration}s (${speed})\n`);
          resolve(true);
        });
      });

      res.on('error', err => {
        console.error(`❌ Stream error for ${url}: ${err.message}`);
        resolve(false);
      });

    } catch (err) {
      console.error(`❌ Error downloading ${url}: ${err.message}`);
      resolve(false);
    }
  });
}

async function main() {
  let urls = process.argv.slice(2);

  if (urls.length === 0 && fs.existsSync(URL_FILE)) {
    urls = readUrlsFromFile(URL_FILE);
  }
  if (urls.length === 0) {
    urls = await askForUrls();
  }
  if (urls.length === 0) {
    console.log('⚠️ No URLs provided. Add them in downloads.txt or pass as arguments.');
    return;
  }

  console.log(`🚀 Starting download of ${urls.length} file(s)...\n`);
  let successCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const result = await downloadSequentially(urls[i], i);
    if (result) successCount++;
  }

  console.log(`\n🎉 Download finished: ${successCount}/${urls.length} successful.`);
}

main();
