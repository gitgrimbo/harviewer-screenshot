const fs = require("fs");
const path = require("path");
const url = require("url");
const fileUrl = require("file-url");
const buildArgv = require("./lib/build-argv");
const screenshot = require("./lib/screenshot");
const { createServer } = require("./lib/server");

function localAndRemote(paths) {
  const ctx = {
    local: [],
    remote: []
  };
  return paths.reduce((ctx, p) => {
    const { protocol } = url.parse(p);

    if (protocol) {
      ctx.remote.push(p);
    } else {
      const resolvedPath = path.resolve(p);
      const stats = fs.statSync(resolvedPath);
      if (stats.isFile()) {
        ctx.local.push(resolvedPath);
      } else {
        throw new Error(p + " was neither a file nor a URL");
      }
    }

    return ctx;
  }, ctx);
}

function mapFilePathToLocalUrl(port) {
  return function(path) {
    const u = fileUrl(path);
    const parsed = url.parse(u);
    return "http://localhost:" + port + parsed.pathname;
  };
}

function main(cli) {
  const argv = cli.argv;
  if (!argv.har && !argv.harp) {
    return cli.showHelp();
  }

  function ensureArray(value) {
    if (typeof value === "undefined" || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  function params(name, values) {
    return values.map(v => name + "=" + v).join("&");
  }

  function doScreenshot(har, harp) {
    const url = argv["hv-url"] + "?" +
      params("har", har.local) +
      params("harp", harp.local) +
      params("har", har.remote) +
      params("harp", harp.remote);

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

  function useLocalServer(har, harp) {
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

      har.local = har.local.map(mapFilePathToLocalUrl(port));
      harp.local = harp.local.map(mapFilePathToLocalUrl(port));

      return doScreenshot(har, harp);
    }).then(stopServer, stopServer);
  }

  const har = localAndRemote(ensureArray(argv.har));
  const harp = localAndRemote(ensureArray(argv.harp));

  if (har.local.length > 0 || harp.local.length > 0) {
    useLocalServer(har, harp);
  } else {
    doScreenshot(har, harp);
  }
}

const cli = buildArgv();
main(cli);
