import { LogLevel } from '../enums/log.level';
import { GenericLogDecorator } from './generic-log-decorator';

class LogDecorator extends GenericLogDecorator {
  log = () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
    LogDecorator.apply(key, descriptor, LogLevel.DEBUG);

  info =
    () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
      LogDecorator.apply(key, descriptor, LogLevel.INFO);

  warn =
    () => (target: any, key: PropertyKey, descriptor: PropertyDescriptor) =>
      LogDecorator.apply(key, descriptor, LogLevel.WARN);
}

const decorator: LogDecorator = new LogDecorator();

const { log } = decorator;
const { info } = decorator;
const { warn } = decorator;
export { log, info, warn };
