import { LocalStorage } from './LocalStorage';
import { ContextNamespace } from './enums/context-namespaces';
import { AsyncLocalStorage } from 'async_hooks';

// Mocking AsyncLocalStorage for testing purposes
jest.mock('async_hooks');
const mockedAsyncLocalStorage = AsyncLocalStorage as jest.MockedClass<
  typeof AsyncLocalStorage
>;

describe('LocalStorage', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    mockedAsyncLocalStorage.prototype.run.mockClear();
    mockedAsyncLocalStorage.prototype.getStore.mockClear();
  });

  describe('runInContext', () => {
    it('should run callback in context specific to given namespace', async () => {
      const mockCallback = jest.fn(() => 'result');
      const namespace = ContextNamespace.LOGGER;

      await LocalStorage.runInContext(namespace, mockCallback);

      expect(mockedAsyncLocalStorage.prototype.run).toHaveBeenCalledWith(
        expect.any(Map),
        mockCallback,
      );
    });

    it('should pass correct state to AsyncLocalStorage run method', async () => {
      const mockCallback = jest.fn();
      const namespace = ContextNamespace.LOGGER;

      await LocalStorage.runInContext(namespace, mockCallback);

      // Espera-se que o AsyncLocalStorage.run seja chamado com um objeto Map contendo a estrutura desejada
      expect(mockedAsyncLocalStorage.prototype.run).toHaveBeenCalledWith(
        expect.any(Map), // Espera-se que seja um Map
        mockCallback,
      );

      // Obtenha os argumentos passados para a primeira chamada de mockedAsyncLocalStorage.prototype.run
      const [state] = mockedAsyncLocalStorage.prototype.run.mock.calls[0];

      // Verifique se o state é um Map e contém a estrutura desejada
      expect(state).toBeInstanceOf(Map);
      expect(state.get(namespace)).toEqual(
        expect.objectContaining({
          id: expect.any(String),
        }),
      );
    });
  });

  describe('setContext', () => {
    beforeEach(() => {
      // Reset the mock implementation before each test
      mockedAsyncLocalStorage.prototype.getStore.mockClear();
    });

    it('should set context for specified namespace', () => {
      const namespace = ContextNamespace.LOGGER;
      const context = { key: 'value' };

      // Configurando o mock para retornar um objeto Map com um método set
      const mockStore = new Map();
      mockStore.set = jest.fn();
      mockedAsyncLocalStorage.prototype.getStore.mockReturnValueOnce(mockStore);

      LocalStorage.setContext(namespace, context);

      expect(mockedAsyncLocalStorage.prototype.getStore).toHaveBeenCalled();

      // Verifica se o método set foi chamado corretamente
      expect(mockStore.set).toHaveBeenCalledWith(namespace, context);
    });
  });

  describe('getContext', () => {
    it('should retrieve context for specified namespace', () => {
      const namespace = ContextNamespace.LOGGER;
      const context = { key: 'value' };
      mockedAsyncLocalStorage.prototype.getStore.mockReturnValueOnce(
        new Map([[namespace, context]]),
      );

      const result = LocalStorage.getContext(namespace);

      expect(mockedAsyncLocalStorage.prototype.getStore).toHaveBeenCalled();
      expect(result).toEqual(context);
    });

    it('should return empty object if context not found', () => {
      const namespace = ContextNamespace.LOGGER;
      mockedAsyncLocalStorage.prototype.getStore.mockReturnValueOnce(undefined);

      const result = LocalStorage.getContext(namespace);

      expect(mockedAsyncLocalStorage.prototype.getStore).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('setContextValue', () => {
    beforeEach(() => {
      // Reset the mock implementation before each test
      mockedAsyncLocalStorage.prototype.getStore.mockClear();
    });

    it('should set specific value within context for specified namespace', () => {
      // Arrange
      const namespace = ContextNamespace.LOGGER;
      const key = 'key';
      const value = 'some value';
      const context = { existingKey: 'existing value' };

      // Mock getContext to return a specific context for the given namespace
      jest.spyOn(LocalStorage, 'getContext').mockReturnValueOnce(context);

      // Mock setContext to capture the arguments passed to it
      const setContextMock = jest.spyOn(LocalStorage, 'setContext');

      // Act
      LocalStorage.setContextValue(key, value, namespace);

      // Assert
      expect(LocalStorage.getContext).toHaveBeenCalledWith(namespace);
      expect(setContextMock).toHaveBeenCalledWith(namespace, {
        ...context,
        [key]: value,
      });
    });
  });

  describe('getContextValue', () => {
    it('should retrieve specific value from context for specified namespace', () => {
      const namespace = ContextNamespace.LOGGER;
      const key = 'key';
      const value = 'some value';
      const context = { [key]: value };
      mockedAsyncLocalStorage.prototype.getStore.mockReturnValueOnce(
        new Map([[namespace, context]]),
      );

      const result = LocalStorage.getContextValue(key, namespace);

      expect(mockedAsyncLocalStorage.prototype.getStore).toHaveBeenCalled();
      expect(result).toEqual(value);
    });

    it('should return undefined if value not found', () => {
      const namespace = ContextNamespace.LOGGER;
      const key = 'key';
      const context = {};
      mockedAsyncLocalStorage.prototype.getStore.mockReturnValueOnce(
        new Map([[namespace, context]]),
      );

      const result = LocalStorage.getContextValue(key, namespace);

      expect(mockedAsyncLocalStorage.prototype.getStore).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
