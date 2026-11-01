// Close-up screenshots of moments of one station's run on demo_motion3d's dev page: the page loaded
// fresh, the station run once, then for each moment the run held at `seconds` into it, the camera close
// on a part of the body (feet, hands, hips, head), what is expected there and what was measured written
// across the top, and the screenshot saved as `<out>-<n>.png`, n counting the moments from 1. A part may
// name the camera's way round the body, `hands@120`: degrees from the way it faces, to its left; without
// it, each part has its own view (the dev page's `focus`).
//   node look.mjs <port> "<station>" <out> <seconds> <part> "<what is expected>" [<seconds> <part> "<expected>" ...]
import { execFileSync } from 'node:child_process'

const helper = `${process.env.HOME}/.claude/skills/good-webviews/webview.mjs`
const [port, station, out, ...rest] = process.argv.slice(2)
if (!out || rest.length < 3 || rest.length % 3) throw new Error('look.mjs <port> "<station>" <out> <seconds> <part> "<what is expected>" [...]')
const web = (...args) => execFileSync('node', ['--experimental-websocket', helper, ...args], { encoding: 'utf8' })
const ask = expr => JSON.parse(JSON.parse(web('eval', expr)))
const wait = ms => new Promise(r => setTimeout(r, ms))
async function asked(expr) {
  for (let i = 0; i < 60; i++) {
    try { return ask(expr) } catch { await wait(2000) }
  }
  throw new Error(`the page never answered ${expr}`)
}
// Starts `call` on the page and waits for the promise it hands back.
async function done(call) {
  ask(`window.__r = null; ${call}.then(r => { window.__r = r ?? { done: true } }, e => { window.__r = { error: e.message } }); JSON.stringify('started')`)
  let r = null
  while (!r) {
    await wait(1000)
    r = await asked('JSON.stringify(window.__r)')
  }
  if (r.error) throw new Error(r.error)
  return r
}

web('nav', `http://localhost:${port}/games/demo_motion3d/dev.html`)
let up = false
for (let i = 0; i < 60 && !up; i++) {
  try { up = ask('JSON.stringify(!!window.dev)') } catch {}
  if (!up) await wait(1000)
}
if (!up) throw new Error('the dev page never came up')
const r = await done(`dev.runNow(${JSON.stringify(station)})`)
console.log(`${station}: ${r.result}`)
for (let i = 0; i < rest.length; i += 3) {
  const [seconds, view, expect] = rest.slice(i, i + 3)
  const [part, around] = view.split('@')
  await done(`dev.focus(${Number(seconds)}, ${JSON.stringify(part)}, ${JSON.stringify(expect)}${around === undefined ? '' : `, ${Number(around)}`})`)
  const file = `${out}-${i / 3 + 1}.png`
  web('shot', file)
  console.log(`${file}: ${ask('JSON.stringify(document.getElementById("caption").textContent)').replaceAll('\n', ' | ')}`)
}
