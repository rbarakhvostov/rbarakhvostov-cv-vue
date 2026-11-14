import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);

const CHROME =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDir = join(root, 'public');

const COLORS = {
  bg: '#161826',
  surface: '#232532',
  text: '#e9e9ed',
  accent: '#9184d9',
  accent2: '#a7a1db',
  muted: '#b2b6ca',
};

const NAME = 'Roman Barakhvostov';
const ROLE = 'Senior Frontend Developer';
const STACK = ['React', 'Next.js', 'TypeScript', 'Vue'];
const SITE = 'roman-barakhvostov-cv.netlify.app';

const ogCard = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=block"
      rel="stylesheet"
    />
    <style>
      * { box-sizing: border-box; margin: 0; }
      html, body { width: 1200px; height: 630px; }
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 26px;
        padding: 0 86px;
        background:
          radial-gradient(900px 520px at 88% -16%, ${COLORS.surface} 0%, transparent 62%),
          ${COLORS.bg};
        color: ${COLORS.text};
        font-family: Inter, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .rule {
        width: 96px;
        height: 5px;
        border-radius: 3px;
        background: linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2});
      }
      h1 {
        font-size: 92px;
        font-weight: 600;
        letter-spacing: -0.032em;
        line-height: 1.02;
      }
      .role {
        font-size: 40px;
        font-weight: 500;
        letter-spacing: -0.012em;
        color: ${COLORS.accent2};
      }
      .stack {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .chip {
        padding: 9px 20px;
        border: 1px solid ${COLORS.accent}55;
        border-radius: 999px;
        font-size: 25px;
        color: ${COLORS.muted};
      }
      .site {
        position: absolute;
        right: 86px;
        bottom: 54px;
        font-size: 24px;
        letter-spacing: 0.01em;
        color: ${COLORS.muted};
      }
    </style>
  </head>
  <body>
    <div class="rule"></div>
    <h1>${NAME}</h1>
    <p class="role">${ROLE}</p>
    <div class="stack">
      ${STACK.map((item) => `<span class="chip">${item}</span>`).join('\n      ')}
    </div>
    <span class="site">${SITE}</span>
  </body>
</html>
`;

const iconCard = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; }
      html, body { width: 180px; height: 180px; }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${COLORS.bg};
      }
      img { width: 136px; height: 136px; }
    </style>
  </head>
  <body>
    <img src="${pathToFileURL(join(publicDir, 'cv.svg')).href}" alt="" />
  </body>
</html>
`;

const shoot = async (workDir, html, name, width, height) => {
  const page = join(workDir, `${name}.html`);

  await writeFile(page, html, 'utf8');
  await run(CHROME, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    `--screenshot=${join(publicDir, `${name}.png`)}`,
    '--virtual-time-budget=6000',
    pathToFileURL(page).href,
  ]);

  console.log(`public/${name}.png (${width}×${height})`);
};

const workDir = await mkdtemp(join(tmpdir(), 'rb-og-'));

try {
  await shoot(workDir, ogCard, 'og-image', 1200, 630);
  await shoot(workDir, iconCard, 'apple-touch-icon', 180, 180);
} finally {
  await rm(workDir, { recursive: true, force: true });
}
