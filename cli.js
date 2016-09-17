const getStdin = require("get-stdin");
const buildArgv = require("./lib/build-argv");
const { mapPathToUrl, splitIntoPathsAndUrls, stdinUrl } = require("./lib/har-paths");
const screenshot = require("./lib/screenshot");
const { createServer } = require("./lib/server");

function ensureArray(value) {
  if (typeof value === "undefined" || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function params(name, values) {
  return values.map(v => name + "=" + v).join("&");
}

function readHARFromStdin() {
  return getStdin().then(str => JSON.parse(str));
}

function main(cli) {
  const argv = cli.argv;

  function doScreenshot(hars, harps) {
    const url = argv["hv-url"] + "?" +
      params("har", hars) +
      params("harp", harps);

    const opts = {
      hvUrl: url,
      hvPageIdx: argv["hv-pageIdx"],
      hvWidth: argv["hv-width"],
      hvHeight: argv["hv-height"],
      dest: argv.dest
    };

    return screenshot.screenshot(opts).then(() => {
      console.log("Screenshot done.");
    }, err => {
      console.error("There was an error trying to capture screenshot...");
      console.error(err);
    });
  }

  function useLocalServer(harPathsAndUrls, harpPathsAndUrls, harFromStdin) {
    const server = createServer(harFromStdin);
    const stopServer = err => {
      if (err) {
        console.error(err);
      }
      console.log("Stopping local server.");
      server.stop();
    };
    return server.start().then(function(server) {
      const port = server.address().port;

      console.log(`Started local server on port ${port}`);

      const hars = [];
      const harps = [];

      const pathToUrlMapper = mapPathToUrl("http:", "localhost", port);
      if (harPathsAndUrls) {
        hars.push(harPathsAndUrls.urls.concat(harPathsAndUrls.paths.map(pathToUrlMapper)));
      }
      if (harpPathsAndUrls) {
        harps.push(harpPathsAndUrls.urls.concat(harpPathsAndUrls.paths.map(pathToUrlMapper)));
      }

      if (harFromStdin) {
        hars.push(stdinUrl("http:", "localhost", port));
      }

      return doScreenshot(hars, harps);
    }).then(stopServer, stopServer);
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

  return readHARFromStdin().then(har => useLocalServer(null, null, har));
}

const cli = buildArgv();
main(cli);
