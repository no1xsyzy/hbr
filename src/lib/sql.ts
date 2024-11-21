import initSqlJS from 'sql.js'
import type { Database } from 'sql.js'
// import dataSql from '../../data_gen/hbr.sql?raw'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import dataDump from '../../data_gen/hbr.sql.sqlJsDump?uint8array'

export type { Database }

const SQL = await initSqlJS({
  locateFile: () => sqlWasmUrl,
})

let db: Database | null = null

export function createDatabase(): Database {
  if (db === null) {
    db = new SQL.Database(dataDump)
    // db = new SQL.Database()
    // db.run(dataSql)
  }
  return db
}
