import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync } from 'fs'
import check_gen from './check_gen.js'

const SQL = await initSqlJs({})
const fromfile = './data_gen/hbr.sql'
const tofile = './data_gen/hbr.sql.sqlJsDump'
if (check_gen({ froms: [fromfile], tos: [tofile] })) {
  const sqlstr = readFileSync(fromfile, 'utf-8')

  const db = new SQL.Database()
  db.run(sqlstr)

  writeFileSync(tofile, db.export())
}
