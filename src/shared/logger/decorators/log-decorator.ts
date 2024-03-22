import { LogLevel } from '../enums/log.level';
import { GenericLogDecorator } from './generic-log-decorator';

class LogDecorator extends GenericLogDecorator {
  /**
   * Method decorator to add DEBUG level logs.
   * @returns A method decorator that adds a DEBUG level log.
   */
  log = () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
    LogDecorator.apply(key, descriptor, LogLevel.DEBUG);

  /**
   * Method decorator to add INFO level logs.
   * @returns A method decorator that adds an INFO level log.
   */
  info =
    () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
      LogDecorator.apply(key, descriptor, LogLevel.INFO);

  /**
   * Method decorator to add WARN level logs.
   * @returns A method decorator that adds a WARN level log.
   */
  warn =
    () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
      LogDecorator.apply(key, descriptor, LogLevel.WARN);
}

const decorator: LogDecorator = new LogDecorator();

const { log } = decorator;
const { info } = decorator;
const { warn } = decorator;

export { log, info, warn };
