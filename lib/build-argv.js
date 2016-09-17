/* eslint-disable max-len */

const yargs = require("yargs");

module.exports = function() {
  return yargs
    .option("hv-url", {
      describe: "HAR Viewer URL.",
      nargs: 1,
      demand: true,
      default: "http://gitgrimbo.github.io/harviewer/master/"
    })
    .option("har", {
      describe: "HAR URL or file path. Can be provided zero or more times."
    })
    .option("harp", {
      describe: "HARP URL or file path. Can be provided zero or more times."
    })
    .option("hv-pageIdx", {
      describe: "Index of the page to open.",
      default: 0
    })
    .option("hv-width", {
      describe: "Width of viewport.",
      default: 1280
    })
    .option("hv-height", {
      describe: "Height of viewport. Defaults to full document.body.clientHeight."
    })
    .option("hv-show-stats", {
      describe: "Show the stats or not.",
      default: false,
      type: "boolean"
    })
    .option("hv-show-timeline", {
      describe: "Show the timeline or not.",
      default: false,
      type: "boolean"
    })
    .option("dest", {
      describe: "Filename for the screenshot.",
      default: "harviewer.png"
    })
    .showHelpOnFail(false, "Specify --help for available options")
    .help("help");
};
