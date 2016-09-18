const path = require("path");
const assert = require("chai").assert;
const { getHarsAndHarps, localServerDefaults, mapPathToUrl, stdinUrl } = require("../har-paths");

// These values are deliberately not localServerDefaults.
const localServer = {
  protocol: "https:",
  hostname: "localserver.com",
  port: 123
};

const pathToUrlMapper = mapPathToUrl(localServer.protocol, localServer.hostname, localServer.port);
const defaultPathToUrlMapper = mapPathToUrl(localServerDefaults.protocol, localServerDefaults.hostname, localServerDefaults.port);

const urls = [
  "http://example.com/1.har"
];

const paths = [
  path.resolve("/path/to/file")
];

describe("har-paths", function() {
  describe("getHarsAndHarps", function() {
    function assertHarsAndHarps(actual, harsLength, harpsLength) {
      assert.isOk(actual.hars);
      assert.isOk(actual.harps);
      assert.equal(actual.hars.length, harsLength);
      assert.equal(actual.harps.length, harpsLength);
    }

    it("nulls", function() {
      const actual = getHarsAndHarps(null, null, null, null);
      assertHarsAndHarps(actual, 0, 0);
    });

    it("stdin", function() {
      const har = {};
      const actual = getHarsAndHarps(null, null, har, null);
      assertHarsAndHarps(actual, 1, 0);
      assert.equal(actual.hars[0], stdinUrl(localServerDefaults.protocol, localServerDefaults.hostname, localServerDefaults.port));
      assert.equal(actual.hars[0], "http://localhost:80/stdin");
    });

    it("har url (null localserver)", function() {
      const actual = getHarsAndHarps({ urls }, null, null, null);
      assertHarsAndHarps(actual, 1, 0);
      assert.equal(actual.hars[0], urls[0]);
    });

    it("har path (null localserver)", function() {
      const actual = getHarsAndHarps({ paths }, null, null, null);
      assertHarsAndHarps(actual, 1, 0);
      assert.equal(actual.hars[0], defaultPathToUrlMapper(paths[0]));
    });

    it("har path (non-null localserver)", function() {
      const actual = getHarsAndHarps({ paths }, null, null, localServer);
      assertHarsAndHarps(actual, 1, 0);
      assert.equal(actual.hars[0], pathToUrlMapper(paths[0]));
    });
  });
});
