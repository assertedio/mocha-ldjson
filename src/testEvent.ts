export interface TestDataInterface {
  total: number;
  title?: string;
  fullTitle?: string;
  duration?: number;
  result?: string;
  root?: boolean;
  err?: {
    stack?: string | null;
    message?: string;
    code?: string;
    actual?: any;
    expected?: any;
    operator?: string;
  } | null;
  stats: {
    suites: number;
    tests: number;
    passes: number;
    pending: number;
    failures: number;
    start?: Date;
    end?: Date;
    duration?: number;
  };
}

export interface TestEventInterface {
  type: string;
  data?: TestDataInterface;
  timestamp: Date;
  timeMs: number;
}
