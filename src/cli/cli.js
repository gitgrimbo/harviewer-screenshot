const getStdin = require("get-stdin");

const buildArgv = require("./build-argv");
const { getHarsAndHarps, splitIntoPathsAndUrls } = require("./har-paths");
const { createServer } = require("./server");
const screenshot = require("../screenshot");

function ensureArray(value) {
  if (typeof value === "undefined" || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function readHARFromStdin() {
  const str = await getStdin();
  if (!str) {
    return null;
  }
  return JSON.parse(str);
}

async function main(cli) {
  const argv = cli.argv;

  async function doScreenshot(hars, harps) {
    const opts = {
      hars,
      harps,
      hvUrl: argv["hv-url"],
      hvPageIdx: argv["hv-page-idx"],
      hvWidth: argv["hv-width"],
      hvHeight: argv["hv-height"],
      hvShowStats: argv["hv-show-stats"],
      hvShowTimeline: argv["hv-show-timeline"],
      dest: argv.dest,
    };

    try {
      await screenshot.screenshot(opts);
      console.log("Screenshot done.");
    } catch (err) {
      console.error("There was an error trying to capture screenshot...");
      console.error(err);
    }
  }

  async function useLocalServer(harPathsAndUrls, harpPathsAndUrls, harFromStdin) {
    const { start, stop } = createServer(harFromStdin);

    try {
      const server = await start();
      const port = server.address().port;
      console.log(`Started local server on port ${port}`);
      const harsAndHarps = getHarsAndHarps(harPathsAndUrls, harpPathsAndUrls, harFromStdin, {
        port,
      });
      await doScreenshot(harsAndHarps.hars, harsAndHarps.harps);
    } catch (err) {
      console.error(err);
    } finally {
      console.log("Stopping local server.");
      stop();
    }
  }

  const harPathsAndUrls = splitIntoPathsAndUrls(ensureArray(argv.har));
  const harpPathsAndUrls = splitIntoPathsAndUrls(ensureArray(argv.harp));

  const isPaths = harPathsAndUrls.paths.length > 0 || harpPathsAndUrls.paths.length > 0;
  const isUrls = harPathsAndUrls.urls.length > 0 || harpPathsAndUrls.urls.length > 0;

  if (isPaths) {
    return useLocalServer(harPathsAndUrls, harpPathsAndUrls);
  }

  if (isUrls) {
    // No paths (but URLs), so don't need the local server
    return doScreenshot(harPathsAndUrls.urls, harpPathsAndUrls.urls);
  }

  const har = await readHARFromStdin();
  if (har) {
    return useLocalServer(null, null, har);
  } else {
    console.error("har not provided in stdin");
  }
}

(async function() {
  try {
    const cli = buildArgv();
    await main(cli);
  } catch (err) {
    console.error(err);
  }
}());
