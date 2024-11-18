import App from './App.svelte'
import { mount } from 'svelte'

const el = document.getElementById('app')

if (el === null) {
  throw Error('element #app not found')
}

const app = mount(App, {
  target: el,
})

export default app
