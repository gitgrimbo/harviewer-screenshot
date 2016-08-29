const phantom = require("phantom");
const HarViewer = require("./HarViewerPage");

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

  const url = opts.hvUrl;
  const hvPageIdx = opts.hvPageIdx || 0;
  const hvWidth = opts.hvWidth || 1280;
  const hvHeight = opts.hvHeight;
  const dest = opts.dest;

  let instance;
  let harViewer;
  let page;

  function cleanup(err) {
    if (err) {
      log("There was an error trying to capture screenshot...");
      log(err);
    }
    if (page) {
      page.close();
    }
    if (instance) {
      instance.exit();
    }
  }

  return phantom.create()
    .then(instance_ => instance = instance_)
    .then(info("Creating page"))
    .then(() => instance.createPage())
    .then(page_ => page = page_)
    .then(() => harViewer = new HarViewer(page))
    .then(info("Opening " + url))
    .then(() => page.open(url))
    .then(status => log("Status: " + status))
    // .then(() => page.property("content"))
    // .then(content => console.log(content))
    .then(info("Waiting for HAR Viewer to load"))
    .then(() => harViewer.waitUntilLoaded())
    .then(() => harViewer.staticBodies())
    .then(info("Waiting for HAR to load"))
    .then(() => harViewer.waitUntilHarLoaded())
    .then(info("Clicking page ") + hvPageIdx)
    .then(() => harViewer.clickPageRow(hvPageIdx))
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
