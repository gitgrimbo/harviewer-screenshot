const url = require("url");
const phantom = require("phantom");
const HarViewer = require("./HarViewerPage");
const { delay } = require("./waits");

function log() {
  // eslint-disable-next-line no-console
  console.log.apply(console, arguments);
}

function info(msg) {
  return function() {
    log(msg);
  };
}

function screenshot(opts) {
  if (!opts) {
    throw new Error("No options provided");
  }

  const hvUrl = opts.hvUrl;
  const hvPageIdx = opts.hvPageIdx || 0;
  const hvWidth = opts.hvWidth || 1280;
  const hvHeight = opts.hvHeight;
  const hvShowTimeline = opts.hvShowTimeline === true;
  const hvShowStats = opts.hvShowStats === true;
  const dest = opts.dest;

  const parsedUrl = url.parse(hvUrl);
  const cookieDomain = parsedUrl.hostname;
  const cookiePath = parsedUrl.pathname;

  let instance;
  let harViewer;
  let page;

  function cleanup(err) {
    if (page) {
      page.close();
    }
    if (instance) {
      instance.exit();
    }
    if (err) {
      throw err;
    }
  }

  return phantom.create()
    .then(instance_ => instance = instance_)
    .then(info("Creating page"))
    .then(() => instance.createPage())
    .then(page_ => page = page_)
    .then(() => harViewer = new HarViewer(page, cookieDomain, cookiePath))
    .then(info("Turning off validation"))
    .then(() => harViewer.turnOffValidate())
    .then(info("Opening " + hvUrl))
    .then(() => page.open(hvUrl))
    .then(status => log("Status: " + status))
    .then(info("Waiting for HAR Viewer to load"))
    .then(() => harViewer.waitUntilLoaded())
    .then(() => harViewer.staticBodies())
    .then(info("Waiting for HAR to load"))
    .then(() => harViewer.waitUntilHarLoaded())
    .then(info("Opening page " + hvPageIdx))
    .then(() => harViewer.openPageRow(hvPageIdx))
    .then(() => {
      if (hvShowTimeline) {
        log("Showing timeline");
        // TODO - Delay is a horrible hack.
        // Work out a way of KNOWING when the timeline animation is complete.
        return harViewer.showTimeline().then(() => delay(1000));
      }
    })
    .then(() => {
      if (hvShowStats) {
        log("Showing statistics");
        // TODO - Delay is a horrible hack.
        // Work out a way of KNOWING when the stats animation is complete.
        return harViewer.showStatistics().then(() => delay(1000));
      }
    })
    .then(info("Setting viewport size to " + hvWidth + "x" + hvHeight))
    .then(() => harViewer.setViewportSize(hvWidth, hvHeight))
    .then(info("Saving image " + dest))
    .then(() => page.render(dest))
    .then(info("Cleanup"))
    .then(cleanup, cleanup);
}

module.exports = {
  screenshot
};
