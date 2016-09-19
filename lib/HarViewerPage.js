const CallbackHelper = require("./CallbackHelper");
const waits = require("./waits");

function HarViewer(page, cookieDomain, cookiePath) {
  this.page = page;
  this.delay = 500;
  this.timeout = 5000;
  this.cookieDomain = cookieDomain || "gitgrimbo.github.io";
  this.cookiePath = cookiePath || "/harviewer";

  this.callbackHelper = new CallbackHelper(page);

  page.property("onConsoleMessage", function(msg) {
    console.log(msg);
  });
}

HarViewer.prototype.repeatUntilTruthy = function(f) {
  return waits.repeatUntilTruthy(this.delay, this.timeout, () => {
    // console.log("evaluate");
    return this.page.evaluate(f);
  });
};

HarViewer.prototype.turnOffValidate = function() {
  return this.page
    .addCookie({
      name: "validate",
      value: "false",
      domain: this.cookieDomain,
      path: this.cookiePath
    });
};

HarViewer.prototype.waitUntilLoaded = function() {
  return this.repeatUntilTruthy(function() {
    // eslint-disable-next-line no-undef
    return Boolean(content.repObject);
  });
};

HarViewer.prototype.getErrors = function() {
  return this.page.evaluate(function() {
    // eslint-disable-next-line no-undef
    var $ = jQuery;
    var rows = $(".errorRow");
    return rows.toArray().map(function(row) {
      return {
        property: row.querySelector(".errorProperty").innerText,
        message: row.querySelector(".errorMessage").innerText
      };
    });
  });
};

HarViewer.prototype.loadHarsAndHarps = function(hars, harps) {
  /* eslint-disable */
  function browserLoadArchives(hars, harps) {
    var errorCallback = done;
    var callback = null;
    var doneCallback = done;
    content.repObject.loadArchives(hars, harps, null, callback, errorCallback, doneCallback);
  }
  /* eslint-enable */
  const promise = this.callbackHelper.evaluateAsync(browserLoadArchives, hars, harps);
  return waits.timeout(5000, promise);
};

HarViewer.prototype.staticBodies = function() {
  return this.page.evaluate(function() {
    // eslint-disable-next-line no-undef
    $(".harViewBodies").css("position", "static");
  });
};

HarViewer.prototype.openPageRow = function(idx) {
  return this.page.evaluate(function(idx) {
    // Use var because this executes in the browser
    // eslint-disable-next-line no-undef
    var row = $($(".pageRow")[idx]);
    if (!row.hasClass("opened")) {
      row.click();
    }
  }, idx);
};

HarViewer.prototype.clickToolbarButtonIfElementIsHidden = function(btnIdx, elementSelector) {
  return this.page.evaluate(function(btnIdx, elementSelector) {
    // Use var because this executes in the browser
    // eslint-disable-next-line no-undef
    var $ = jQuery;
    var toolbarButtons = $(".toolbarButton");
    var btn = $(toolbarButtons[btnIdx]);
    var el = $(elementSelector);
    if (el.is(":hidden")) {
      btn.click();
    }
  }, btnIdx, elementSelector);
};

HarViewer.prototype.showTimeline = function() {
  // TODO - Using button index and class selectors is horribly fragile!
  return this.clickToolbarButtonIfElementIsHidden(0, ".pageTimelineBody");
};

HarViewer.prototype.showStatistics = function() {
  // TODO - Using button index and class selectors is horribly fragile!
  return this.clickToolbarButtonIfElementIsHidden(1, ".pageStatsBody");
};

HarViewer.prototype.setViewportSize = function(w, h) {
  function getBodyClientHeight() {
    // eslint-disable-next-line no-undef
    return document.body.clientHeight;
  }

  const viewportSize = (w, h) => {
    return this.page.property("viewportSize", {
      width: w,
      height: h
    });
  };

  return this.page.evaluate(getBodyClientHeight)
    .then(bodyClientHeight => {
      if (typeof h !== "number") {
        h = bodyClientHeight;
      }
      if (h < bodyClientHeight) {
        // Setting the viewport size doesn't work if the supplied height is
        // less than the body.clientHeight, so we need to clip the content
        // first.
        return this.setClipRect(0, 0, w, h)
          .then(() => viewportSize(w, h));
      }
      return viewportSize(w, h);
    });
};

HarViewer.prototype.setClipRect = function(top, left, width, height) {
  return this.page.property("clipRect", {
    top,
    left,
    width,
    height
  });
};

module.exports = HarViewer;
