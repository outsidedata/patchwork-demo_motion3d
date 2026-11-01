// jumppad: demo_motion3d's own plugin, the yard's jump pads. `world.jumppad.pads` lists them, each `{ pos,
// yaw, velocity }`: where its mat lies, the way it faces, and the speed it throws a body at, [x, y, z]
// metres a second in the world. Its row, `jumppad`, makes each pad once, a row of shapes3d's `pad`
// kind (a mat offering motion3d the `jumppad` activity) carrying that pad's numbers.
//
// `pads(me, w)`, which the player rule calls each step after motion3d's drive, diffs the two answers
// motion3d keeps on the body's row: a pad in `lookAround` and not in `previousLookAround` is one the body
// has just come onto, and it presses `jumppad` to motion3d, which plays the activity's `launch`. Its
// behavior, `launch`, is this plugin's, delivered to kinematics3d (`jumppad.kinematics3d.ts`). A body
// standing on is held by the pad in both answers, so a pad throws it once each time it comes onto it.
import type { Kind, Row, W } from '#engine/engine.ts'
import { press, type Space } from '#plugins/motion3d/motion3d.sim.ts'

type Pad = { pos: number[]; yaw: number; velocity: number[] }

export const jumppad: Kind = {
  before(me, _dt, w) {
    if (me.data.made) return
    for (const p of w.world.jumppad.pads as Pad[]) w.spawn('pad', { pos: p.pos, yaw: p.yaw, velocity: p.velocity })
    me.data.made = true
  },
}

export function pads(me: Row, w: W) {
  const d = me.data
  const before: Space[] = d.previousLookAround
  for (const s of d.lookAround as Space[]) {
    if (!s.activities.includes('jumppad') || before.some(b => b.id === s.id)) continue
    press(me, w, 'jumppad', d.stick)
  }
}
