function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    promise.then(resolve);
    setTimeout(function() {
      reject(new Error("Timeout after " + ms + " ms"));
    }, ms);
  });
}

function repeatUntilTruthy(delay, timeout, fn) {
  const timeoutMsg = "Timeout after " + timeout + " ms";
  // console.log("repeat", delay, timeout);
  return new Promise(function(resolve, reject) {
    function next() {
      // console.log("repeat.next", delay, timeout);
      setTimeout(function() {
        fn().then((result) => {
          // console.log("repeat.result", delay, timeout, result);
          if (result) {
            // console.log("repeat.resolve", delay, timeout, typeof result, result);
            return resolve(result);
          }
          timeout -= delay;
          if (timeout > 0) {
            return next();
          }
          reject(new Error(timeoutMsg));
        });
      }, delay);
    }
    next();
  });
}

module.exports = {
  delay,
  timeout,
  repeatUntilTruthy,
};
