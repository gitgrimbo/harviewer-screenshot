const buildArgv = require("./lib/build-argv");
const screenshot = require("./lib/screenshot");

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

  const har = ensureArray(argv.har);
  const harp = ensureArray(argv.harp);
  const url = argv["hv-url"] + "?" + params("har", har) + params("harp", harp);

  const opts = {
    hvUrl: url,
    hvPageIdx: argv["hv-pageIdx"],
    hvWidth: argv["hv-width"],
    hvHeight: argv["hv-height"],
    dest: argv.dest
  };
  screenshot.screenshot(opts);
}

const cli = buildArgv();
main(cli);
