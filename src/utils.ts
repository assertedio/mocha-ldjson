import { TestError, TestErrorInterface, TestStatsInterface } from '@asserted/models';
import { createPatch } from 'diff';
import { isNil, isString } from 'lodash';
import Mocha from 'mocha';
import mochaUtils from 'mocha/lib/utils';
import stripAnsi from 'strip-ansi';

import Stats = Mocha.Stats;

export const getStats = (stats: Stats): TestStatsInterface => ({ duration: null, ...stats });

/**
 * Create a unified diff between two strings
 *
 * @param {string} actual Actual result returned
 * @param {string} expected Result expected
 *
 * @return {string} diff
 */
export const createUnifiedDiff = (actual, expected): string => {
  return (
    createPatch('string', actual, expected)
      .split('\n')
      // eslint-disable-next-line no-magic-numbers
      .splice(4)
      .map((line) => {
        if (line.match(/@@/)) {
          return null;
        }
        if (line.match(/\\ No newline/)) {
          return null;
        }
        return line.replace(/^(-|\+)/, '$1 ');
      })
      .filter((line) => !isNil(line))
      .join('\n')
  );
};

/**
 * Process assertion error or other error into standard format
 * @param {{}} error
 * @returns {TestErrorInterface}
 */
export const processError = (error): TestErrorInterface => {
  const { name, message, stack, showDiff, code } = error;
  let { actual, expected } = error;
  let errMessage;
  let errDiff;

  const sameType = (a, b): boolean => {
    const objToString = Object.prototype.toString;
    return objToString.call(a) === objToString.call(b);
  };

  // Format actual/expected for creating diff
  if (showDiff !== false && sameType(actual, expected) && expected !== undefined) {
    if (!(isString(actual) && isString(expected))) {
      actual = mochaUtils.stringify(actual);
      expected = mochaUtils.stringify(expected);
    }
    errDiff = createUnifiedDiff(actual, expected);
  }

  // Assertion libraries do not output consistent error objects so in order to
  // get a consistent message object we need to create it ourselves
  if (name && message) {
    errMessage = `${name}: ${stripAnsi(message)}`;
  } else if (stack) {
    errMessage = stack.replace(/\n.*/g, '');
  }

  return new TestError({
    message: errMessage,
    stack: stack && stripAnsi(stack),
    diff: errDiff,
    code,
  });
};
