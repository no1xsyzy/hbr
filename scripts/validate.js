const CHECKS = [
  ['SkillList', 'data_hbr/skills.json', []],
  ['StyleList', 'data_hbr/styles.json', []],
  ['ScoreAttackList', 'data_hbr/score_attack.json', []],
]

/* global console */
import { resolve } from 'path'
import { readFileSync } from 'fs'
import * as TJS from 'typescript-json-schema'
import { Validator } from 'jsonschema'
/**
 * @type {TJS.PartialArgs}
 */
const settings = {
  required: true,
}

/**
 * @type {TJS.CompilerOptions}
 */
const compilerOptions = {
  strictNullChecks: true,
}

const program = TJS.getProgramFromFiles([resolve('src/lib/types.ts')], compilerOptions)

const generator = TJS.buildGenerator(program, settings)

function main() {
  for (const [symbol, datafn, path] of CHECKS) {
    console.log(`checking ${datafn} / path=${JSON.stringify(path)} against ${symbol}`)
    const schema = TJS.generateSchema(program, symbol, settings, [], generator)
    let pivot = JSON.parse(readFileSync(datafn, 'utf-8'))
    for (const p of path) {
      pivot = pivot[p]
    }
    const v = new Validator()
    const result = v.validate(pivot, schema)
    if (result.errors.length > 0) {
      console.error('error0:', result.errors[0])
      return
    }
  }
  console.log('all clear')
}

main()
