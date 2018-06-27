const url = require("url");
const puppeteer = require("puppeteer");

const HarViewer = require("./HarViewerPage");
const { delay } = require("./waits");

async function screenshot(opts) {
  if (!opts) {
    throw new Error("No options provided");
  }

  const hvUrl = opts.hvUrl;
  const hars = opts.hars || [];
  const harps = opts.harps || [];
  const hvPageIdx = opts.hvPageIdx || 0;
  const hvWidth = opts.hvWidth || 1280;
  const hvHeight = opts.hvHeight;
  const hvShowTimeline = opts.hvShowTimeline === true;
  const hvShowStats = opts.hvShowStats === true;
  const dest = opts.dest;

  const parsedUrl = url.parse(hvUrl);
  const cookieDomain = parsedUrl.hostname;
  const cookiePath = parsedUrl.pathname;

  let browser = null;

  function cleanup(err) {
    if (browser) {
      browser.close();
    }
    if (err) {
      throw err;
    }
  }

  try {
    browser = await puppeteer.launch();

    console.log("Creating page");
    const page = await browser.newPage();

    console.log("Opening " + hvUrl);
    const response = await page.goto(hvUrl);
    console.log("Status: " + response.status());

    const harViewer = new HarViewer(page, cookieDomain, cookiePath);

    console.log("Turning off validation");
    await harViewer.turnOffValidate();

    console.log("Waiting for HAR Viewer to load");
    await harViewer.waitUntilLoaded();

    console.log("Setting static bodies");
    await harViewer.staticBodies();

    console.log("Load hars and harps");
    await harViewer.loadHarsAndHarps(hars, harps);

    console.log("Opening page " + hvPageIdx);
    await harViewer.openPageRow(hvPageIdx);

    if (hvShowTimeline) {
      console.log("Showing timeline");
      // TODO - Delay is a horrible hack.
      // Work out a way of KNOWING when the timeline animation is complete.
      await harViewer.showTimeline();
      await delay(1000);
    }

    if (hvShowStats) {
      console.log("Showing statistics");
      // TODO - Delay is a horrible hack.
      // Work out a way of KNOWING when the stats animation is complete.
      await harViewer.showStatistics();
      await delay(1000);
    }

    console.log("Setting viewport size to " + hvWidth + "x" + hvHeight);
    await harViewer.setViewportSize(hvWidth, hvHeight);

    console.log("Saving image " + dest);
    await page.screenshot({ path: dest });

    console.log("Cleanup");
    cleanup();
  } catch (err) {
    console.log("ERROR", err);
    console.log("Cleanup");
    cleanup(err);
  }
}

module.exports = {
  screenshot,
};
