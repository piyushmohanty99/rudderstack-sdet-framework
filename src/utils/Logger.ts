import winston from 'winston';
import fs from 'fs';
import path from 'path';

export class TestLogger {
  private static instance: TestLogger;
  private logger: winston.Logger;

  private constructor() {
    const logDir = 'reports/logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} [${level.toUpperCase()}] ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`
        )
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ level, message, timestamp, ...meta }) =>
                `${timestamp} [${level.toUpperCase()}] ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`
            )
          ),
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'test.log'),
          level: 'info',
        }),
      ],
    });
  }

  public static getInstance(): TestLogger {
    if (!TestLogger.instance) {
      TestLogger.instance = new TestLogger();
    }
    return TestLogger.instance;
  }

  public info(message: string, meta: any = {}): void {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta: any = {}): void {
    this.logger.debug(message, meta);
  }

  public warn(message: string, meta: any = {}): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta: any = {}): void {
    this.logger.error(message, meta);
  }

  public logTestStart(testName: string): void {
    this.logger.info(`\n🟢 START TEST: ${testName}\n`);
  }

  public logTestEnd(testName: string, status: string, duration: number): void {
    this.logger.info(`\n🔴 END TEST: ${testName} - Status: ${status} - Duration: ${duration}ms\n`);
  }
}
