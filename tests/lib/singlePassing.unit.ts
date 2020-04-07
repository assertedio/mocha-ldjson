import Bluebird from 'bluebird';
import { expect } from 'chai';
import { first, has, isInteger, last, omit, set } from 'lodash';
import Mocha from 'mocha';
import path from 'path';
import sinon from 'sinon';

import { LdJsonReporter } from '../../src/ldJsonReporter';

const RESOURCES_DIR = path.join(__dirname, '../resources');

describe('ldjson reporter - single passing test', () => {
  let mocha;
  let stubbedPrepareFile;
  let stubbedAppendFile;
  let loggedData;

  before(async () => {
    stubbedPrepareFile = sinon.stub(LdJsonReporter, 'prepareFile');
    stubbedAppendFile = sinon.stub(LdJsonReporter, 'appendToFile');

    mocha = new Mocha({ reporter: LdJsonReporter, bail: false });
    mocha.addFile(path.join(RESOURCES_DIR, 'examples/single-passing.js'));

    await Bluebird.fromCallback((cb) => mocha.run((...args) => cb(null, args)));

    loggedData = stubbedAppendFile.args
      .map(([, content]) => content)
      .map((content) => {
        if (has(content, 'timestamp')) {
          set(content, 'timestamp', 'date');
        }

        if (has(content, 'stats.start')) {
          set(content, 'stats.start', 'date');
        }

        if (has(content, 'stats.end')) {
          set(content, 'stats.end', 'date');
        }

        return content;
      });
  });

  after(() => {
    sinon.restore();
  });

  it('prepares file and expected logged events', () => {
    expect(stubbedPrepareFile.args).to.eql([['reports/report.ldjson', undefined]]);
    expect(loggedData.length).to.eql(16);
  });

  it('start event', () => {
    const event = first(loggedData) as any;

    expect(event.type).to.eql('start');

    expect(isInteger(event.elapsedMs)).to.eql(true);
    expect(isInteger(event.stats.duration)).to.eql(false);

    expect(omit(event, ['elapsedMs', 'stats.duration'])).to.eql({
      type: 'start',
      data: {
        duration: null,
        error: null,
        file: null,
        fullTitle: null,
        fullTitlePath: [],
        id: null,
        result: null,
        root: false,
        timedOut: false,
        title: null,
      },
      timestamp: 'date',
      stats: {
        suites: 0,
        tests: 0,
        passes: 0,
        pending: 0,
        failures: 0,
        start: 'date',
        end: 'date',
      },
    });
  });

  it('root suite start', () => {
    const event = loggedData[1] as any;
    expect(event.type).to.eql('suite');
    expect(event.data.root).to.eql(true);
  });

  it('base suite start', () => {
    const event = loggedData[2] as any;
    expect(event.type).to.eql('suite');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('passing suite');
    expect(event.data.fullTitle).to.eql('passing suite');
    expect(event.data.fullTitlePath).to.eql(['passing suite']);
  });

  it('before all', () => {
    const event = loggedData[3] as any;
    expect(event.type).to.eql('hook');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"before all" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "before all" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"before all" hook']);
  });

  it('before all end', () => {
    const event = loggedData[4] as any;
    expect(event.type).to.eql('hook end');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"before all" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "before all" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"before all" hook']);
  });

  it('test start', () => {
    const event = loggedData[5] as any;
    expect(event.type).to.eql('test');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('passing test');
    expect(event.data.fullTitle).to.eql('passing suite -> passing test');
    expect(event.data.fullTitlePath).to.eql(['passing suite', 'passing test']);
    expect(event.data.result).to.eql(null);
  });

  it('before each', () => {
    const event = loggedData[6] as any;
    expect(event.type).to.eql('hook');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"before each" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "before each" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"before each" hook']);
  });

  it('before each end', () => {
    const event = loggedData[7] as any;
    expect(event.type).to.eql('hook end');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"before each" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "before each" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"before each" hook']);
  });

  it('test end', () => {
    const event = loggedData[8] as any;
    expect(event.type).to.eql('pass');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('passing test');
    expect(event.data.fullTitle).to.eql('passing suite -> passing test');
    expect(event.data.fullTitlePath).to.eql(['passing suite', 'passing test']);
    expect(event.data.result).to.eql('passed');
  });

  it('after each', () => {
    const event = loggedData[9] as any;
    expect(event.type).to.eql('hook');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"after each" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "after each" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"after each" hook']);
  });

  it('after each end', () => {
    const event = loggedData[10] as any;
    expect(event.type).to.eql('hook end');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"after each" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "after each" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"after each" hook']);
  });

  it('after all', () => {
    const event = loggedData[11] as any;
    expect(event.type).to.eql('hook');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"after all" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "after all" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"after all" hook']);
  });

  it('after all end', () => {
    const event = loggedData[12] as any;
    expect(event.type).to.eql('hook end');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('"after all" hook');
    expect(event.data.fullTitle).to.eql('passing suite -> "after all" hook');
    expect(event.data.fullTitlePath).to.eql(['passing suite', '"after all" hook']);
  });

  it('base suite end', () => {
    const event = loggedData[13] as any;
    expect(event.type).to.eql('suite end');
    expect(event.data.root).to.eql(false);
    expect(event.data.file).to.eql(path.join(RESOURCES_DIR, 'examples/single-passing.js'));
    expect(event.data.title).to.eql('passing suite');
    expect(event.data.fullTitle).to.eql('passing suite');
    expect(event.data.fullTitlePath).to.eql(['passing suite']);
  });

  it('root suite end', () => {
    const event = loggedData[14] as any;
    expect(event.type).to.eql('suite end');
    expect(event.data.root).to.eql(true);
  });

  it('end event', () => {
    const event = last(loggedData) as any;

    expect(event.type).to.eql('end');

    expect(isInteger(event.elapsedMs)).to.eql(true);
    expect(isInteger(event.stats.duration)).to.eql(true);
    expect(event.elapsedMs).to.closeTo(event.stats.duration, 2);
    expect(omit(event, ['elapsedMs', 'stats.duration'])).to.eql({
      type: 'end',
      data: {
        duration: null,
        error: null,
        file: null,
        fullTitle: null,
        fullTitlePath: [],
        id: null,
        result: null,
        root: false,
        timedOut: false,
        title: null,
      },
      timestamp: 'date',
      stats: {
        suites: 1,
        tests: 1,
        passes: 1,
        pending: 0,
        failures: 0,
        start: 'date',
        end: 'date',
      },
    });
  });
});
