// The row one seat possesses, and the body it plays: an X Bot (`as: "xbot"`) moved by kinematics3d
// (`world.kinematics3d.kinds.xbot`) and played and drawn by motion3d (`world.motion3d.kinds.xbot`), every
// move it makes the X Bot's motion3d file's (`assets/xbot.motion3d.json`). Every seat is sent every
// `player` row. Its own fields, beside kinematics3d's and motion3d's: `stick` [x, z], the keys' way,
// right and forward; `fast`, the run key held; `guard`, the guard key held; `look` `{ yaw, pitch, dist }`,
// chasecamera3d's orbit about it, `lift` metres over its feet; `turning` [x, y], how far a gamepad's right
// stick is pushed right and down; `aim`, the way the camera looks, which motion3d points a carried prop
// along while an aim is up; `weapon`, the stance the draw key draws, one of the definition's `weapons`;
// `target`, the middle of the nearest dummy within the definition's `lock` metres, or null, which
// motion3d bends an attack onto (its Warp); and `stood`, once it stands on its slot's start.
//
// Facing. With an aim up (the upper half playing one of the definition's `aimOf`, each weapon's aim by
// its name) the legs keep the way
// they face and strafe, turned only when the look is more than its rig's `aim.across` (radians) to either
// side of them; the aim's pitch is held within the rig's `aim.up` and `aim.down`. With the guard key held
// the body faces the way the camera looks and strafes, its stance's guard moves (`guard`, the yard's
// state). Else it turns the way it goes.
//
// The keys. Each key pressed is held in motion3d's input buffer (`queue`; the X Bot's motion3d file's
// `buffer`): a light pressed during a light plays the next of its chain once the first has struck, and a
// roll pressed during one cuts it short once it may. The guard key is held, not pressed: each step it is
// held `guard` is pressed and each step it is not, `unguard`, so a block or an aim comes up whenever it
// may and goes down when it is let go.
//
// The draw key draws `weapon` (`draw.<weapon>` to motion3d), and puts it away while it is drawn. The
// switch key, with no weapon in the hands nor one being drawn or put away (the upper half's move carries
// none of `weapons`), makes the next of `weapons` the one the draw key draws; else it is queued to
// motion3d (the drawn one put away and the next drawn), held in the buffer while a draw plays out, and
// `weapon` follows. Whichever weapon's stance is up is `weapon`.
//
// `before` stands it once on the ground at its slot's start, facing the start's `yaw`, its look along
// it. Each step its look turns while `turning` is held, at the definition's `camera.turn` across and
// `tilt` up and down a second at full push, the yaw less for a push right and the pitch more for a push
// down, within `minPitch` and `maxPitch`. The stick is its want: kinematics3d's `want`, the way the stick
// points from the camera's yaw, as hard as it is pushed (the clip it plays says how fast); and
// motion3d's `drive`, which moves and plays the body by it.
//
// The acts are the page's keys: `stick(x, y)` (y down, as a stick reads), `turn(x, y)` (the right
// stick, the same), `fast(v)`, `guard(v)` and `jumping(v)` (1 held, 0 let go; `jumping` is the jump key,
// motion3d's `jumpHeld`, so a jump let go of as it rises is cut short), `press(key)`, a key pressed,
// played as above; `look(dyaw, dpitch)` and `zoom(by)`, the wheel's pixels. A seat's message arrives from
// outside the program, so each refuses arguments of the wrong kind and writes nothing.
import type { Kind, Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import * as math from '#plugins/math/math.sim.ts'
import { activityOf, drive, motionOf, press, queue } from '#plugins/motion3d/motion3d.sim.ts'
import { playKind, rigOf } from '#plugins/motion3d/motion3d.play.ts'
import { nearest, relative } from '#plugins/kinematics3d/kinematics3d.sim.ts'
import { pads } from './plugins/jumppad/jumppad.sim.ts'

const wrap = (a: number) => a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const finite = (...v: unknown[]) => v.every(x => typeof x === 'number' && Number.isFinite(x))
const way = (v: unknown) => typeof v === 'number' && Math.abs(v) <= 1

// The view turns while the right stick is held, whatever the body does.
function view(me: Row, dt: number, k: any) {
  const d = me.data
  if (d.turning[0] === 0 && d.turning[1] === 0) return
  const c = k.camera
  d.look = { ...d.look, yaw: wrap(d.look.yaw - d.turning[0] * c.turn * dt), pitch: clamp(d.look.pitch + d.turning[1] * c.tilt * dt, c.minPitch, c.maxPitch) }
}

// The body stood once on the ground at its slot's start, facing the start's yaw, its look along it.
function stood(me: Row, w: W) {
  const d = me.data
  const start = w.find('start', s => s.data.slot === d.seat).data
  const [x, z] = start.pos
  // The triangles beneath feet set at the land's level, then stood on them.
  d.pos = nearest(w, { triangles: {} }, [x, 0, z], me)
  d.yaw = start.yaw
  d.look = { ...d.look, yaw: start.yaw }
  d.stood = true
}

// A key pressed (The keys, the header): the switch key with nothing drawn picks the next weapon; the draw
// key queues the drawing or putting away of `weapon`; any other key is queued to motion3d as it is.
function act(me: Row, w: W, key: string, k: any) {
  const d = me.data
  const weapons: string[] = k.weapons
  if (key === 'switch') {
    // No weapon in the hands, nor one being drawn or put away (the upper half's move carries none).
    const up = d.upperActivity == null ? undefined : motionOf(activityOf(w, me, d.upperActivity), d.upperMotion)
    if (!weapons.includes(up?.carry ?? '')) {
      d.weapon = weapons[(weapons.indexOf(d.weapon) + 1) % weapons.length]
      return
    }
  }
  queue(me, w, key === 'draw' ? `draw.${d.weapon}` : key)
}

// The weapon whose stance is up, its own or its aim's: `weapons[i]` is aimed by `aims` where one names
// it (`aimOf`); none while no stance is up.
function stanceOf(me: Row, k: any): string | undefined {
  const u = me.data.upperMotion
  if (k.weapons.includes(u)) return u
  return Object.entries(k.aimOf as Record<string, string>).find(([, aim]) => aim === u)?.[0]
}

// The middle of the nearest dummy within `lock` metres across the ground, at its feet, or null.
function targetOf(me: Row, w: W, lock: number): number[] | null {
  const [x, , z] = me.data.pos
  let best: number[] | null = null, most = lock
  for (const t of w.all('dummy')) {
    const far = Math.hypot(t.data.pos[0] - x, t.data.pos[2] - z)
    if (far <= most) { most = far; best = [...t.data.pos] }
  }
  return best
}

export const player: Kind = {
  before(me, _dt, w) {
    if (!me.data.stood) stood(me, w)
  },
  tick(me, dt, w) {
    const d = me.data
    if (!d.stood) return
    const k = def(w, me.kind)
    view(me, dt, k)
    const [wx, wz] = relative(d.stick, d.look.yaw)
    // With an aim up the legs keep the way they face, and strafe, turned only as far as keeps the aim
    // within the rig's `aim.across` of them; with the guard held they face the look; else they turn the
    // way they go.
    const limits = rigOf(w, playKind(me)).aim
    if (!limits) throw new Error(`player: the rig of ${playKind(me)} gives no aim limits`)
    const across = wrap(d.look.yaw - d.yaw)
    const aiming = Object.values(k.aimOf).includes(d.upperMotion)
    d.weapon = stanceOf(me, k) ?? d.weapon
    d.face = aiming ? (Math.abs(across) > limits.across ? wrap(d.look.yaw - Math.sign(across) * limits.across) : d.yaw) : d.guard ? d.look.yaw : null
    d.want = [wx, wz]
    // Aimed the way the camera looks: along its yaw, and down by its pitch within the rig's `aim.up` and `aim.down`.
    const up = clamp(-d.look.pitch, -limits.down, limits.up)
    d.aim = [math.sin(d.look.yaw) * math.cos(up), math.sin(up), math.cos(d.look.yaw) * math.cos(up)]
    // The guard held raises a block or an aim whenever one may come up, and let go lowers it.
    press(me, w, d.guard ? 'guard' : 'unguard', d.stick)
    // The target an attack is bent onto (motion3d's Warp): the nearest dummy within `lock` metres.
    d.target = targetOf(me, w, k.lock)
    drive(me, w, dt, d.stick)
    // The jump pad the body has just come onto, if any, throws it (`plugins/jumppad`).
    pads(me, w)
  },
  acts: {
    stick(me, _w, _seat, x: unknown, y: unknown) {
      if (way(x) && way(y)) me.data.stick = [x, 0 - (y as number)]
    },
    turn(me, _w, _seat, x: unknown, y: unknown) {
      if (way(x) && way(y)) me.data.turning = [x, y]
    },
    fast(me, _w, _seat, v: unknown) {
      if (v === 0 || v === 1) me.data.fast = v === 1
    },
    guard(me, _w, _seat, v: unknown) {
      if (v === 0 || v === 1) me.data.guard = v === 1
    },
    jumping(me, _w, _seat, v: unknown) {
      if (v === 0 || v === 1) me.data.jumpHeld = v === 1
    },
    press(me, w, _seat, key: unknown) {
      if (typeof key !== 'string' || !me.data.stood) return
      act(me, w, key, def(w, me.kind))
    },
    look(me, w, _seat, dyaw: unknown, dpitch: unknown) {
      if (!finite(dyaw, dpitch)) return
      const c = def(w, me.kind).camera
      const l = me.data.look
      me.data.look = { ...l, yaw: wrap(l.yaw + (dyaw as number)), pitch: clamp(l.pitch + (dpitch as number), c.minPitch, c.maxPitch) }
    },
    zoom(me, w, _seat, by: unknown) {
      if (!finite(by)) return
      const c = def(w, me.kind).camera
      const l = me.data.look
      me.data.look = { ...l, dist: clamp(l.dist * math.exp((by as number) * c.zoom), c.minDist, c.maxDist) }
    },
  },
}
