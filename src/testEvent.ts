/**
 * IMPORTANT:
 * For the sake of simplicity and minimizing dependencies, this is a copy of
 * just the necessary interfaces from @asserted/models.
 *
 * Changes there should be propagated here
 */

// Should map directly to: RunnerConstants in Mocha
export enum TEST_EVENT_TYPES {
  EVENT_HOOK_BEGIN = 'hook',
  EVENT_HOOK_END = 'hook end',
  EVENT_RUN_BEGIN = 'start',
  EVENT_DELAY_BEGIN = 'waiting',
  EVENT_DELAY_END = 'ready',
  EVENT_RUN_END = 'end',
  EVENT_SUITE_BEGIN = 'suite',
  EVENT_SUITE_END = 'suite end',
  EVENT_TEST_BEGIN = 'test',
  EVENT_TEST_END = 'test end',
  EVENT_TEST_FAIL = 'fail',
  EVENT_TEST_PASS = 'pass',
  EVENT_TEST_PENDING = 'pending',
  EVENT_TEST_RETRY = 'retry',
}

export interface TestStatsInterface {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start?: Date;
  end?: Date;
  duration: number | null;
}

export interface TestStatsConstructorInterface extends Omit<TestStatsInterface, 'start' | 'end'> {
  start?: Date | string;
  end?: Date | string;
}

export interface TestErrorInterface {
  fullTitle?: string;
  stack?: string | null;
  message?: string;
  diff?: string;
  code?: string | number;
}

export enum TEST_RESULT_STATUS {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending',
}

export interface TestDataInterface {
  id: string | null;
  type: TEST_EVENT_TYPES;
  title: string | null;
  fullTitle: string | null;
  fullTitlePath: string[];
  duration: number | null;
  result: TEST_RESULT_STATUS | null;
  root: boolean;
  file: string | null;
  error: TestErrorInterface | null;
  timedOut: boolean;
}

// Should be the same as mocha-ldjson-> TestDataInterface, but don't want to import that whole thing
export interface TestEventInterface {
  data: TestDataInterface;
  stats: TestStatsInterface;
  timestamp: Date;
  elapsedMs: number;
}

export interface TestEventConstructorInterface extends Omit<TestEventInterface, 'timestamp' | 'stats'> {
  stats: TestStatsConstructorInterface;
  timestamp: Date | string;
}
