import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const BASE = "http://localhost:6007/iframe.html";
const OUT = resolve("docs/screenshots");

const shots = [
  { name: "magi-consensus", id: "components-magiconsensus--unanimous", w: 800, h: 400 },
  { name: "radar-sweep", id: "components-radarsweep--many-targets", w: 500, h: 500 },
  { name: "spectrum-analyzer", id: "components-spectrumanalyzer--with-labels", w: 500, h: 300 },
  { name: "notification-banner", id: "components-notificationbanner--emergency", w: 800, h: 120 },
  { name: "command-terminal", id: "components-commandterminal--error-state", w: 800, h: 350 },
  { name: "camera-feed", id: "components-camerafeed--all-states", w: 800, h: 500 },
  { name: "power-grid", id: "components-powergrid--with-battery", w: 800, h: 300 },
  { name: "lcl-depth-meter", id: "components-lcldepthmeter--contaminated", w: 300, h: 550 },
  { name: "pattern-alert", id: "components-patternalert--blue-pattern", w: 500, h: 400 },
  { name: "status-panel", id: "components-statuspanel--default", w: 500, h: 300 },
  { name: "waveform-display", id: "components-waveformdisplay--sine", w: 500, h: 200 },
  { name: "sync-gauge", id: "components-syncgauge--default", w: 400, h: 400 },
];

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

for (const { name, id, w, h } of shots) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(`${BASE}?id=${id}&viewMode=story`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000)); // let animations settle
  await page.screenshot({ path: resolve(OUT, `${name}.png`), fullPage: false });
  console.log(`saved ${name}.png`);
}

await browser.close();
console.log("done");
