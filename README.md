# harviewer-screenshot

Take screenshots of [HAR Viewer](https://github.com/janodvarko/harviewer).

# Usage

## From the command line

````
node index.js

Options:
  --hv-url      HAR Viewer URL.
            [required] [default: "http://gitgrimbo.github.io/harviewer/master/"]
  --har         HAR URL. Can be provided zero or more times.
  --harp        HARP URL. Can be provided zero or more times.
  --hv-pageIdx  Index of the page to open.                          [default: 0]
  --hv-width    Width of viewport.                               [default: 1280]
  --hv-height   Height of viewport. Defaults to full document.body.clientHeight.
  --dest        Filename for the screenshot.          [default: "harviewer.png"]
  --help        Show help                                              [boolean]
````

E.g.

`node index.js --har http://localhost:8080/hars/myhar.har --hv-pageIdx 4 --hv-width 1024`

The HAR URL must point to a server supporting CORS.  `http-server` can be
used to serve local files with CORS.  For example:

````bash
npm install -g http-server
cd FOLDER_CONTAINING_HARS
http-server --cors
````

## As library

````js
const screenshot = require("./lib/screenshot");

const opts = {
  hvUrl: "http://gitgrimbo.github.io/harviewer/master/?har=http://localhost:8080/my-har.har",
  hvPageIdx: 0,
  hvWidth: 1280,
  hvHeight: 1024,
  dest: "harviewer.png"
};

screenshot.screenshot(opts);
````

# TODO

- In-built HTTP server to serve local HAR files.
- Customisation
  - Timeouts.
  - Remove tabs/button/extraneous chrome.
  - Custom pre-processing of HARs
    - Filter `har.log.pages` (E.g. if HAR has several pages but you're only interested in one/some).

# Development

## Linting

`npm run lint`
