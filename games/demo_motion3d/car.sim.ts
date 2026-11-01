// A car the seat's body drives from its driver's seat: the space that offers motion3d its activity
// `car` (`carzone`, its `Seat` and wheel points) rides on it, so a body held to its seat goes where the
// car goes. Its definition (`assets/demo_motion3d.json`'s `car`, the parts and the space written by
// `assets/yard.mjs`):
//   speed   m/s, the most it drives at, ahead or back
//   accel   m/s², how fast it comes to the speed the stick asks
//   turn    radians a second it turns at the most, steering hard over at full speed; it turns at its
//           share of that as it goes slower, and not at all standing
//   lot     [x0, z0, x1, z1], the ground it drives on: at its edge it stops
//   parts   `[{ kind, at }]`, shapes3d's kinds it is built of, each standing `at` [left, up, ahead] in its
//           frame, turned as it is
//   zone    `{ kind, at }`, the space it carries, standing so
// Its row's fields: `pos` and `yaw`, where it stands on the ground and the way it faces (θ faces
// (sin θ, cos θ)); `speed`, m/s ahead; `parts`, the row ids of its parts, and `zone`, its space's, null
// until it has made them. The space's row carries `car`, this row's id.
//
// `before`, the first step, makes its parts and its space. Each step it takes its driver's stick, the
// `player` row held in its space's `car` activity driving it (`pilot`, or `honk` at the wheel): forward
// and back the speed, across the steering, right turning it right; with no driver it comes to rest.
// Then it moves, and stands its parts and its space where it is.
import type { Kind, Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import * as math from '#plugins/math/math.sim.ts'

type Car = { speed: number; accel: number; turn: number; lot: number[]; parts: { kind: string; at: number[] }[]; zone: { kind: string; at: number[] } }

const wrap = (a: number) => a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// A row stood `at` [left, up, ahead] in the car's frame, facing its way.
function stand(car: Row, row: Row, at: number[]) {
  const [x, y, z] = car.data.pos, yaw = car.data.yaw
  row.data.pos = [x + at[2] * math.sin(yaw) + at[0] * math.cos(yaw), y + at[1], z + at[2] * math.cos(yaw) - at[0] * math.sin(yaw)]
  row.data.yaw = yaw
}

function standAll(me: Row, w: W, k: Car) {
  k.parts.forEach((p, i) => stand(me, w.get(me.data.parts[i]), p.at))
  stand(me, w.get(me.data.zone), k.zone.at)
}

export const car: Kind = {
  before(me, _dt, w) {
    if (me.data.zone !== null) return
    const k = def(w, me.kind) as Car
    me.data.parts = k.parts.map(p => w.spawn(p.kind, {}).id)
    me.data.zone = w.spawn(k.zone.kind, { car: me.id }).id
    standAll(me, w, k)
  },
  tick(me, dt, w) {
    const k = def(w, me.kind) as Car
    const d = me.data
    const driver = w.all('player').find(p => p.data.activity === 'car' && p.data.space === d.zone && (p.data.motion === 'pilot' || p.data.motion === 'honk'))
    const [across, ahead] = driver ? driver.data.stick : [0, 0]
    const want = ahead * k.speed
    d.speed = d.speed < want ? Math.min(want, d.speed + k.accel * dt) : Math.max(want, d.speed - k.accel * dt)
    d.yaw = wrap(d.yaw - across * k.turn * (d.speed / k.speed) * dt)
    const [x, y, z] = d.pos
    const [x0, z0, x1, z1] = k.lot
    const nx = x + math.sin(d.yaw) * d.speed * dt, nz = z + math.cos(d.yaw) * d.speed * dt
    const kept = [clamp(nx, x0, x1), clamp(nz, z0, z1)]
    if (kept[0] !== nx || kept[1] !== nz) d.speed = 0
    d.pos = [kept[0], y, kept[1]]
    standAll(me, w, k)
  },
}
