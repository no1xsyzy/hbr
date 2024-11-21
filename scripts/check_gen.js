import { statSync } from 'fs'

export default function ({ froms, tos }) {
  const latestFrom = Math.max(...froms.map((from) => statSync(from).mtime))
  try {
    const earliestTo = Math.min(...tos.map((to) => statSync(to).mtime))
    return latestFrom > earliestTo
  } catch (e) {
    if (e.code === 'ENOENT') {
      return true
    }
    throw e
  }
}
