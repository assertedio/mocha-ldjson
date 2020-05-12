import { boolean } from 'boolean';
import cuid from 'cuid';
import debug from 'debug';
import Err from 'err';
import fs from 'fs-extra';
import { isFunction, isNumber } from 'lodash';
import { DateTime } from 'luxon';
import Mocha from 'mocha';
import path from 'path';
import stripAnsi from 'strip-ansi';

import { name } from '../package.json';
import { TEST_EVENT_TYPES, TEST_RESULT_STATUS, TestDataInterface, TestEventInterface, TestStatsInterface } from './testEvent';
import { getStats, processError } from './utils';

import Base = Mocha.reporters.Base;
import Runner = Mocha.Runner;
import MochaOptions = Mocha.MochaOptions;
import Suite = Mocha.Suite;

const log = debug(name);

const {
  EVENT_HOOK_BEGIN,
  EVENT_HOOK_END,
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
} = TEST_EVENT_TYPES;

const CONSTANTS = {
  DEFAULT_DIR: 'reports/',
  DEFAULT_FILENAME: 'report.ldjson',
  ALLOWED_ERR_PROPS: ['stack', 'message', 'code', 'actual', 'expected', 'operator'],
  TIMEOUT_CODE: 'RUN_TIMEOUT',
  TIMEOUT_EXIT_CODE: 30,
};

/**
 * @class
 */
export class LdJsonReporter extends Base {
  static CONSTANTS = CONSTANTS;

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

    const {
      outputPath,
      append,
      overallTimeoutMs,
      exitOnTimeout,
    }: { outputPath: string; append: boolean; overallTimeoutMs: string; exitOnTimeout: boolean } = options?.reporterOptions || {};

    if (overallTimeoutMs) {
      this.overallTimeoutMs = Number.parseInt(overallTimeoutMs, 10);
      log(`Setting timeout for: ${overallTimeoutMs} ms`);
      this.overallTimeout = setTimeout(() => {
        console.error('Overall timeout met. Throwing exception.');
        throw new Err('Routine timed out', CONSTANTS.TIMEOUT_CODE);
      }, Number.parseInt(overallTimeoutMs, 10));
    }

    this.outputPath = outputPath || DEFAULT_PATH;

    if (path.extname(this.outputPath) === '' || path.extname(this.outputPath) === '.') {
      this.outputPath = path.join(this.outputPath, CONSTANTS.DEFAULT_FILENAME);
    }

    if (exitOnTimeout) {
      LdJsonReporter.exitOnTimeout();
    }

    LdJsonReporter.prepareFile(this.outputPath, append);
    this.prepareRunner(runner);
  }

  /**
   * Trap uncaught exceptions and rejectsions
   *
   * @returns {void}
   */
  static exitOnTimeout(): void {
    process.on('uncaughtException', (error) => {
      if ((error as any)?.code === CONSTANTS.TIMEOUT_CODE) {
        console.error('Routine timed out');
        // eslint-disable-next-line no-process-exit
        process.exit(CONSTANTS.TIMEOUT_EXIT_CODE);
      }
    });
  }

  /**
   * Ensure output file exists
   *
   * @param {string} outputPath
   * @param {boolean} append
   * @returns {void}
   */
  static prepareFile(outputPath: string, append: boolean): void {
    if (fs.pathExistsSync(outputPath) && !boolean(append)) {
      log(`Overwriting path: ${outputPath}`);
      fs.removeSync(outputPath);
    } else {
      log(`New output path: ${outputPath}`);
    }

    fs.ensureFileSync(outputPath);
  }

  /**
   * Get test result
   *
   * @param {any} test
   * @returns {TEST_RESULT_STATUS | null}
   */
  static getTestResult(test: any = {}): TEST_RESULT_STATUS | null {
    if (test.state === TEST_RESULT_STATUS.PASSED) {
      return TEST_RESULT_STATUS.PASSED;
    }

    if (test.state === TEST_RESULT_STATUS.FAILED) {
      return TEST_RESULT_STATUS.FAILED;
    }

    if (test.pending) {
      return TEST_RESULT_STATUS.PENDING;
    }
    return null;
  }

  /**
   * Process event into test data object
   *
   * @param {TEST_EVENT_TYPES} type
   * @param {Test | Hook | Suite} eventObject
   * @param {{}} err
   * @returns {TestDataInterface}
   */
  static processEvent(type: TEST_EVENT_TYPES, eventObject: any = {} as any, err = null): TestDataInterface {
    const error = err || eventObject.err;

    return {
      id: (eventObject as any).id || null,
      type,
      file: eventObject.file || null,
      title: eventObject.title ? stripAnsi(eventObject.title) : null,
      fullTitlePath: isFunction(eventObject.titlePath) ? eventObject.titlePath().map((title) => stripAnsi(title)) : [],
      fullTitle: isFunction(eventObject.titlePath) ? stripAnsi(eventObject.titlePath().join(' -> ')) : null,
      duration: isNumber(eventObject.duration) ? (eventObject.duration as number) : null,
      result: LdJsonReporter.getTestResult(eventObject),
      error: error ? processError(error) : null,
      root: eventObject.root || false,
      timedOut: eventObject.timedOut || false,
    };
  }

  /**
   * Prepare runner by attaching listeners
   *
   * @param {Runner} runner
   * @returns {void}
   */
  prepareRunner(runner: Runner): void {
    runner.once(EVENT_RUN_BEGIN, () => {
      this.startTime = DateTime.utc().toJSDate().valueOf();
      this.writeEvent(LdJsonReporter.processEvent(EVENT_RUN_BEGIN), getStats(this.stats));
    });

    [EVENT_HOOK_BEGIN, EVENT_TEST_BEGIN].forEach((eventType) =>
      runner.on(eventType, (eventObject, err = null) => {
        (eventObject as any).id = cuid();
        this.writeEvent(LdJsonReporter.processEvent(eventType, eventObject, err), getStats(this.stats));
      })
    );
    runner.on(EVENT_SUITE_BEGIN, (suite: Suite) => {
      (suite as any).id = cuid();
      this.writeEvent(LdJsonReporter.processEvent(EVENT_SUITE_BEGIN, suite), getStats(this.stats));
    });

    [EVENT_HOOK_END, EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_PENDING].forEach((eventType) =>
      runner.on(eventType, (eventObject: any, err = null) =>
        this.writeEvent(LdJsonReporter.processEvent(eventType, eventObject, err), getStats(this.stats))
      )
    );
    runner.on(EVENT_SUITE_END, (suite: Suite) => this.writeEvent(LdJsonReporter.processEvent(EVENT_SUITE_END, suite), getStats(this.stats)));

    runner.once(EVENT_RUN_END, () => {
      this.writeEvent(LdJsonReporter.processEvent(EVENT_RUN_END), getStats(this.stats));
      if (this.overallTimeout) {
        clearTimeout(this.overallTimeout);
      }
    });
  }

  /**
   * Append to file (mock for testing)
   *
   * @param {string} outputPath
   * @param {TestEventInterface} testEvent
   * @returns {void}
   */
  static appendToFile(outputPath: string, testEvent: TestEventInterface): void {
    fs.appendFileSync(outputPath, `${JSON.stringify(testEvent)}\n`, { encoding: 'utf8' });
  }

  /**
   * Append event to output path
   *
   * @param {{}} data
   * @param {TestStatsInterface} stats
   * @param {Date} [timestamp]
   * @returns {void}
   */
  writeEvent(data: TestDataInterface, stats: TestStatsInterface, timestamp = DateTime.utc().toJSDate()): void {
    this.startTime = this.startTime || timestamp.valueOf();
    const elapsedMs = timestamp.valueOf() - (this.startTime as number);

    if (data?.error?.code === CONSTANTS.TIMEOUT_CODE) {
      data.title = `Routine timeout. Exceeded ${this.overallTimeoutMs} ms`;
      data.fullTitle = data.title;
      data.error.stack = null;
    }

    LdJsonReporter.appendToFile(this.outputPath, { data, timestamp, elapsedMs, stats });

    if (data?.error?.code === CONSTANTS.TIMEOUT_CODE) {
      throw new Err('Routine timed out', CONSTANTS.TIMEOUT_CODE);
    }
  }
}
