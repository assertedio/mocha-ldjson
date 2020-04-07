import Bluebird from 'bluebird';
import { expect } from 'chai';
import { has, set } from 'lodash';
import Mocha from 'mocha';
import path from 'path';
import sinon from 'sinon';

import { LdJsonReporter } from '../../src/ldJsonReporter';

const RESOURCES_DIR = path.join(__dirname, '../resources');

describe('ldjson reporter - single failing test', () => {
  let mocha;
  let stubbedPrepareFile;
  let stubbedAppendFile;
  let loggedData;

  before(async () => {
    stubbedPrepareFile = sinon.stub(LdJsonReporter, 'prepareFile');
    stubbedAppendFile = sinon.stub(LdJsonReporter, 'appendToFile');

    mocha = new Mocha({ reporter: LdJsonReporter, bail: false });
    mocha.addFile(path.join(RESOURCES_DIR, 'examples/single-failing.js'));

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
    expect(loggedData.length).to.eql(8);
  });

  it('test failure', () => {
    const [failedEvent] = loggedData.filter(({ type }) => type === 'fail');

    expect(failedEvent.data.result).to.eql('failed');
    expect(failedEvent.data.error.diff).to.eql('- true\n+ false\n');
    expect(failedEvent.stats.failures).to.eql(1);
  });
});
