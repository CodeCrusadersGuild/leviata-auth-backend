import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from '../../enums/context-namespaces';

/**
 * Utility class for managing context-specific data using AsyncLocalStorage.
 */
export class LocalStorage {
  private static storage = new AsyncLocalStorage<
    Map<ContextNamespace, object>
  >();

  /**
   * Runs the provided callback function in a context specific to the given namespace.
   * @param namespace The namespace for the context.
   * @param callback The callback function to be executed.
   * @returns A Promise resolving to the result of the callback function.
   */
  static async runInContext<T>(
    namespace: ContextNamespace,
    callback: () => T,
  ): Promise<T> {
    const state = new Map<ContextNamespace, object>();
    state.set(namespace, { id: uuid() });
    return this.storage.run(state, callback);
  }

  /**
   * Sets the context for the specified namespace.
   * @param namespace The namespace for the context.
   * @param context The context object to be set.
   */
  static setContext(namespace: ContextNamespace, context: object): void {
    const store = this.storage.getStore();
    if (!store) return;
    store.set(namespace, context);
  }

  /**
   * Retrieves the context for the specified namespace.
   * @param namespace The namespace for the context.
   * @returns The context object associated with the namespace, or an empty object if not found.
   */
  static getContext(namespace: ContextNamespace): object {
    const store = this.storage.getStore();
    if (!store) return {};
    return store.get(namespace) || {};
  }

  /**
   * Sets a specific value within the context for the specified namespace.
   * @param key The key for the value to be set.
   * @param value The value to be set.
   * @param namespace The namespace for the context.
   */
  static setContextValue(
    key: string,
    value: unknown,
    namespace: ContextNamespace,
  ): void {
    const context = this.getContext(namespace);
    context[key] = value;
    this.setContext(namespace, context);
  }

  /**
   * Retrieves a specific value from the context for the specified namespace.
   * @param key The key for the value to be retrieved.
   * @param namespace The namespace for the context.
   * @returns The value associated with the key within the context, or undefined if not found.
   */
  static getContextValue(key: string, namespace: ContextNamespace): unknown {
    const context = this.getContext(namespace);
    return context[key];
  }
}
