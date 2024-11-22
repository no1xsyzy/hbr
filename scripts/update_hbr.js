/* global console */

import { existsSync, readFileSync, writeFileSync, mkdirSync, createWriteStream } from 'fs'
import { access } from 'fs/promises'
import { join } from 'path'
import axios from 'axios'

const UPDATE_FILES = [
  { file: 'characters.json', images: ['image', 'w_image'] },
  { file: 'styles.json', images: ['image', 'strip', 'bg'] },
  { file: 'skills.json', images: [] },
  { file: 'passives.json', images: [] },
  { file: 'items.json', images: [] },
  { file: 'boosters.json', images: [] },
  { file: 'chips.json', images: [] },
  { file: 'accessories.json', images: [] },
  { file: 'enemies.json', images: [] },
  { file: 'battles.json', images: [] },
  { file: 'score_attack.json', images: [] },
  { file: 'events.json', images: ['logo', 'image'] },
  { file: 'latest.json', images: [] },
  { file: 'masterSkills.json', images: [] },
]

const IMG_HOST = 'https://www.hbr.quest/hbr'
const IMG_LOCAL = join(import.meta.dirname, '../public/hbr')

const DATA_HOST = 'https://master.hbr.quest'
const DATA_LOCAL = join(import.meta.dirname, '../data_hbr')
const LAST_MODIFIED_FILE = join(DATA_LOCAL, '_last_modified.json')

console.log(IMG_LOCAL, DATA_LOCAL)

async function readLastModified() {
  if (existsSync(LAST_MODIFIED_FILE)) {
    return JSON.parse(readFileSync(LAST_MODIFIED_FILE, 'utf-8'))
  }

  return {}
}

async function writeLastModified(d) {
  writeFileSync(LAST_MODIFIED_FILE, JSON.stringify(d, null, 2), 'utf-8')
}

async function main() {
  mkdirSync(DATA_LOCAL, { recursive: true })

  let lastModified = await readLastModified()
  let modified = false

  for (const { file, images } of UPDATE_FILES) {
    const headers = {}
    if (lastModified[file]) {
      headers['If-Modified-Since'] = lastModified[file]
    }
    let response
    try {
      response = await axios.get(`${DATA_HOST}/${file}`, {
        headers,
        responseType: 'json',
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 304
        },
      })
    } catch (error) {
      console.error(`Error: ${error.message}`)
      throw error
    }
    try {
      let data
      const fileTarget = join(DATA_LOCAL, file)
      if (response.status !== 304) {
        lastModified[file] = response.headers['last-modified']
        modified = true
        writeFileSync(fileTarget, JSON.stringify((data = response.data), null, 2), 'utf-8')
      } else {
        data = JSON.parse(readFileSync(fileTarget, 'utf-8'))
      }

      await Promise.all(
        data.flatMap((datum) =>
          images.flatMap(async (imgType) => {
            let source = datum?.[imgType] ?? ''
            if (source === '') return []

            source = `${IMG_HOST}/${datum[imgType]}`
            const target = join(IMG_LOCAL, datum[imgType])
            try {
              await access(target)
              return [] // file exists, skip
            } catch {
              // file not exists, fetch
            }

            console.log(`according to ${file}, fetching ${datum.label} ${imgType} '${source}`)
            const response = await axios({
              method: 'get',
              url: source,
              responseType: 'stream',
            })

            /** @type {WriteStream} */
            const piper = response.data.pipe(createWriteStream(target))
            return new Promise((resolve, reject) => {
              piper.on('finish', () => {
                resolve(true)
              })
              piper.on('error', () => {
                reject()
              })
            })
          }),
        ),
      )

      // for (const image of images) {
      //   try {
      //     let response = await axios.get(`${IMAGE_PREFIX}/${response.data[image]}`, { responseType: 'stream' })
      //     response.data.pipe(createWriteStream(`${HBR_IMG}/${response.data[image]}`))
      //   } catch (error) {
      //     console.error(`Error: ${error.message}`)
      //     continue
      //   }
      // }
    } catch (error) {
      if (response !== undefined) {
        console.error(`Error: ${error}`)
      }
      throw error
    }
  }

  if (modified) {
    await writeLastModified(lastModified)
  }
}

main().catch(console.error)
