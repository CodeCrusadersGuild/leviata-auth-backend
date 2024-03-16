import { LoggerService } from '../logger.service';

export function Log() {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const metadata = {
        functionName: propertyKey,
        arguments: args,
        hasFailed: false,
      };

      try {
        const result = await originalMethod.apply(this, args);
        metadata['returnValue'] = result;
        return result;
      } catch (error) {
        metadata['error'] = error.message;
        metadata['hasFailed'] = true;
        throw error;
      } finally {
        const logger = new LoggerService();
        logger.logWithMetadata(metadata);
      }
    };

    return descriptor;
  };
}
