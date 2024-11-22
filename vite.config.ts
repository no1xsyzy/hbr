import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { ViteToml } from 'vite-plugin-toml'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'

const hexLoader: Plugin = {
  name: 'hex-loader',
  transform(code, id) {
    const [path, query] = id.split('?')
    if (query != 'uint8array') return null

    const data = readFileSync(path)
    const hex = data.toString('hex')

    return `
    const fromHexString = (hexString) =>
      Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

    export default fromHexString('${hex}');`
  },
}

export default defineConfig({
  base: '',
  plugins: [hexLoader, svelte(), ViteToml()],
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
})
