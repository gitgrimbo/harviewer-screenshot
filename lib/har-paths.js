const fs = require("fs");
const path = require("path");
const url = require("url");
const fileUrl = require("file-url");

/**
 * @typedef {object} PathsAndUrls
 * @property {string[]} paths
 *  Array of file path strings.
 * @property {string[]} urls
 *  Array of URL strings.
 */

/**
 * @param {string[]} pathsAndUrls
 *   Array of strings representing URLs and/or file paths.
 * @return {PathsAndUrls}
 *   The separated file paths and URLs.
 */
function splitIntoPathsAndUrls(pathsAndUrls) {
  const ctx = {
    paths: [],
    urls: []
  };
  return pathsAndUrls.reduce((ctx, p) => {
    const { protocol } = url.parse(p);

    if (protocol) {
      ctx.urls.push(p);
    } else {
      const resolvedPath = path.resolve(p);
      const stats = fs.statSync(resolvedPath);
      if (stats.isFile()) {
        ctx.paths.push(resolvedPath);
      } else {
        throw new Error(p + " was neither a file nor a URL");
      }
    }

    return ctx;
  }, ctx);
}

/**
 * protocol, hostname and port use definitions from
 * https://nodejs.org/docs/latest/api/url.html#url_url_strings_and_url_objects.
 * So protocol must have ":" and hostname does not contain port.
 *
 * @param {string} protocol
 *   E.g. "http:".
 * @param {string} hostname
 *   E.g. "localhost".
 * @param {number} port
 *   E.g. 1234.
 * @return {function}
 *   Function that maps a file path to a URL based on that file path and protocol, host, port.
 */
function mapPathToUrl(protocol, hostname, port) {
  return function(path) {
    const u = fileUrl(path);
    const parsed = url.parse(u);
    return `${protocol}//${hostname}:${port}${parsed.pathname}`;
  };
}

function stdinUrl(protocol, hostname, port) {
  return `${protocol}//${hostname}:${port}/stdin`;
}

module.exports = {
  mapPathToUrl,
  splitIntoPathsAndUrls,
  stdinUrl
};
