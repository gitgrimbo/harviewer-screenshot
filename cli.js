const buildArgv = require("./lib/build-argv");
const { mapPathToUrl, splitIntoPathsAndUrls } = require("./lib/har-paths");
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

function main(cli) {
  const argv = cli.argv;
  if (!argv.har && !argv.harp) {
    return cli.showHelp();
  }

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

  function useLocalServer(harPathsAndUrls, harpPathsAndUrls) {
    const server = createServer();
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

      const pathToUrlMapper = mapPathToUrl("http:", "localhost", port);
      const hars = harPathsAndUrls.urls.concat(harPathsAndUrls.paths.map(pathToUrlMapper));
      const harps = harPathsAndUrls.urls.concat(harpPathsAndUrls.paths.map(pathToUrlMapper));

      return doScreenshot(hars, harps);
    }).then(stopServer, stopServer);
  }

  const harPathsAndUrls = splitIntoPathsAndUrls(ensureArray(argv.har));
  const harpPathsAndUrls = splitIntoPathsAndUrls(ensureArray(argv.harp));

  if (harPathsAndUrls.paths.length > 0 || harpPathsAndUrls.paths.length > 0) {
    useLocalServer(harPathsAndUrls, harpPathsAndUrls);
  } else {
    doScreenshot(harPathsAndUrls.urls, harpPathsAndUrls.urls);
  }
}

const cli = buildArgv();
main(cli);
