import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from '../enums/context-namespaces';

@Injectable()
export class LocalStorageService {
  private storage = new AsyncLocalStorage<Map<ContextNamespace, object>>();

  /**
   * Executes the provided callback function within the context of the specified namespace.
   * Generates a unique identifier for the context and runs the callback within it.
   * @param namespace The namespace of the context to execute the callback within.
   * @param callback The callback function to execute within the context.
   * @returns The result of executing the callback function.
   */
  async runInContext<T>(
    namespace: ContextNamespace,
    callback: () => T,
  ): Promise<T> {
    const state = new Map<ContextNamespace, object>();
    state.set(namespace, { id: uuid() });
    return this.storage.run(state, callback);
  }

  /**
   * Sets the context of the specified namespace with the provided context object.
   * @param namespace The namespace of the context to set.
   * @param context The context object to set.
   */
  setContext(namespace: ContextNamespace, context: object): void {
    const store = this.storage.getStore();
    if (!store) return;
    store.set(namespace, context);
  }

  /**
   * Retrieves the context of the specified namespace.
   * @param namespace The namespace of the context to retrieve.
   * @returns The context object for the specified namespace, or an empty object if not found.
   */
  getContext(namespace: ContextNamespace): object {
    const store = this.storage.getStore();
    if (!store) return {};
    return store.get(namespace) || {};
  }

  /**
   * Sets a value within the context of the specified namespace and key.
   * @param key The key of the value to set.
   * @param value The value to set.
   * @param namespace The namespace of the context to set the value within.
   */
  setContextValue(
    key: string,
    value: unknown,
    namespace: ContextNamespace,
  ): void {
    const context = this.getContext(namespace);
    context[key] = value;
    this.setContext(namespace, context);
  }

  /**
   * Retrieves the value from the context of the specified namespace and key.
   * @param key The key of the value to retrieve.
   * @param namespace The namespace of the context to retrieve the value from.
   * @returns The value for the specified key within the specified namespace, or undefined if not found.
   */
  getContextValue(key: string, namespace: ContextNamespace): unknown {
    const context = this.getContext(namespace);
    return context[key];
  }
}
