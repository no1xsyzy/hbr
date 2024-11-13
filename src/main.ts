import App from './App.svelte'

const el = document.getElementById('app')

if (el === null) {
  throw Error('element #app not found')
}

const app = new App({
  target: el,
})

export default app
