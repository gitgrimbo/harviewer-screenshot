const waits = require("./waits");
const browserFunctions = require("./evaluate-on-browser");

async function maybeTurnResolveIntoReject(promise) {
  try {
    const result = await promise;
    if (result && result.err) {
      throw result.err;
    }
    return result;
  } catch (err) {
    throw err;
  }
}

class HarViewer {
  constructor(page, cookieDomain, cookiePath) {
    this.page = page;
    this.delay = 500;
    this.timeout = 5000;
    this.cookieDomain = cookieDomain || "gitgrimbo.github.io";
    this.cookiePath = cookiePath || "/harviewer";

    page.on("console", async function(msg) {
      for (let i = 0; i < msg.args().length; i++) {
        const value = await msg.args()[i].jsonValue();
        console.log(`${i}: ${value}`);
      }
    });
    page.on("error", function(err) {
      console.error(err);
    });
    page.on("pageerror", function(err) {
      console.error(err);
    });
  }

  repeatUntilTruthy(f) {
    return waits.repeatUntilTruthy(this.delay, this.timeout, () => {
      // console.log("evaluate");
      return this.page.evaluate(f);
    });
  }

  turnOffValidate() {
    return this.page
      .setCookie({
        name: "validate",
        value: "false",
        domain: this.cookieDomain,
        path: this.cookiePath,
      });
  }

  waitUntilLoaded() {
    return this.repeatUntilTruthy(function() {
      // eslint-disable-next-line no-undef
      return Boolean(content.repObject);
    });
  }

  getErrors() {
    return this.page.evaluate(browserFunctions.getErrors);
  }

  loadHarsAndHarps(hars, harps) {
    return maybeTurnResolveIntoReject(
      this.page.evaluate(browserFunctions.loadArchives, hars, harps));
  }

  staticBodies() {
    return this.page.evaluate(browserFunctions.staticBodies);
  }

  openPageRow(idx) {
    return this.page.evaluate(browserFunctions.openPageRow, idx);
  }

  showTimeline() {
    // TODO - Using button index and class selectors is horribly fragile!
    return this.page.evaluate(browserFunctions.clickToolbarButtonIfElementIsHidden,
      0, ".pageTimelineBody");
  }

  showStatistics() {
    // TODO - Using button index and class selectors is horribly fragile!
    return this.page.evaluate(browserFunctions.clickToolbarButtonIfElementIsHidden,
      1, ".pageStatsBody");
  }

  async setViewportSize(w, h) {
    const bodyClientHeight = await this.page.evaluate(browserFunctions.getBodyClientHeight);
    if (typeof h !== "number") {
      h = bodyClientHeight;
    }
    return this.page.setViewport({
      width: w,
      height: h,
    });
  }
}

module.exports = HarViewer;
