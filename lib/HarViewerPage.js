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
    return document.querySelectorAll(".pageRow").length;
  });
};

HarViewer.prototype.staticBodies = function() {
  return this.page.evaluate(function() {
    // eslint-disable-next-line no-undef
    $(".harViewBodies").css("position", "static");
  });
};

HarViewer.prototype.clickPageRow = function(idx) {
  return this.page.evaluate(function(idx) {
    // eslint-disable-next-line no-undef
    $($(".pageRow")[idx]).click();
  }, idx);
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
