import { LoggerContext } from './LoggerContext';
import { LocalStorage } from './LocalStorage';
import { ContextNamespace } from './enums/context-namespaces';
import { LoggerConfigs } from './config/logger-configs';

// Mocking LocalStorage for testing purposes
jest.mock('./LocalStorage');

describe('LoggerContext', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  describe('setCorrelationId', () => {
    it('should set correlation ID in logger context', () => {
      const correlationId = '123456';
      LoggerContext.setCorrelationId(correlationId);
      expect(LocalStorage.setContextValue).toHaveBeenCalledWith(
        'correlationId',
        correlationId,
        ContextNamespace.LOGGER,
      );
    });
  });

  describe('getCorrelationId', () => {
    it('should retrieve correlation ID from logger context', () => {
      const correlationId = '123456';
      (LocalStorage.getContextValue as jest.Mock).mockReturnValueOnce(
        correlationId,
      );
      const result = LoggerContext.getCorrelationId();
      expect(LocalStorage.getContextValue).toHaveBeenCalledWith(
        'correlationId',
        ContextNamespace.LOGGER,
      );
      expect(result).toEqual(correlationId);
    });
  });

  describe('setLogInfoData', () => {
    it('should set log info data in logger context', () => {
      const key = 'key';
      const value = 'value';
      LoggerContext.setLogInfoData(key, value);
      expect(LocalStorage.setContextValue).toHaveBeenCalledWith(
        key,
        value,
        ContextNamespace.LOGGER,
      );
    });
  });

  describe('getLogInfoData', () => {
    it('should retrieve log info data from logger context', () => {
      const logInfoData = { key: 'value' };
      (LocalStorage.getContextValue as jest.Mock).mockReturnValueOnce(
        logInfoData,
      );
      const result = LoggerContext.getLogInfoData();
      expect(LocalStorage.getContextValue).toHaveBeenCalledWith(
        'extraLogInfo',
        ContextNamespace.LOGGER,
      );
      expect(result).toEqual(logInfoData);
    });
  });

  describe('addLoggerHiddenField', () => {
    it('should add fields to the list of hidden fields in logs', () => {
      const fields = ['field1', 'field2'];
      LoggerConfigs.hiddenFields = [];
      LoggerContext.addLoggerHiddenField(fields);
      expect(LoggerConfigs.hiddenFields).toEqual(fields);
    });

    it('should not add undefined fields to the list of hidden fields in logs', () => {
      LoggerConfigs.hiddenFields = ['existingField'];
      LoggerContext.addLoggerHiddenField(undefined);
      expect(LoggerConfigs.hiddenFields).toEqual(['existingField']);
    });
  });

  describe('setLoggerHiddenField', () => {
    it('should set the list of hidden fields in logs', () => {
      const fields = ['field1', 'field2'];
      LoggerContext.setLoggerHiddenField(fields);
      expect(LoggerConfigs.hiddenFields).toEqual(fields);
    });

    it('should set an empty list if undefined fields are provided', () => {
      LoggerConfigs.hiddenFields = ['existingField'];
      LoggerContext.setLoggerHiddenField(undefined);
      expect(LoggerConfigs.hiddenFields).toEqual([]);
    });
  });
});
