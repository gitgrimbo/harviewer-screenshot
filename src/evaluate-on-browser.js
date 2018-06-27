/* eslint-disable */

/*

When using puppeteer and Promises, reject does not return the error. See:

https://github.com/GoogleChrome/puppeteer/issues/1379

Therefore, some of these functions are forced to resolve Promises with an "err" property to
simulate rejections.

*/

function loadArchives(hars, harps) {
  return new Promise((resolve, reject) => {
    var callback = null;
    var onError = function(jqXHR, textStatus, errorThrown) {
      var err = JSON.stringify({
        status: jqXHR.status,
        textStatus: textStatus,
        errorThrown: errorThrown,
      });
      resolve({ err });
    };
    content.repObject.loadArchives(hars, harps, null, callback, onError, resolve);
  });
}

function clickToolbarButtonIfElementIsHidden(btnIdx, elementSelector) {
  var $ = jQuery;
  var toolbarButtons = $(".toolbarButton");
  var btn = $(toolbarButtons[btnIdx]);
  var el = $(elementSelector);
  if (el.is(":hidden")) {
    btn.click();
  }
}

function openPageRow(idx) {
  var row = $($(".pageRow")[idx]);
  if (!row.hasClass("opened")) {
    row.click();
  }
}

function getErrors() {
  var $ = jQuery;
  var rows = $(".errorRow");
  return rows.toArray().map(function(row) {
    return {
      property: row.querySelector(".errorProperty").innerText,
      message: row.querySelector(".errorMessage").innerText,
    };
  });
}

function getBodyClientHeight() {
  return document.body.clientHeight;
}

function staticBodies() {
  $(".harViewBodies").css("position", "static");
}

module.exports = {
  loadArchives,
  clickToolbarButtonIfElementIsHidden,
  openPageRow,
  getErrors,
  getBodyClientHeight,
  staticBodies,
};
