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
{"type":"start","data":{"total":1,"stats":{"suites":0,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.622Z","timeMs":15}
{"type":"suite","data":{"title":"","fullTitle":"","root":true,"stats":{"suites":0,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.622Z","timeMs":15}
{"type":"suite","data":{"title":"suite 1","fullTitle":"suite 1","root":false,"stats":{"suites":1,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.623Z","timeMs":16}
{"type":"test","data":{"title":"test timeout","fullTitle":"suite 1 test timeout","result":"unknown","err":null,"stats":{"suites":1,"tests":0,"passes":0,"pending":0,"failures":0,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.623Z","timeMs":16}
{"type":"fail","data":{"title":"test timeout","fullTitle":"suite 1 test timeout","duration":50,"result":"failed","err":{"stack":"Error: Timeout of 50ms exceeded. For async tests and hooks, ensure \"done()\" is called; if returning a Promise, ensure it resolves. (/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/timeout.js)\n    at listOnTimeout (internal/timers.js:549:17)\n    at processTimers (internal/timers.js:492:7)","message":"Timeout of 50ms exceeded. For async tests and hooks, ensure \"done()\" is called; if returning a Promise, ensure it resolves. (/home/ehacke/workspace/assertedio/mocha-ldjson/tests/resources/examples/timeout.js)"},"stats":{"suites":1,"tests":0,"passes":0,"pending":0,"failures":1,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.676Z","timeMs":69}
{"type":"suite end","data":{"title":"suite 1","fullTitle":"suite 1","root":false,"stats":{"suites":1,"tests":1,"passes":0,"pending":0,"failures":1,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.677Z","timeMs":70}
{"type":"suite end","data":{"title":"","fullTitle":"","root":true,"stats":{"suites":1,"tests":1,"passes":0,"pending":0,"failures":1,"start":"2020-03-15T22:21:45.607Z"}},"timestamp":"2020-03-15T22:21:45.677Z","timeMs":70}
{"type":"end","data":{"stats":{"suites":1,"tests":1,"passes":0,"pending":0,"failures":1,"start":"2020-03-15T22:21:45.607Z","end":"2020-03-15T22:21:45.677Z","duration":70}},"timestamp":"2020-03-15T22:21:45.677Z","timeMs":70}
```

Different events have different details, but all follow the format:

```json5
{
  "type": "start|suite|test|pass|fail|suite end|end",
  "data": {
    "stats": {
      "suites": 0,
      "tests": 0,
      "passes": 0,
      "pending": 0,
      "failures": 0,
      // Sometime "start", "end", or "duration" depending on the event type 
    },
    // Additional fields depending on the event type
  },
  "timestamp": "2020-03-15T22:21:45.622Z", // Time the event occurred at
  "timeMs": 15, // Time since the reporter was initialized
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

### Start Run Event

```json5
{
  "type": "start",
  "data": {
    "total": 1,
    "stats": {
      "suites": 0,
      "tests": 0,
      "passes": 0,
      "pending": 0,
      "failures": 0,
      "start": "2020-03-15T22:21:45.607Z"
    }
  },
  "timestamp": "2020-03-15T22:21:45.622Z",
  "timeMs": 15
}
```

### Start Suite Event

```json5
{
  "type": "suite",
  "data": {
    "title": "",
    "fullTitle": "",
    "root": true,  // Indicates a root test suite
    "stats": {
      "suites": 0,
      "tests": 0,
      "passes": 0,
      "pending": 0,
      "failures": 0,
      "start": "2020-03-15T22:21:45.607Z"
    }
  },
  "timestamp": "2020-03-15T22:21:45.622Z",
  "timeMs": 15
}
```

### Start Test Event

```json5
{
  "type": "test",
  "data": {
    "title": "test timeout",
    "fullTitle": "suite 1 test timeout",
    "result": "unknown", // Usually indicates a start
    "err": null,
    "stats": {
      "suites": 1,
      "tests": 0,
      "passes": 0,
      "pending": 0,
      "failures": 0,
      "start": "2020-03-15T22:21:45.607Z"
    }
  },
  "timestamp": "2020-03-15T22:21:45.623Z",
  "timeMs": 16
}
``` 

## Passing Test Event

```json5
{
  "type": "pass",
  "data": {
    "title": "test pass",
    "fullTitle": "suite 1 test pass",
    "duration": 0,
    "result": "passed",
    "err": null,
    "stats": {
      "suites": 1,
      "tests": 0,
      "passes": 1,
      "pending": 0,
      "failures": 0,
      "start": "2020-03-15T22:43:21.545Z"
    }
  },
  "timestamp": "2020-03-15T22:43:21.561Z",
  "timeMs": 16
}
```

### Failing Test Event

```json5
{
  "type": "fail",
  "data": {
    "title": "test fail",
    "fullTitle": "suite 1 test fail",
    "duration": 11,
    "result": "failed",
    "err": {
      "stack": "AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:\n\n  assert.ok(null)\n\n    at Context.<anonymous> (tests/resources/examples/simple.js:6:32)\n    at processImmediate (internal/timers.js:456:21)",
      "message": "The expression evaluated to a falsy value:\n\n  assert.ok(null)\n",
      "code": "ERR_ASSERTION",
      "actual": null,
      "expected": true,
      "operator": "=="
    },
    "stats": {
      "suites": 1,
      "tests": 1,
      "passes": 1,
      "pending": 0,
      "failures": 1,
      "start": "2020-03-15T22:43:21.545Z"
    }
  },
  "timestamp": "2020-03-15T22:43:21.572Z",
  "timeMs": 27
}
```

### Root Suite End

```json5
{
  "type": "suite end",
  "data": {
    "title": "",
    "fullTitle": "",
    "root": true,
    "stats": {
      "suites": 4,
      "tests": 7,
      "passes": 4,
      "pending": 1,
      "failures": 2,
      "start": "2020-03-15T22:43:21.545Z"
    }
  },
  "timestamp": "2020-03-15T22:43:21.575Z",
  "timeMs": 30
}
```

### Test Run End

```json5
{
  "type": "end",
  "data": {
    "stats": {
      "suites": 4,
      "tests": 7,
      "passes": 4,
      "pending": 1,
      "failures": 2,
      "start": "2020-03-15T22:43:21.545Z",
      "end": "2020-03-15T22:43:21.575Z",
      "duration": 30
    }
  },
  "timestamp": "2020-03-15T22:43:21.575Z",
  "timeMs": 30
}
```
