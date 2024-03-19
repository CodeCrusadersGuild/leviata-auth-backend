import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from '../enums/context-namespaces';

export class LocalStorage {
  private static storage = new AsyncLocalStorage<
    Map<ContextNamespace, object>
  >();

  static async runInContext<T>(
    namespace: ContextNamespace,
    callback: () => T,
  ): Promise<T> {
    const state = new Map<ContextNamespace, object>();
    state.set(namespace, { id: uuid() });
    return this.storage.run(state, callback);
  }

  static setContext(namespace: ContextNamespace, context: object): void {
    const store = this.storage.getStore();
    if (!store) return;
    store.set(namespace, context);
  }

  static getContext(namespace: ContextNamespace): object {
    const store = this.storage.getStore();
    if (!store) return {};
    return store.get(namespace) || {};
  }

  static setContextValue(
    key: string,
    value: unknown,
    namespace: ContextNamespace,
  ): void {
    const context = this.getContext(namespace);
    context[key] = value;
    this.setContext(namespace, context);
  }

  static getContextValue(key: string, namespace: ContextNamespace): unknown {
    const context = this.getContext(namespace);
    return context[key];
  }
}
