const waits = require("./waits");

function HarViewer(page) {
  this.page = page;
  this.delay = 500;
  this.timeout = 5000;
}

HarViewer.prototype.repeatUntilTruthy = function(f) {
  return waits.repeatUntilTruthy(this.delay, this.timeout, () => {
    // console.log("evaluate");
    return this.page.evaluate(f);
  });
};

HarViewer.prototype.waitUntilLoaded = function() {
  return this.repeatUntilTruthy(function() {
    // eslint-disable-next-line no-undef
    return Boolean(content.repObject);
  });
};

HarViewer.prototype.waitUntilHarLoaded = function() {
  return this.repeatUntilTruthy(function() {
    // eslint-disable-next-line no-undef
    var $ = jQuery;
    // Look for pageTables or netTables for HARs with or without pages.
    return $(".pageTable").length + $(".netTable").length > 0;
  });
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
