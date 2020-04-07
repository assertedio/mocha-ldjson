export interface TestErrorInterface {
  stack?: string | null;
  message?: string;
  diff?: string;
  code?: string | number;
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

export interface TestDataInterface {
  id: string | null;
  title: string | null;
  fullTitle: string | null;
  fullTitlePath: string[];
  duration: number | null;
  result: string | null;
  root: boolean;
  file: string | null;
  error: TestErrorInterface | null;
  timedOut: boolean;
}

export interface TestEventInterface {
  type: string;
  data: TestDataInterface;
  stats: TestStatsInterface;
  timestamp: Date;
  elapsedMs: number;
}
