import initSqlJS from 'sql.js'
import type { Database } from 'sql.js'
import sqlstr from '../../data_gen/hbr.sql?raw'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let db: Database | null = null

console.log('sqlWasmUrl', sqlWasmUrl)

export async function createDatabase(): Promise<Database> {
  const SQL = await initSqlJS({
    locateFile: () => sqlWasmUrl,
  })

  // new SQL.Database(currentData as Uint8Array)

  if (db === null) db = new SQL.Database()
  db.run(sqlstr)
  return db
}
