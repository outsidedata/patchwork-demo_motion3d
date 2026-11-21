// A training dummy: an X Bot (`as: "xbot"`) that stands where its actor puts it and takes the blows the
// seats' bodies land on it. It is moved by kinematics3d and played and drawn by motion3d as the player's
// body is, by the X Bot's motion3d file, its stick let go; its definition (`assets/demo_motion3d.json`)
// says it draws no weapon (`weapons`, `aimOf`, which the yard's `armed` state reads).
//
// A blow. A `player` row lands one while its clip's `blow` window is open (its `windows`, motion3d's,
// from the rig's markers: just before the clip's strike to just after) and the limb its clip strikes
// with (motion3d's `blowOf`), as the body is drawn this step (`posed`), is within the definition's
// `reach` metres of the dummy's middle across the ground and between its `height` [low, high] metres over
// its feet. One blow lands once a window: `struck` holds `<row id>:<motion>` for each window that has
// landed, until it shuts. A blow queues `hit` in the dummy's buffer (motion3d's `queue`), so it plays its
// hit, and counts on `hits`.
//
// Its own fields, beside kinematics3d's and motion3d's: `stood`, once it stands on the ground under its
// actor's place; `hits`; `struck`.
import type { Kind, Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import { drive, queue } from '#plugins/motion3d/motion3d.sim.ts'
import { blowOf, posed } from '#plugins/motion3d/motion3d.play.ts'
import { nearest } from '#plugins/kinematics3d/kinematics3d.sim.ts'
import { Quaternion, Vector3 } from 'three'

const BONES = { handL: 'LeftHand', handR: 'RightHand', footL: 'LeftFoot', footR: 'RightFoot' } as const

// Where the limb a body's clip strikes with is drawn this step, in the world: its pose (`posed`), in the
// body's frame, tilted by its `tilt`, turned by its yaw and set on its place.
export function blowAt(w: W, body: Row): number[] {
  const d = body.data
  const bone = BONES[blowOf(w, body, d.clip).limb]
  const p = new Vector3().setFromMatrixPosition(posed(w, body).get(bone)!)
  const x = p.z * Math.sin(d.yaw) + p.x * Math.cos(d.yaw), z = p.z * Math.cos(d.yaw) - p.x * Math.sin(d.yaw)
  const v = new Vector3(x, p.y, z)
  if (d.tilt) v.applyQuaternion(new Quaternion(d.tilt[0], d.tilt[1], d.tilt[2], d.tilt[3]))
  return [d.pos[0] + v.x, d.pos[1] + v.y, d.pos[2] + v.z]
}

// Whether a place in the world is within the dummy's reach: near its middle across the ground, and
// between the heights it can be struck at.
function reaches(me: Row, k: any, at: number[]): boolean {
  const [x, y, z] = me.data.pos
  const over = at[1] - y
  return Math.hypot(at[0] - x, at[2] - z) <= k.reach && over >= k.height[0] && over <= k.height[1]
}

export const dummy: Kind = {
  before(me, _dt, w) {
    const d = me.data
    if (d.stood) return
    d.pos = nearest(w, { triangles: {} }, [d.pos[0], 0, d.pos[2]], me)
    d.stood = true
  },
  tick(me, dt, w) {
    const d = me.data
    if (!d.stood) return
    const k = def(w, me.kind)
    d.want = [0, 0]
    d.face = null
    drive(me, w, dt, [0, 0])
    for (const p of w.all('player')) {
      const key = `${p.id}:${p.data.motion}`
      const open = Array.isArray(p.data.windows) && p.data.windows.includes('blow')
      if (!open) {
        d.struck = d.struck.filter((s: string) => !s.startsWith(`${p.id}:`))
        continue
      }
      if (d.struck.includes(key) || !reaches(me, k, blowAt(w, p))) continue
      d.struck = [...d.struck, key]
      d.hits++
      queue(me, w, 'hit')
    }
  },
}
