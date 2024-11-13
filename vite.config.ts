import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { ViteToml } from 'vite-plugin-toml'

export default defineConfig({
  base: '',
  plugins: [svelte(), ViteToml()],
})
