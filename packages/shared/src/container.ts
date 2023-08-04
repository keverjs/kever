type Listener<T> = (value: T) => void

export class Container<K, V> {
  private pool = new Map<K, V>()
  private listeners = new Map<K, Set<Listener<V>>>()

  public bind(key: K, value: V): boolean {
    this.pool.set(key, value)
    this.trigger(key)
    return true
  }
  public unbind(key: K): boolean | V {
    const value = this.pool.get(key)
    if (value) {
      this.pool.delete(key)
      return value
    }
    return true
  }
  public has(key: K): boolean {
    return this.pool.has(key)
  }
  public use(key: K): boolean | V {
    const value = this.pool.get(key)
    if (value) {
      return value
    }
    return false
  }

  public getPool(): Map<K, V> {
    return this.pool
  }

  public on(key: K, listener: Listener<V>) {
    let listeners: Set<Listener<V>>
    const value = this.use(key)
    if (value && typeof value !== 'boolean') {
      listener(value)
    } else {
      const pool = this.listeners.get(key)
      listeners = pool || new Set<Listener<V>>()
      listeners.add(listener)
      this.listeners.set(key, listeners)
    }
  }

  public off(key: K, listener: Listener<V>): boolean {
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
        listener(value as V)
      })
      listeners.clear()
    }
  }
}
