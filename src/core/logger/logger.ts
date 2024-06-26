export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

class LoggerImpl implements Logger {
  public constructor(private readonly debug: boolean) {}

  public info(...args: any[]) {
    if (this.debug) console.info(...args);
  }

  public error(...args: any[]) {
    if (this.debug) console.error(...args);
  }

  public warn(...args: any[]) {
    if (this.debug) console.warn(...args);
  }
}

export function createLogger(debug: boolean): Logger {
  return new LoggerImpl(debug);
}
