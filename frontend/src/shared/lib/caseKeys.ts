// Converts object keys between the API's snake_case and the app's camelCase, deeply.
// Types follow the conversion, so `Camelize<{ phone_e164: string }>` is `{ phoneE164: string }`.

type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S

type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? `${Head extends Lowercase<Head> ? Head : `_${Lowercase<Head>}`}${SnakeCase<Tail>}`
  : S

export type Camelize<T> = T extends readonly (infer Item)[]
  ? Camelize<Item>[]
  : T extends object
    ? { [K in keyof T as K extends string ? CamelCase<K> : K]: Camelize<T[K]> }
    : T

export type Snakeize<T> = T extends readonly (infer Item)[]
  ? Snakeize<Item>[]
  : T extends object
    ? { [K in keyof T as K extends string ? SnakeCase<K> : K]: Snakeize<T[K]> }
    : T

function camelCaseKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase())
}

function snakeCaseKey(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function convertKeys(value: unknown, convertKey: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => convertKeys(item, convertKey))
  if (!isPlainObject(value)) return value
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [convertKey(key), convertKeys(item, convertKey)]),
  )
}

export function camelizeKeys<T>(value: T): Camelize<T> {
  return convertKeys(value, camelCaseKey) as Camelize<T>
}

export function snakeizeKeys<T>(value: T): Snakeize<T> {
  return convertKeys(value, snakeCaseKey) as Snakeize<T>
}
