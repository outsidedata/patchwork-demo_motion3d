// The row one seat possesses, and the body it plays: an X Bot (`as: "xbot"`) moved by kinematics3d
// (`world.kinematics3d.kinds.xbot`) and played and drawn by motion3d (`world.motion3d.kinds.xbot`), every
// move it makes the X Bot's motion3d file's (`assets/xbot.motion3d.json`). Every seat is sent every
// `player` row. Its own fields, beside kinematics3d's and motion3d's: `stick` [x, z], the keys' way,
// right and forward; `fast`, the run key held; `guard`, the guard key held; `look` `{ yaw, pitch, dist }`,
// chasecamera3d's orbit about it, `lift` metres over its feet; `turning` [x, y], how far a gamepad's right
// stick is pushed right and down; `aim`, the way the camera looks, which motion3d points a carried prop
// along while an aim is up; `weapon`, the stance the draw key draws, one of the definition's `weapons`;
// `queued`, the key pressed and not yet played, `{ key, age }`, or null; and `stood`, once it stands on
// its slot's start.
//
// Facing. With an aim up (the upper half playing one of the definition's `aimOf`, each weapon's aim by
// its name) the legs keep the way
// they face and strafe, turned only when the look is more than its rig's `aim.across` (radians) to either
// side of them; the aim's pitch is held within the rig's `aim.up` and `aim.down`. With the guard key held
// the body faces the way the camera looks and strafes, its stance's guard moves (`guard`, the yard's
// state). Else it turns the way it goes.
//
// The input buffer. A key pressed is held (`queued`) and handed to motion3d's `press` each step until a
// move plays it, for at most the definition's `buffer.hold` seconds of steps it was free to play in, a
// newer key taking its place. While the body plays a one-shot pressed with a key (an attack, a roll), a
// key is held back, its seconds not counted, until the one-shot has played the share of itself
// `buffer.cancel` gives for that key after the one playing; and while the upper half plays a one-shot (a
// draw, a putting away, a shot), a key no move will play yet is held, its seconds not counted, until it
// has played out:
// `cancel[<key playing>][<key pressed>]`, else `cancel[<key playing>]["*"]`, else `cancel["*"]["*"]`.
// A light pressed during a light plays the next of its chain once the first has struck, and a roll
// pressed during one cuts it short once it may. The guard key is held, not pressed: each step it is held
// `guard` is pressed and each step it is not, `unguard`, so a block or an aim comes up whenever it may
// and goes down when it is let go.
//
// The draw key draws `weapon` (`draw.<weapon>` to motion3d), and puts it away while it is drawn. The
// switch key, with no weapon in the hands nor one being drawn or put away (the upper half's move carries
// none of `weapons`), makes the next of `weapons` the one the draw key draws; else it is pressed to
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
// stick, the same), `fast(v)` and `guard(v)` (1 held, 0 let go), `press(key)`, a key pressed, buffered
// as above; `look(dyaw, dpitch)` and `zoom(by)`, the wheel's pixels. A seat's message arrives from
// outside the program, so each refuses arguments of the wrong kind and writes nothing.
import type { Kind, Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import * as math from '#plugins/math/math.sim.ts'
import { activityOf, drive, motionOf, press } from '#plugins/motion3d/motion3d.sim.ts'
import { clipOf, playKind, rigOf } from '#plugins/motion3d/motion3d.play.ts'
import { nearest, relative } from '#plugins/kinematics3d/kinematics3d.sim.ts'
import { pads } from './plugins/jumppad/jumppad.sim.ts'

const wrap = (a: number) => a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const finite = (...v: unknown[]) => v.every(x => typeof x === 'number' && Number.isFinite(x))
const way = (v: unknown) => typeof v === 'number' && Math.abs(v) <= 1

type Buffer = { hold: number; cancel: Record<string, Record<string, number>> }

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

// The share of itself the one-shot the body plays must have played before `key` may follow it: none
// while the body plays no one-shot that a key pressed (Buffer, the header).
function lockedUntil(me: Row, w: W, buffer: Buffer, key: string): number {
  const d = me.data
  const m = motionOf(activityOf(w, me, d.activity), d.motion)
  if (!m?.press || d.state !== 'act' || clipOf(rigOf(w, playKind(me)), d.clip).loop) return 0
  const c = buffer.cancel
  return c[m.press]?.[key] ?? c[m.press]?.['*'] ?? c['*']['*']
}

// The key held in the buffer handed to motion3d, once it may follow what plays; dropped once played or
// held past `hold` seconds.
function buffered(me: Row, w: W, dt: number, k: any) {
  const d = me.data
  const q = d.queued
  if (!q) return
  const until = lockedUntil(me, w, k.buffer, q.key)
  const share = until > 0 ? d.clipT / clipOf(rigOf(w, playKind(me)), d.clip).dur : 1
  if (share < until) return
  if (act(me, w, q.key, k)) {
    d.queued = null
    return
  }
  if (upperBusy(me, w)) return
  d.queued = q.age + dt > k.buffer.hold ? null : { key: q.key, age: q.age + dt }
}

// Whether the upper half plays a one-shot of its own (a draw, a putting away, a shot), which holds the
// buffer as a body's one-shot does.
function upperBusy(me: Row, w: W): boolean {
  const d = me.data
  const m = d.upperActivity === null ? undefined : motionOf(activityOf(w, me, d.upperActivity), d.upperMotion)
  return !!m?.clips.length && typeof d.upper === 'string' && !clipOf(rigOf(w, playKind(me)), d.upper).loop
}

// A key played: the draw key draws or puts away `weapon`; the switch key with nothing drawn picks the next
// weapon; any other key is motion3d's. Whether it played.
function act(me: Row, w: W, key: string, k: any): boolean {
  const d = me.data
  const weapons: string[] = k.weapons
  const next = weapons[(weapons.indexOf(d.weapon) + 1) % weapons.length]
  if (key === 'draw') return press(me, w, `draw.${d.weapon}`, d.stick)
  if (key !== 'switch') return press(me, w, key, d.stick)
  // No weapon in the hands, nor one being drawn or put away (the upper half's move carries none).
  const up = d.upperActivity === null ? undefined : motionOf(activityOf(w, me, d.upperActivity), d.upperMotion)
  if (!weapons.includes(up?.carry ?? '')) {
    d.weapon = next
    return true
  }
  // A weapon being drawn or put away: held until its stance is up, and switched from there.
  if (!press(me, w, 'switch', d.stick)) return false
  d.weapon = next
  return true
}

// The weapon whose stance is up, its own or its aim's: `weapons[i]` is aimed by `aims` where one names
// it (`aimOf`); none while no stance is up.
function stanceOf(me: Row, k: any): string | undefined {
  const u = me.data.upperMotion
  if (k.weapons.includes(u)) return u
  return Object.entries(k.aimOf as Record<string, string>).find(([, aim]) => aim === u)?.[0]
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
    buffered(me, w, dt, k)
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
    press(me, _w, _seat, key: unknown) {
      const d = me.data
      if (typeof key !== 'string' || !d.stood) return
      d.queued = { key, age: 0 }
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
