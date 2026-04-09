import neo4j, { type Driver } from 'neo4j-driver'

const URI = 'neo4j://127.0.0.1:7687'
const USER = 'neo4j'
const PASSWORD = 'neo4jneo4j'
const DB = 'neo4j'

let driver: Driver | null = null

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
  }
  return driver
}

function toNative(val: unknown): unknown {
  if (val === null || val === undefined) return val
  if (neo4j.isInt(val)) return val.toNumber()
  if (neo4j.isDate(val) || neo4j.isDateTime(val) || neo4j.isLocalDateTime(val) || neo4j.isLocalTime(val) || neo4j.isTime(val) || neo4j.isDuration(val))
    return val.toString()
  if (Array.isArray(val)) return val.map(toNative)
  if (typeof val === 'object') {
    const obj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      obj[k] = toNative(v)
    }
    return obj
  }
  return val
}

export async function runQuery<T = Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getDriver().session({ database: DB })
  try {
    const result = await session.run(query, params)
    return result.records.map((r) => toNative(r.toObject()) as T)
  } finally {
    await session.close()
  }
}

export async function runWrite(
  query: string,
  params: Record<string, unknown> = {}
): Promise<void> {
  const session = getDriver().session({ database: DB })
  try {
    await session.run(query, params)
  } finally {
    await session.close()
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close()
    driver = null
  }
}
