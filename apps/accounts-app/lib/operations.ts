export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function buildRef(prefix: string) {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)
  const rand = Math.floor(Math.random() * 900 + 100)
  return `${prefix}-${stamp}-${rand}`
}

export function saveLocalRecord<T extends Record<string, unknown>>(key: string, record: T) {
  if (typeof window === "undefined") return
  const existing = window.localStorage.getItem(key)
  const list = existing ? (JSON.parse(existing) as T[]) : []
  list.unshift(record)
  window.localStorage.setItem(key, JSON.stringify(list))
}
