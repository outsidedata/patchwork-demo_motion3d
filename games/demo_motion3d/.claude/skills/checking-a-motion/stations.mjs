// Runs demo_motion3d's stations on its dev page in Chrome (through the good-webviews helper), each to its
// end without waiting on the page's clock (`dev.runNow`), and prints how each went: its script's result,
// its faults, the worst of each check's measure with when it was, and each hand-back to walking.
//   node stations.mjs <port> [station ...]     every station when none is named
import { execFileSync } from 'node:child_process'

const helper = `${process.env.HOME}/.claude/skills/good-webviews/webview.mjs`
const [port, ...named] = process.argv.slice(2)
if (!port) throw new Error('stations.mjs: give the dev server\'s port')
const web = (...args) => execFileSync('node', ['--experimental-websocket', helper, ...args], { encoding: 'utf8' })
const ask = expr => JSON.parse(JSON.parse(web('eval', expr)))
const wait = ms => new Promise(r => setTimeout(r, ms))
// Asked again while the page is too busy stepping to answer.
async function asked(expr) {
  for (let i = 0; i < 60; i++) {
    try { return ask(expr) } catch { await wait(2000) }
  }
  throw new Error(`the page never answered ${expr}`)
}

web('nav', `http://localhost:${port}/games/demo_motion3d/dev.html`)
let names
for (let i = 0; i < 60 && !names; i++) {
  try { names = ask('JSON.stringify(window.dev ? dev.STATIONS : null)') } catch {}
  if (!names) await wait(1000)
}
if (!names) throw new Error('the dev page never came up')
const unknown = named.filter(n => !names.includes(n))
if (unknown.length) throw new Error(`no station ${unknown.join(', ')}: ${names.join(', ')}`)
for (const name of named.length ? named : names) {
  ask(`window.__r = null; dev.runNow(${JSON.stringify(name)}).then(r => { window.__r = r }, e => { window.__r = { result: 'threw: ' + e.message } }); JSON.stringify('started')`)
  let r = null
  while (!r) {
    await wait(2000)
    r = await asked('JSON.stringify(window.__r)')
  }
  const { from, dt } = await asked('JSON.stringify({ from: dev.current.from, dt: dev.rec.dt })')
  const t = n => `${((n - from) * dt).toFixed(2)} s`
  console.log(`\n${name}: ${r.result}`)
  for (const f of r.faults ?? []) console.log(`  FAULT ${f}`)
  if (!(r.faults ?? []).length) console.log('  no faults')
  for (const [k, w] of Object.entries(r.worst ?? {})) console.log(`  worst ${k} ${w.v.toFixed(3)} at ${t(w.n)}`)
  for (const h of r.handed ?? []) console.log(`  handed back from ${h.from} at ${t(h.n)}, lowest toe ${h.foot.toFixed(3)} m over the ground, ${h.off.toFixed(2)} s off it`)
}
