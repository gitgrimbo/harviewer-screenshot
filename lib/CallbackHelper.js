/**
 * This function creates a function to run in the browser.
 *
 * It combines a user-specified function, fn, with some wrapping that
 * facilitates communication between the browser and Node.js.
 *
 * @param {function} fn
 *   The function to run in the browser.
 *
 * @return {function}
 *   A wrapped function.
 */
function createAsyncFunction(fn) {
  /* eslint-disable */
  const fnStr = fn.toString();

  // The "done" method below should be used by users of
  // CallbackHelper.evaluateAsync() to callback to Node.js from the browser.
  let script = (function(callbackId) {
    var fnArgs = [].slice.call(arguments, 1);
    function done() {
      window.callPhantom(callbackId);
    }
    "fnStr"
  }).toString();

  // Replace the "fnStr" placeholder with the user's function code.
  script = script.replace(/"fnStr"/, "(" + fnStr + ").apply(null, fnArgs);");

  return eval("(" + script + ")");
  /* eslint-enable */
}

/**
 * @param {Page} page
 *   https://github.com/amir20/phantomjs-node#phantomcreatepage
 */
function CallbackHelper(page) {
  this.page = page;

  // page.on("onCallback") is phantomjs-node's way of asynchronously calling
  // back to node from the phantomjs browser.
  // https://github.com/amir20/phantomjs-node

  // We maintain a list of callback objects, and use their ids to control
  // callback execution.
  let callbackId = 0;
  const callbacks = [];

  this.addCallback = function(cb) {
    callbackId++;
    callbacks.push({
      id: callbackId,
      callback: cb
    });
    return callbackId;
  };

  page.on("onCallback", function(callbackId) {
    console.log("onCallback", callbackId);
    for (let i = 0; i < callbacks.length; i++) {
      if (callbacks[i].id === callbackId) {
        callbacks[i].callback();
        callbacks.splice(i, 1);
        return;
      }
    }
  });
}

CallbackHelper.prototype.evaluateAsync = function(fn, fnArg1, fnArg2, etc) {
  return new Promise((resolve, reject) => {
    const callbackId = this.addCallback(resolve);

    // remove fn
    const fnArgs = [].slice.call(arguments, 1);

    // the wrapper function takes the callbackId and any args to be passed to fn.
    const asyncFunctionArgs = [callbackId].concat(fnArgs);

    // page.evaluate takes the wrapper function and the combined args.
    const evaluateArgs = [createAsyncFunction(fn)].concat(asyncFunctionArgs);

    this.page.evaluate.apply(this.page, evaluateArgs);
  });
};

module.exports = CallbackHelper;
