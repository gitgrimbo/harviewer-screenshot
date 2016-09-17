# harviewer-screenshot

Take screenshots of [HAR Viewer](https://github.com/janodvarko/harviewer).

# Usage

## From the command line

````
harviewer-screenshot --help

Options:
  --hv-url            HAR Viewer URL.
            [required] [default: "http://gitgrimbo.github.io/harviewer/master/"]
  --har               HAR URL or file path. Can be provided zero or more times.
  --harp              HARP URL or file path. Can be provided zero or more times.
  --hv-pageIdx        Index of the page to open.                    [default: 0]
  --hv-width          Width of viewport.                         [default: 1280]
  --hv-height         Height of viewport. Defaults to full
                      document.body.clientHeight.
  --hv-show-stats     Show the stats or not.          [boolean] [default: false]
  --hv-show-timeline  Show the timeline or not.       [boolean] [default: false]
  --dest              Filename for the screenshot.    [default: "harviewer.png"]
  --help              Show help                                        [boolean]
````

### Serve HAR files from standalone server

`harviewer-screenshot --har http://localhost:8080/hars/myhar.har --hv-pageIdx 4 --hv-width 1024`

The HAR URL must point to a server supporting CORS.  `http-server` can be
used to serve local files with CORS.  For example:

````bash
npm install -g http-server
cd FOLDER_CONTAINING_HARS
http-server --cors
````

### Serve HAR files using in-built server

If the `--har` argument is a valid file path, a local HTTP server is started
to serve this file to HAR Viewer. E.g.:

`harviewer-screenshot --har local-file.har`

will start a HTTP server (on a random available port) and output something
like the following:

````
Started local server on port 3933
Creating page
Opening http://gitgrimbo.github.io/harviewer/master/?har=http://localhost:3933/c:/path/to/local-file.har
````

### Serve HAR file from stdin

E.g. (on Windows):

`type x.har | harviewer-screenshot`

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

# Development

## Linting

`npm run lint`

# TODO

- Customisation
  - Timeouts.
  - Remove tabs/button/extraneous chrome.
  - Custom pre-processing of HARs
    - Filter `har.log.pages` (E.g. if HAR has several pages but you're only interested in one/some).

# License

MIT © [Paul Grime](https://github.com/gitgrimbo/)
