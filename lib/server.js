const path = require("path");
const koa = require("koa");
const cors = require("kcors");
const send = require("koa-send");

function* serveFile() {
  let p = this.path;
  if (p.indexOf(":") > -1) {
    // turn "/c:/blah"
    // to "c:/blah"
    p = p.substring(1);
  }
  const resolved = path.resolve(p);
  const parsed = path.parse(resolved);
  yield send(this, parsed.base, {
    root: parsed.dir
  });
}

function startServer(cb) {
  const app = koa();
  app.use(cors());
  app.use(serveFile);
  return app.listen(0, cb);
}

function createServer() {
  let server;
  return {
    start() {
      return new Promise((resolve, reject) => {
        server = startServer(function() {
          resolve(this);
        });
      });
    },
    stop() {
      server.close();
    }
  };
}

module.exports = {
  createServer
};
