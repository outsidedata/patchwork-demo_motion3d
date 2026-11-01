// What the X Bot's rig measures of a clip (games/demo_motion3d/assets/xbot.rig.json): its length and
// travel, then frame by frame the lowest toe, the hips and the hands' middle over the root (anim's
// `ends`, in the body's frame) with how fast each goes up or down, then every hand and foot it plants
// and on what (anim's `touches`).
//   node clip.mjs <clip>
import { readFileSync } from 'node:fs'
import path from 'node:path'

const clip = process.argv[2]
if (!clip) throw new Error('clip.mjs <clip>')
const rig = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../assets/xbot.rig.json'), 'utf8'))
const entry = rig.clips[clip]
if (!entry) throw new Error(`no clip ${clip}: ${Object.keys(rig.clips).join(', ')}`)
const source = typeof entry === 'object' && entry.mirror ? entry.mirror : clip
const table = rig.table[source]
console.log(`${clip}${source !== clip ? ` (mirrors ${source})` : ''}: ${JSON.stringify(entry)}`)
console.log(`  ${table.dur} s, forward ${table.forward} m, left ${table.left} m, turn ${table.yaw} degrees`)
const e = rig.ends.xbot[source]
const toe = i => Math.min(e.footL[i][4], e.footR[i][4])
const hands = i => (e.handL[i][1] + e.handR[i][1]) / 2
const speed = (f, i) => (i > 0 ? ((f(i) - f(i - 1)) * e.fps).toFixed(2) : '0.00')
const hips = i => e.torso[i][1]
for (let i = 0; i < e.torso.length; i++) {
  console.log(`  ${(i / e.fps).toFixed(3)} s  lowest toe ${toe(i).toFixed(3)} (${speed(toe, i)} m/s)  hips ${hips(i).toFixed(3)} (${speed(hips, i)} m/s)  hands ${hands(i).toFixed(3)}`)
}
const t = rig.touches.xbot[source]
for (const p of t.plants) console.log(`  plants ${p.point} ${p.from}-${p.to} s on ${p.on}`)
