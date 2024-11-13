/* global console */

import { readFileSync, existsSync, mkdirSync, writeFileSync, createWriteStream } from 'fs'
import { access } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'
import axios from 'axios'

const BILI_IMG = './public/bili'
const DATA_BILI = './data_bili'
const DATA_HBR = './data_hbr'
const SESSDATA = './sessdata.json'

const styles = JSON.parse(readFileSync(join(DATA_HBR, 'styles.json'), 'utf-8'))
const cookies = JSON.parse(readFileSync(SESSDATA, 'utf-8'))
const SIGNATURE_DATA = {
  secret: 'xiJTak0MqWZiEGiW1HLqrB1FCZ6WJ1kWPq2L0sJMGBGrd4yO',
  appKey: 'z1oxt4wn7fi3qbsn438ukl00r2b701m3',
}

const randomDigits = (n) => {
  // 产生一个 `n` 个十进制位的数
  n = +n || 5
  let t = ''
  for (; n--; ) t += Math.floor(10 * Math.random())
  return t
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN',
  Origin: 'https://game.bilibili.com',
  Referer: 'https://game.bilibili.com/',
  Cookie: `SESSDATA=${cookies['SESSDATA']}`,
}

const signParam = (data) => {
  data = {
    ...data,
    ts: String(Date.now()),
    nonce: randomDigits(16),
    appkey: SIGNATURE_DATA.appKey,
  }

  let h = Object.keys(data)
    .sort()
    .filter((key) => data[key])
    .map((key) => key + '=' + data[key])
    .join('&')
  h = h + '&secret=' + SIGNATURE_DATA.secret
  data.sign = createHash('md5').update(h).digest('hex')

  return data
}

const getRoleDetail = async (role_id) => {
  role_id = '' + role_id
  const jsonData = signParam({ role_id })
  const response = await axios.post('https://api.game.bilibili.com/game/player/tools/fever/role/detail', jsonData, {
    headers,
  })
  const result = response.data

  if (result.code !== 0) {
    throw new Error(result.message)
  }
  return result.data
}

const getRoleList = async () => {
  const params = signParam({})
  const response = await axios.post('https://api.game.bilibili.com/game/player/tools/fever/role/list', params, {
    headers,
  })
  const result = response.data

  if (result.code !== 0) {
    throw new Error(result.message)
  }
  return result.data
}

const updateBili = async () => {
  const encoding = 'utf-8'

  for (let path of [DATA_BILI, BILI_IMG]) {
    mkdirSync(path, { recursive: true })
  }

  const roleList = await getRoleList()
  writeFileSync(`${DATA_BILI}/role_list.json`, JSON.stringify(roleList, null, 2), {
    encoding,
  })

  const filePath = `${DATA_BILI}/role_details.json`

  let details = {}
  let edited = false

  if (existsSync(filePath)) {
    details = JSON.parse(readFileSync(filePath, { encoding }))
  }

  for (const style of styles.sort(
    // 有些角色尚未实装、不存在于 roleList 但已经可以从官方的入队培训手册中通过 style.id 强行读取
    // 所以使用日服数据站的数据来过量读取
    (a, b) => new Date(a.in_date).getTime() - new Date(b.in_date).getTime(), // 按时间正排，读到第一个不能读的为止
  )) {
    if (details[style.label] !== undefined) continue // 跳过已经抓取过的

    try {
      const roleDetail = await getRoleDetail(style.id)
      details[style.label] = roleDetail
      edited = true
    } catch (error) {
      if (error.message === '请求错误') {
        // 查找 roleList 判断为未实装的风格则正常跳出（此时已超量读取）
        // 这个查找只会发生一次，找到报错，找不到正常跳出，无需优化
        if (roleList.role_list.find((role) => role.role_id === style.id) === undefined) break
      }
      throw error
    }
  }

  if (edited) writeFileSync(filePath, JSON.stringify(details, null, 2), { encoding })

  for (const role in details) {
    const roleDetail = details[role]
    await Promise.all(
      ['box_icon', 'icon', 'strip_image'].map(async (imgType) => {
        const source = roleDetail?.[imgType] ?? ''
        const target = join(BILI_IMG, `${role}.${imgType}.png`)
        if (!source.startsWith('https://')) return // not url, skip
        try {
          await access(target)
          return // file exists, skip
        } catch {
          // file not exists, fetch
          /* empty */
        }

        console.log(`fetching ${role} ${imgType}`)
        const response = await axios({
          method: 'get',
          url: source,
          responseType: 'stream',
        })
        response.data.pipe(createWriteStream(target))
      }),
    )
  }
}

const main = async () => {
  await updateBili()
}

main().catch(console.error)
