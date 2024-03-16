import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from './enums/context-namespaces';

@Injectable()
export class LocalStorageLoggerService {
  private storage = new AsyncLocalStorage<Map<ContextNamespace, object>>();

  /**
   * Executes the provided callback function within the context of the logger.
   * Generates a unique identifier for the logger context and runs the callback within it.
   * @param callback The callback function to execute within the logger context.
   * @returns The result of executing the callback function.
   */
  async runInLoggerContext<T>(callback: () => T): Promise<T> {
    const state = new Map<ContextNamespace, object>();
    state.set(ContextNamespace.LOGGER, { id: uuid() });
    return this.storage.run(state, callback);
  }

  /**
   * Sets the context of the logger with the provided context object.
   * @param namespace The namespace of the context to set.
   * @param context The context object to set.
   */
  setLoggerContext(namespace: ContextNamespace, context: object): void {
    const store = this.storage.getStore();
    if (!store) return;
    store.set(namespace, context);
  }

  /**
   * Retrieves the context of the logger for the specified namespace.
   * @param namespace The namespace of the context to retrieve.
   * @returns The context object for the specified namespace, or an empty object if not found.
   */
  getLoggerContext(namespace: ContextNamespace): object {
    const store = this.storage.getStore();
    if (!store) return {};
    return store.get(namespace) || {};
  }

  /**
   * Sets a value within the context of the logger for the specified namespace and key.
   * @param key The key of the value to set.
   * @param value The value to set.
   * @param namespace The namespace of the context to set the value within.
   */
  setLoggerContextValue(
    key: string,
    value: unknown,
    namespace: ContextNamespace,
  ): void {
    const context = this.getLoggerContext(namespace);
    context[key] = value;
    this.setLoggerContext(namespace, context);
  }

  /**
   * Retrieves the value from the context of the logger for the specified namespace and key.
   * @param key The key of the value to retrieve.
   * @param namespace The namespace of the context to retrieve the value from.
   * @returns The value for the specified key within the specified namespace, or undefined if not found.
   */
  getLoggerContextValue(key: string, namespace: ContextNamespace): unknown {
    const context = this.getLoggerContext(namespace);
    return context[key];
  }
}
