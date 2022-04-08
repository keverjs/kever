type Listener<T> = (instance: T) => void

export class Container<K, T> {
  private pool = new Map<K, T>()
  private listeners = new Map<K, Set<Listener<T>>>()

  public bind(key: K, instance: T): boolean {
    if (this.pool.has(key)) {
      return false
    }
    this.pool.set(key, instance)
    this.trigger(key)
    return true
  }

  public unbind(key: K): boolean | T {
    const instance = this.pool.get(key)
    if (instance) {
      this.pool.delete(key)
      return instance
    }
    return true
  }

  public use(key: K): boolean | T {
    const instance = this.pool.get(key)
    if (instance) {
      return instance
    }
    return false
  }

  public getPool(): Map<K, T> {
    return this.pool
  }

  public on(key: K, listener: Listener<T>) {
    let listeners: Set<Listener<T>>
    const value = this.use(key)
    if (value && typeof value !== 'boolean') {
      listener(value)
    } else {
      const pool = this.listeners.get(key)
      if (pool) {
        listeners = pool
      } else {
        listeners = new Set<Listener<T>>()
      }
      listeners.add(listener)
      this.listeners.set(key, listeners)
    }
  }

  public off(key: K, listener: Listener<T>): boolean {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.delete(listener)
      this.listeners.set(key, listeners)
    }
    return false
  }

  public trigger(key: K) {
    const instance = this.pool.get(key)
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach((listener) => {
        listener(instance as T)
      })
      listeners.clear()
    }
  }
}
