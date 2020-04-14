# mocha-ldjson
Mocha reporter to stream ld-json (newline-delimited json) results to a file as the tests execute.

This way, regardless of the final outcome of the test run (exception, terminated process, hung process, etc) 
you'll still have the results up until the point at which Mocha stopped calling the reporter.


## Install
```bash
npm i --save-dev mocha-ldjson
```

## Use

Just run:

```bash
mocha some-test-file.js --reporter mocha-ldjson
```

And it will output the LDJSON to the current working directory inside `reports/report.ldjson`.

Should look like:

```
{"data":{"id":null,"type":"start","file":null,"title":null,"fullTitlePath":[],"fullTitle":null,"duration":null,"result":null,"error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.250Z","elapsedMs":13,"stats":{"duration":null,"suites":0,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmb000058fd5s2p97f6","type":"suite","file":null,"title":null,"fullTitlePath":[],"fullTitle":"","duration":null,"result":null,"error":null,"root":true,"timedOut":false},"timestamp":"2020-04-14T14:56:09.251Z","elapsedMs":14,"stats":{"duration":null,"suites":0,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmc000158fd5x60dzdy","type":"suite","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"suite 1","fullTitlePath":["suite 1"],"fullTitle":"suite 1","duration":null,"result":null,"error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.252Z","elapsedMs":15,"stats":{"duration":null,"suites":1,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmc000258fd6vaxaseq","type":"test","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"test pass","fullTitlePath":["suite 1","test pass"],"fullTitle":"suite 1 -> test pass","duration":null,"result":null,"error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.252Z","elapsedMs":15,"stats":{"duration":null,"suites":1,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmc000258fd6vaxaseq","type":"pass","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"test pass","fullTitlePath":["suite 1","test pass"],"fullTitle":"suite 1 -> test pass","duration":0,"result":"passed","error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.254Z","elapsedMs":17,"stats":{"duration":null,"suites":1,"tests":0,"passes":1,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmf000358fd8wfwd5ut","type":"test","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"test fail","fullTitlePath":["suite 1","test fail"],"fullTitle":"suite 1 -> test fail","duration":null,"result":null,"error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.255Z","elapsedMs":18,"stats":{"duration":null,"suites":1,"tests":1,"passes":1,"pending":0,"failures":0,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmf000358fd8wfwd5ut","type":"fail","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"test fail","fullTitlePath":["suite 1","test fail"],"fullTitle":"suite 1 -> test fail","duration":2,"result":"failed","error":{"message":"AssertionError: expected { foo: 'bar' } to deeply equal { foo: 'baz' }","stack":"AssertionError: expected { foo: 'bar' } to deeply equal { foo: 'baz' }\n    at Context.<anonymous> (tests/resources/examples/simple.js:8:31)\n    at processImmediate (internal/timers.js:456:21)","diff":" {\n-   \"foo\": \"bar\"\n+   \"foo\": \"baz\"\n }\n"},"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.259Z","elapsedMs":22,"stats":{"duration":null,"suites":1,"tests":1,"passes":1,"pending":0,"failures":1,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmj000458fd98xve68k","type":"test","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"skipped test","fullTitlePath":["suite 1","skipped test"],"fullTitle":"suite 1 -> skipped test","duration":null,"result":null,"error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.259Z","elapsedMs":22,"stats":{"duration":null,"suites":1,"tests":2,"passes":1,"pending":0,"failures":1,"start":"2020-04-14T14:56:09.236Z"}}
{"data":{"id":"ck9013kmj000458fd98xve68k","type":"pass","file":"/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/simple.js","title":"skipped test","fullTitlePath":["suite 1","skipped test"],"fullTitle":"suite 1 -> skipped test","duration":0,"result":"passed","error":null,"root":false,"timedOut":false},"timestamp":"2020-04-14T14:56:09.260Z","elapsedMs":23,"stats":{"duration":null,"suites":1,"tests":2,"passes":2,"pending":0,"failures":1,"start":"2020-04-14T14:56:09.236Z"}}
....
```

Different events have different details, but all follow the format:

```json5
{
  "data": {
    "type": "start|suite|test|pass|fail|suite end|end",
    "id": "some-id", // ID to join the event boundries
    "file": "mocha-ldjson/tests/resources/examples/single-passing.js",
    "title": "passing test",
    "fullTitlePath": [
      "passing suite",
      "passing test"
    ],
    "fullTitle": "passing suite -> passing test",
    "duration": 2,
    "result": "passed",
    "error": null,
    "root": false,
    "timedOut": false
    // Additional fields depending on the event type
  },
  "stats": {
    "suites": 0,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 0,
    // Sometime "start", "end", or "duration" depending on the event type 
  },
  "timestamp": "2020-03-15T22:21:45.622Z", // Time the event occurred at
  "elapsedMs": 15, // Time since the reporter was initialized
}
```

## Options

### Output Path

Use: `mocha some-test-file.js --reporter=mocha-ldsjson --reporter-options=outputPath=some/path/thing.ldjson`

Defaults to `reports/report.ldjson`.

If you specify only a directory, the filename will default to `report.ldjson` within that directory.

### Overall Timeout

Use: `mocha some-test-file.js --reporter=mocha-ldsjson --reporter-options=overallTimeoutMs=10000`

Defaults to `undefined`, with no default timeout.

This is a way of enforcing an overall timeout for the entire test run itself. Once the timeout is reached, an exception
is thrown to terminate the test process, and a non-zero exit code is returned.

Keep in mind that if external processes are spawned during testing, they may not be terminated cleanly as `after` 
and `afterEach` hooks are not called on timeout.

## Event Types

All event types map directly to the `RunnerConstants` defined in the Mocha library.

## Some Event Examples

### Start Run Event

```json5
{
  "data": {
    "id": null,
    "type": "start",
    "file": null,
    "title": null,
    "fullTitlePath": [],
    "fullTitle": null,
    "duration": null,
    "result": null,
    "error": null,
    "root": false,
    "timedOut": false
  },
  "timestamp": "2020-04-14T14:46:41.855Z",
  "elapsedMs": 13,
  "stats": {
    "duration": null,
    "suites": 0,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 0,
    "start": "2020-04-14T14:46:41.842Z"
  }
}
```

### Start Suite Event

```json5
{
  "data": {
    "id": "ck900retc0001mvfd05ox47yw",
    "type": "suite",
    "file": "mocha-ldjson/tests/resources/examples/single-passing.js",
    "title": "passing suite",
    "fullTitlePath": [
      "passing suite"
    ],
    "fullTitle": "passing suite",
    "duration": null,
    "result": null,
    "error": null,
    "root": false,
    "timedOut": false
  },
  "timestamp": "2020-04-14T14:46:41.856Z",
  "elapsedMs": 14,
  "stats": {
    "duration": null,
    "suites": 1,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 0,
    "start": "2020-04-14T14:46:41.842Z"
  }
}
```

### Before All Hook Ended Event

```json5
{
  "data": {
    "id": "ck900retd0002mvfdbhxoa0iz",
    "type": "hook end",
    "file": "mocha-ldjson/tests/resources/examples/single-passing.js",
    "title": "\"before all\" hook",
    "fullTitlePath": [
      "passing suite",
      "\"before all\" hook"
    ],
    "fullTitle": "passing suite -> \"before all\" hook",
    "duration": 0,
    "result": null,
    "error": null,
    "root": false,
    "timedOut": false
  },
  "timestamp": "2020-04-14T14:46:41.857Z",
  "elapsedMs": 15,
  "stats": {
    "duration": null,
    "suites": 1,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 0,
    "start": "2020-04-14T14:46:41.842Z"
  }
}
```

## Passing Test Event

```json5
{
  "data": {
    "id": "ck900retd0003mvfdeqae6ztg",
    "type": "test",
    "file": "mocha-ldjson/tests/resources/examples/single-passing.js",
    "title": "passing test",
    "fullTitlePath": [
      "passing suite",
      "passing test"
    ],
    "fullTitle": "passing suite -> passing test",
    "duration": null,
    "result": null,
    "error": null,
    "root": false,
    "timedOut": false
  },
  "timestamp": "2020-04-14T14:46:41.857Z",
  "elapsedMs": 15,
  "stats": {
    "duration": null,
    "suites": 1,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 0,
    "start": "2020-04-14T14:46:41.842Z"
  }
}
```

### Failing Test Event

```json5
{
  "data": {
    "id": "ck900qjza0002jufd1kqn97kr",
    "type": "fail",
    "file": "mocha-ldjson/tests/resources/examples/single-failing.js",
    "title": "failing test",
    "fullTitlePath": [
      "failing suite",
      "failing test"
    ],
    "fullTitle": "failing suite -> failing test",
    "duration": 2,
    "result": "failed",
    "error": {
      "message": "AssertionError: expected true to deeply equal false",
      "stack": "AssertionError: expected true to deeply equal false\n    at Context.<anonymous> (tests/resources/examples/single-failing.js:5:21)\n    at processImmediate (internal/timers.js:456:21)",
      "diff": "- true\n+ false\n"
    },
    "root": false,
    "timedOut": false
  },
  "timestamp": "2020-04-14T14:46:01.898Z",
  "elapsedMs": 19,
  "stats": {
    "duration": null,
    "suites": 1,
    "tests": 0,
    "passes": 0,
    "pending": 0,
    "failures": 1,
    "start": "2020-04-14T14:46:01.879Z"
  }
}
```
