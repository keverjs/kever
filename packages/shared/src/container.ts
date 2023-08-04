type Listener<T> = (value: T) => void

export class Container<K, T> {
  private pool = new Map<K, T>()
  private listeners = new Map<K, Set<Listener<T>>>()

  public bind(key: K, value: T): boolean {
    this.pool.set(key, value)
    this.trigger(key)
    return true
  }

  public unbind(key: K): boolean | T {
    const value = this.pool.get(key)
    if (value) {
      this.pool.delete(key)
      return value
    }
    return true
  }

  public use(key: K): boolean | T {
    const value = this.pool.get(key)
    if (value) {
      return value
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
      listeners = pool || new Set<Listener<T>>()
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
    const value = this.pool.get(key)
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach((listener) => {
        listener(value as T)
      })
      listeners.clear()
    }
  }
}
