import { boolean } from 'boolean';
import debug from 'debug';
import Err from 'err';
import fs from 'fs-extra';
import { isObject } from 'lodash';
import { DateTime } from 'luxon';
import Mocha from 'mocha';
import path from 'path';

import { name } from '../package.json';
import { TestDataInterface } from './testEvent';

import Base = Mocha.reporters.Base;
import Runner = Mocha.Runner;
import MochaOptions = Mocha.MochaOptions;
import Suite = Mocha.Suite;
import Test = Mocha.Test;

const log = debug(name);

const { EVENT_TEST_BEGIN, EVENT_RUN_BEGIN, EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_RUN_END, EVENT_SUITE_BEGIN, EVENT_SUITE_END } = Runner.constants;

const CONSTANTS = {
  DEFAULT_DIR: 'reports/',
  DEFAULT_FILENAME: 'report.ldjson',
  ALLOWED_ERR_PROPS: ['stack', 'message', 'code', 'actual', 'expected', 'operator'],
  TIMEOUT_CODE: 'RUN_TIMEOUT',
};

/**
 * @class
 */
class Ldjson extends Base {
  private readonly outputPath: string;

  private startTime: number | null = null;

  private readonly overallTimeout: NodeJS.Timeout | null = null;

  private readonly overallTimeoutMs: number | null = null;

  /**
   * @param {Runner} runner
   * @param {MochaOptions} [options]
   */
  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);

    const DEFAULT_PATH = path.join(CONSTANTS.DEFAULT_DIR, CONSTANTS.DEFAULT_FILENAME);

    const { outputPath, append, overallTimeoutMs }: { outputPath: string; append: string; overallTimeoutMs: string } = options?.reporterOptions || {};

    if (overallTimeoutMs) {
      this.overallTimeoutMs = parseInt(overallTimeoutMs, 10);
      log(`Setting timeout for: ${overallTimeoutMs} ms`);
      this.overallTimeout = setTimeout(() => {
        console.error('Overall timeout met. Throwing exception.');
        throw new Err('Routine timed out', CONSTANTS.TIMEOUT_CODE);
      }, parseInt(overallTimeoutMs, 10));
    }

    this.outputPath = outputPath || DEFAULT_PATH;

    if (path.extname(this.outputPath) === '' || path.extname(this.outputPath) === '.') {
      this.outputPath = path.join(this.outputPath, CONSTANTS.DEFAULT_FILENAME);
    }

    if (fs.pathExistsSync(this.outputPath) && !boolean(append)) {
      log(`Overwriting path: ${this.outputPath}`);
      fs.removeSync(this.outputPath);
    } else {
      log(`New output path: ${this.outputPath}`);
    }

    fs.ensureFileSync(this.outputPath);

    this.prepareRunner(runner);
  }

  /**
   * Prepare runner by attaching listeners
   * @param {Runner} runner
   * @returns {void}
   */
  prepareRunner(runner: Runner): void {
    const { total } = runner;

    runner.once(EVENT_RUN_BEGIN, () => {
      this.startTime = DateTime.utc()
        .toJSDate()
        .valueOf();
      this.writeEvent(EVENT_RUN_BEGIN, { total, stats: this.stats });
    });

    const processSuite = (suite: Suite): TestDataInterface => {
      return { total, title: suite.title, fullTitle: suite.fullTitle(), root: suite.root, stats: this.stats };
    };

    runner.on(EVENT_SUITE_BEGIN, (suite: Suite) => this.writeEvent(EVENT_SUITE_BEGIN, processSuite(suite)));
    runner.on(EVENT_SUITE_END, (suite: Suite) => this.writeEvent(EVENT_SUITE_END, processSuite(suite)));

    const errorJSON = (err) => {
      if (!isObject(err)) return null;
      const res = {};
      Object.getOwnPropertyNames(err)
        .filter((key) => CONSTANTS.ALLOWED_ERR_PROPS.includes(key))
        .forEach((key) => {
          res[key] = err[key];
        }, err);
      return res;
    };

    const getTestResult = (test: Test): string => {
      if (test.state) {
        return test.state;
      }
      if (test.pending) {
        return 'pending';
      }
      return 'unknown';
    };

    const processTest = (test: Test, err): TestDataInterface => {
      const error = err || test.err;

      return {
        total,
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        result: getTestResult(test),
        err: errorJSON(error),
        stats: this.stats,
      };
    };

    runner.on(EVENT_TEST_BEGIN, (test: Test, err) => this.writeEvent(EVENT_TEST_BEGIN, processTest(test, err)));
    runner.on(EVENT_TEST_PASS, (test: Test, err) => this.writeEvent(EVENT_TEST_PASS, processTest(test, err)));
    runner.on(EVENT_TEST_FAIL, (test: Test, err) => this.writeEvent(EVENT_TEST_FAIL, processTest(test, err)));
    runner.once(EVENT_RUN_END, () => {
      this.writeEvent(EVENT_RUN_END, { total, stats: this.stats });
      if (this.overallTimeout) {
        clearTimeout(this.overallTimeout);
      }
    });
  }

  /**
   * Append event to output path
   * @param {string} type
   * @param {{}} data
   * @param {Date} [timestamp]
   * @returns {Promise<void>}
   */
  writeEvent(type: string, data: TestDataInterface, timestamp = DateTime.utc().toJSDate()): void {
    this.startTime = this.startTime || timestamp.valueOf();
    const timeMs = timestamp.valueOf() - (this.startTime as number);

    if (data?.err?.code === CONSTANTS.TIMEOUT_CODE) {
      data.title = `Routine timeout, exceeded: ${this.overallTimeoutMs} ms`;
      data.fullTitle = data.title;
      data.err.stack = null;
    }

    fs.appendFileSync(this.outputPath, `${JSON.stringify({ type, data, timestamp, timeMs })}\n`, { encoding: 'utf8' });

    if (data?.err?.code === CONSTANTS.TIMEOUT_CODE) {
      throw new Err('Routine timed out', CONSTANTS.TIMEOUT_CODE);
    }
  }
}

/**
 * Trap the timeout, and exit
 */
// process.on('uncaughtException', (error) => {
//   if ((error as any)?.code === CONSTANTS.TIMEOUT_CODE) {
//     console.error('Routine timed out');
//     // eslint-disable-next-line no-process-exit
//     return process.exit(1);
//   }
//
//   console.error('Uncaught exception:', error.stack);
//   // eslint-disable-next-line no-process-exit
//   return process.exit(1);
// });

module.exports = Ldjson;
