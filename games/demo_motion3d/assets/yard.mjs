// Writes the stations of the yard past the wall and the chair: for each, the solid things it needs and
// the space that offers its activity, with the points the activity's motions are held to, as shapes3d's
// kinds, prefabs and actors in `main.scene.json`, and the car's parts into its definition in
// `demo_motion3d.json`. The game's bake runs it once the rig is baked and measured
// (`demo_motion3d.bake.ts`):
//   node games/demo_motion3d/assets/yard.mjs
// It writes the kinds it makes, their prefabs and their actors anew, and leaves every other line of the
// scene as it was: the zones, the wall's ledge and the chair written by hand.
//
// Every size and every point comes from what the clips measure (`xbot.rig.baked.json`): `ends`, each
// bone where it is drawn in the body's frame (x left, y up, z ahead, metres from the root), and
// `touches`, what each clip touches (anim's touch reader, `plugins/anim/anim.touches.mjs`, whose places
// are in the clip's frame at its start). As demo_walker's yard does (`games/demo_walker/assets/yard.mjs`,
// its touch plugin's `placeOf`), a thing is sized and set where the clip touches it, and the place a
// clip starts at is the one that carries a point it touches onto the thing (`anchor`). A point of a space
// is where the bones its motions land on it stand (`plugins/motion3d`, Held to a point): the wrists for
// a hand's hold, the ankles for a foot's, the hips for a seat, the root itself for a motion that lands
// none. Each station, `(x, z)` its cell:
//   cold room   a pale mat offering `cold` with no key (`data.motion3d.autoChange`): its `idle`, standing
//               still in it
//   bar         a bar on two posts at the height `freejump` ends the hands holding, offering `bar`: its
//               `Bar` line where the wrists hold it
//   rope        a rope 6 m up to a beam on two posts, offering `rope`: its `Rope` line straight up where
//               `ropeclimb` holds the wrists, the hands round the rope
//   rope swing  a beam on two posts where `ropeswing` swings from (its swing's pivot on the beam's
//               underside) and the platform it lands on, offering `swing`: its `Start` point, where the
//               swing starts the root
//   climb wall  a wall 5 m high, offering `climb`: its `Face` plane, stood up on the wall's face, facing
//               out of it, which `wallclimb` holds its hands and feet on
//   tilted wall a slab 5 m high leaning back 20°, offering `climb` the same: its `Face` plane on its face,
//               facing out of it and up, the climber leaning onto it
//   run wall    a wall 8 m long, offering `wallrun`: its `Wall` plane on its face, facing out of it, which
//               `wallside`'s feet kick off (its offsets, `xbot.motion3d.baked.json`)
//   vault       a low wall as high as `vaultone` sets its palm, offering `vault`: its `Vault` point, where
//               the vault starts the root so the palm lands on the wall's top
//   edge        a block as high as `jumpdown` steps down, with a step up onto it, offering `edge` on its top at
//               its front: its `Edge` line along the front, where `teeter` stands the ankles with the toes
//               at the edge
//   stairs      a flight of steps up to a landing, each step as high and as deep as half `stairsup`'s
//               lap, offering `stairs` at its foot: its `Flight` line, where the root climbs a lap at a time
//   pool        a pool by the stairs' landing, its deck as high as `poolin` starts the feet, its far wall
//               a little over the water, offering `pool` at the near deck's edge: its `Float` plane, where
//               `poolin` ends the hips and `tread` and `swimunder` hold them, the water `surface` over
//               it where `tread` floats, and its `Lip` line along the far wall where `bracedclimb` starts
//               the wrists
//   desk        a chair as high as `typing` sits and a table where it types, offering `desk`: its `Seat`
//               point where `typing` holds the hips
//   ceiling     a slab on four posts as high as `freejump` ends the hands gripping, offering `ceiling`:
//               its `Ceiling` plane, turned face down where the wrists hold it
//   bed         a bed as high as `liedown` lies on, offering `bed` at its foot: its `Bed` point where
//               `liedown` ends the hips and `bedidle` holds them
//   car         a car of the parts `carin` climbs into, offering `car` at its door: its `Seat` point where
//               `carin` ends the hips and `drive` holds them, its wheel where `drive` holds the wrists;
//               the car is the game's `car` kind, which stands its parts and its space
//               about it (`car.sim.ts`), so the parts and the space are written into its definition
//   beam        a low beam, offering `beam` at its near end: its `Beam` line along its top where
//               `sneakwalk` stands the ankles
//   crawl cube  a sandy mat offering `crawl` with no key: walked in, the legs crawl and lie prone
//   cave        a dark mat offering `light_torch` with no key: walked in, the arms draw the torch and
//               hold it; walked out, they put it away
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const here = import.meta.dirname
const rig = { ...JSON.parse(readFileSync(path.join(here, 'xbot.rig.json'), 'utf8')), ...JSON.parse(readFileSync(path.join(here, 'xbot.rig.baked.json'), 'utf8')) }
const defsFile = path.join(here, 'demo_motion3d.json')
const defs = JSON.parse(readFileSync(defsFile, 'utf8'))
const sceneFile = path.join(here, '..', 'main.scene.json')
const scene = JSON.parse(readFileSync(sceneFile, 'utf8'))
// The kinds of the scene written by hand, which this leaves as they are; every other shapes3d kind is
// this file's, written anew.
const BY_HAND = ['partyzone', 'sadzone', 'wall', 'ledgezone', 'chair', 'chairback', 'chairzone']
// A one-shot carries travel ending further than `moves` metres from its start, and keeps its turn turning
// `turns` degrees or further (the X Bot's motion3d file).
const { moves: MOVES, turns: TURNS } = JSON.parse(readFileSync(path.join(here, 'xbot.motion3d.json'), 'utf8'))
const ends = rig.ends.xbot
const touches = rig.touches.xbot

const DEG = Math.PI / 180
const round = v => Math.round(v * 1000) / 1000
const r3 = p => p.map(round)
const mean = ps => ps[0].map((_, i) => ps.reduce((s, p) => s + p[i], 0) / ps.length)
const t = name => {
  const c = touches[name]
  if (!c) throw new Error(`yard.mjs: the rig has no touches of ${name}; bake it`)
  return c
}
// A bone's place in the body's frame `s` seconds into a clip, as the bake's `ends` has it.
const SEGMENT = { Hips: 'torso', LeftHand: 'handL', RightHand: 'handR', LeftFoot: 'footL', RightFoot: 'footR' }
function bone(clip, name, s) {
  const e = ends[clip]
  if (!e) throw new Error(`yard.mjs: the rig has no ends of ${clip}`)
  const rows = e[SEGMENT[name]]
  return rows[Math.max(0, Math.min(rows.length - 1, Math.round(s * e.fps)))].slice(0, 3)
}
// The curve of a clip's measured travel at `s` seconds: [forward, left, turn degrees], straight between
// the table's rows (motion3d's `at`).
function curve(clip, s) {
  const rows = rig.table[clip].travel
  if (s <= rows[0][0]) return rows[0].slice(1)
  for (let i = 1; i < rows.length; i++) {
    if (s > rows[i][0]) continue
    const a = rows[i - 1], b = rows[i], u = (s - a[0]) / (b[0] - a[0])
    return [1, 2, 3].map(k => a[k] + (b[k] - a[k]) * u)
  }
  return rows[rows.length - 1].slice(1)
}
// Whether a clip carries its travel, and keeps its turn (motion3d's `carries`).
function carries(clip) {
  const e = rig.clips[clip]
  if (typeof e === 'object' && e.loop) return { carries: false, turns: false }
  const m = rig.table[clip]
  const turns = Math.abs(m.yaw) >= TURNS
  return { carries: turns || Math.hypot(m.forward, m.left) > MOVES, turns }
}
// A bone as it is drawn in the body's frame (motion3d's `drawnAt`): its measured place, but for a
// one-shot that carries travel, the hips held at their rest across the ground and the body turned back
// about them by the curve's turn.
function drawn(clip, name, s) {
  const at = bone(clip, name, s)
  const how = carries(clip)
  if (!how.carries) return at
  const hips = bone(clip, 'Hips', s), rest = bone(clip, 'Hips', 0)
  const a = how.turns ? -curve(clip, s)[2] * DEG : 0
  const x = at[0] - hips[0], z = at[2] - hips[2]
  return [rest[0] + x * Math.cos(a) + z * Math.sin(a), at[1], rest[2] - x * Math.sin(a) + z * Math.cos(a)]
}
const bones = (clip, names, s) => mean(names.map(n => drawn(clip, n, s)))
const dur = clip => rig.table[clip].dur
const HANDS = ['LeftHand', 'RightHand']
const FEET = ['LeftFoot', 'RightFoot']

// A place `p` [x (left), y, z (ahead)] of a body whose root stands at `root` facing `yaw`, in the world.
const world = (root, yaw, p) => [root[0] + p[2] * Math.sin(yaw) + p[0] * Math.cos(yaw), root[1] + p[1], root[2] + p[2] * Math.cos(yaw) - p[0] * Math.sin(yaw)]
// The place that carries the clip's point `q` onto the world's point `at`, its heading `h` (degrees) on
// the world's yaw `yaw` (demo_walker's touch plugin's `anchor`).
function anchor(q, h, at, yaw) {
  const turn = yaw - h * DEG
  const p = world([0, 0, 0], turn, q)
  return { root: [at[0] - p[0], at[1] - q[1], at[2] - p[2]], yaw: turn }
}
// Where a one-shot ends the root, and the way it faces then, begun at `root` facing `yaw`: as far on as
// it carries its measured travel (the table's last row), or where it began for one that carries none.
function travelled(clip, root, yaw) {
  const how = carries(clip)
  if (!how.carries) return { root, yaw }
  const rows = rig.table[clip].travel
  const [, f, l, turn] = rows[rows.length - 1]
  return { root: world(root, yaw, [l, 0, f]), yaw: yaw + (how.turns ? turn * DEG : 0) }
}
// A world place in the frame of a body whose root stands at `root` facing `yaw`.
const inBody = (root, yaw, p) => {
  const d = [p[0] - root[0], p[1] - root[1], p[2] - root[2]]
  return [d[0] * Math.cos(yaw) - d[2] * Math.sin(yaw), d[1], d[0] * Math.sin(yaw) + d[2] * Math.cos(yaw)]
}
// For a one-shot that ends hanging from its hands, in the body's frame as it ends: `bar`, the middle of
// the hands as they hold on at its end (the last hold of each, its `touches`, which stand in the
// clip's frame at its start), and `wrists`, the wrists' middle as they are drawn then.
function held(clip) {
  const last = dur(clip) - 1e-6
  const finish = travelled(clip, [0, 0, 0], 0)
  const holds = t(clip).plants.filter(p => (p.point === 'handL' || p.point === 'handR') && p.on === 'hold')
  const hands = mean(['handL', 'handR'].map(h => holds.filter(p => p.point === h).sort((a, b) => a.to - b.to).pop().at))
  return { bar: inBody(finish.root, finish.yaw, hands), wrists: bones(clip, HANDS, last) }
}

const kinds = {}
const actors = []
// A kind of shapes3d's, once; a second of the name with other numbers throws.
function kind(name, k) {
  if (kinds[name] && JSON.stringify(kinds[name]) !== JSON.stringify(k)) throw new Error(`yard.mjs: two kinds named ${name}`)
  kinds[name] = k
}
const look = (colour, more = {}) => ({ colour, roughness: 0.8, ...more })
// A solid box of the kind `name`, `size` [across, tall, along], its foot's middle at (x, y, z).
function box(name, size, colour, x, y, z) {
  kind(name, { shape: { box: { size: r3(size) } }, look: look(colour) })
  actors.push({ is: name, pos: r3([x, y, z]) })
}
function cylinder(name, radius, height, colour, x, y, z) {
  kind(name, { shape: { cylinder: { radius, height: round(height) } }, look: look(colour, { sides: 8 }) })
  actors.push({ is: name, pos: r3([x, y, z]) })
}
// A space of the kind `name`: a box `size` whose foot's middle is at `at`, offering `activities`, its
// points given in the world and written in its own frame (its row stands at `at`, facing 0); drawn as a
// mat when it has a `colour`; carrying `data` for the plugins that read it when given.
function space(name, size, at, activities, points = {}, colour, data) {
  const local = p => r3([p[0] - at[0], p[1] - at[1], p[2] - at[2]])
  const placed = Object.fromEntries(Object.entries(points).map(([n, c]) => {
    if (c.point) return [n, { point: { at: local(c.point.at), ...(c.point.turn ? { turn: c.point.turn.map(round) } : {}) } }]
    if (c.line) return [n, { line: { from: local(c.line.from), to: local(c.line.to), ...(c.line.turn ? { turn: c.line.turn.map(round) } : {}) } }]
    return [n, { plane: { at: local(c.plane.at), size: r3(c.plane.size), turn: c.plane.turn.map(round), ...(c.plane.normal ? { normal: c.plane.normal } : {}) } }]
  }))
  kind(name, { shape: { box: { size: r3(size) } }, ...(colour ? { look: look(colour) } : {}), ...(Object.keys(placed).length ? { points: placed } : {}), activities, ...(data ? { data } : {}) })
  actors.push({ is: name, pos: r3(at) })
}
// A beam `top` high, its underside there, on two posts 1.2 m apart across x.
function beam(name, x, z, top) {
  box(`${name}post`, [0.12, top + 0.12, 0.12], '#b08a5a', x - 0.6, 0, z)
  box(`${name}post`, [0.12, top + 0.12, 0.12], '#b08a5a', x + 0.6, 0, z)
  box(`${name}beam`, [1.32, 0.12, 0.12], '#b08a5a', x, top, z)
}

// ---------------------------------------------------------------- row one

// The data of a space whose activities a body takes up with no key (motion3d's stack).
const AUTO = { motion3d: { autoChange: true } }

// The cold room: a mat, the activity `cold` taken up with no key.
space('coldroom', [5, 0.04, 5], [-14, -0.02, 18], ['cold'], {}, '#a8d0f0', AUTO)

// The bar: as high as `freejump` ends the hands holding (their middle), the `Bar` line where it holds
// the wrists, along the bar, the body facing it.
{
  const [x, z] = [-7, 18]
  const { bar, wrists } = held('freejump')
  const r = 0.03
  box('barpost', [0.1, bar[1] + 0.1, 0.1], '#b0b8c0', x - 2.05, 0, z)
  box('barpost', [0.1, bar[1] + 0.1, 0.1], '#b0b8c0', x + 2.05, 0, z)
  box('bar', [4, 2 * r, 2 * r], '#b0b8c0', x, bar[1] - r, z)
  // The wrists from the bar's middle, the body facing +z.
  const at = [x + wrists[0] - bar[0], wrists[1], z + wrists[2] - bar[2]]
  space('barzone', [4, bar[1] + 0.3, 1.4], [x, 0, z - 0.3], ['bar'], {
    Bar: { line: { from: [x - 2, at[1], at[2]], to: [x + 2, at[1], at[2]] } },
  })
}

// The rope: 6 m up to a beam, the `Rope` line straight up the rope where `ropeclimb` holds the wrists,
// the hands' holds' middle across the ground on the rope's axis, the body facing +z.
{
  const [x, z] = [0, 18]
  const holds = t('ropeclimb').plants.filter(p => (p.point === 'handL' || p.point === 'handR') && p.on === 'hold')
  const hands = mean(holds.map(p => p.at))
  const w = bones('ropeclimb', HANDS, 0)
  beam('rope', x, z, 6)
  cylinder('rope', 0.025, 6, '#b08a5a', x, 0, z)
  const at = [x + (w[0] - hands[0]), 0, z + (w[2] - hands[2])]
  space('ropezone', [1.4, 6, 1.4], [x, 0, z - 0.2], ['rope'], { Rope: { line: { from: at, to: [at[0], 6, at[2]] } } })
}

// The rope swing: the beam where the swing's pivot is, the platform where the swing lands the soles,
// and the `Start` point, the root where the swing starts.
{
  const [x, z] = [7, 18]
  const swing = t('ropeswing').things.swing
  beam('swing', x, z, swing.pivot[1])
  const start = anchor(swing.pivot, 0, [x, swing.pivot[1], z], 0)
  const soles = t('ropeswing').plants.filter(p => p.point.startsWith('sole') && p.on === 'raised floor').map(p => world(start.root, start.yaw, p.at))
  const top = t('ropeswing').things.end
  const mid = mean(soles)
  box('swingplatform', [2.4, top, 2.4], '#b08a5a', mid[0], 0, mid[2])
  space('swingzone', [1.6, 2.4, 1.6], [start.root[0], 0, start.root[2]], ['swing'], { Start: { point: { at: start.root } } })
  // The rope the game's yard plugin draws, from the swing zone's row: where it hangs from.
  defs.swingzone = { ...defs.swingzone, pivot: r3([x - start.root[0], swing.pivot[1], z - start.root[2]]), length: swing.radius }
}

// The climbing wall: its face on z, the `Face` plane stood up on it, facing out of it, which `wallclimb`'s
// hands and feet are on (their offsets, `xbot.motion3d.baked.json`).
{
  const [x, z] = [14, 18]
  box('climbwall', [3, 5, 1.2], '#c9a27e', x, 0, z + 0.6)
  space('climbzone', [3, 5, 1], [x, 0, z - 0.5], ['climb'], { Face: { plane: { at: [x, 2.5, z], size: [3, 5], turn: [0, -90, 0], normal: [0, 0, -1] } } })
}

// ---------------------------------------------------------------- row two

// The run wall: 8 m long, its `Wall` plane on its face, facing out of it (its normal) and along it the
// way `wallside` runs, −x; the space before it where the feet's kicks land on its face a third of the
// way along it.
{
  const [x, z] = [-14, 28]
  const wall = { x: x + 1, z: z + 2, long: 8, deep: 0.6, tall: 3.5 }
  box('runwall', [wall.long, wall.tall, wall.deep], '#c9a27e', wall.x, 0, wall.z + wall.deep / 2)
  const face = t('wallside').things.face
  const start = anchor([face.at[0], 0, face.at[1]], face.normal + 180, [wall.x - wall.long / 2 + 0.3 * wall.long, 0, wall.z], 0)
  space('runzone', [2, 2.4, 2], [start.root[0], 0, start.root[2]], ['wallrun'], {
    Wall: { plane: { at: [wall.x, wall.tall / 2, wall.z], size: [wall.tall, wall.long], turn: [-90, 0, 90], normal: [0, 0, -1] } },
  })
}

// The vault: a wall as high as `vaultone` sets its palm, the `Vault` point the root where the palm lands
// on the middle of the wall's top.
{
  const [x, z] = [-7, 28]
  const o = t('vaultone').things.over
  const wall = { z: z + 2, deep: 0.4 }
  box('vaultwall', [2.5, o.top, wall.deep], '#60c0c0', x, 0, wall.z + wall.deep / 2)
  const start = anchor([o.at[0], o.top, o.at[1]], o.way, [x, o.top, wall.z + wall.deep / 2], 0)
  space('vaultzone', [2, 2.4, 2], [start.root[0], 0, start.root[2]], ['vault'], { Vault: { point: { at: [start.root[0], 0, start.root[2]], turn: [start.yaw / DEG, 0, 0] } } })
}

// The edge: a block as high as `jumpdown` starts the soles, its front on z facing −z, a step up onto it
// behind, and the `Edge` line along its front where `teeter` stands the ankles, the front of its balls
// at the edge, the body facing out over it.
{
  const [x, z] = [0, 28]
  // As high over the floor as the soles start over the toes' tips it ends on.
  const top = round(t('jumpdown').things.start - Math.min(ends.jumpdown.footL.at(-1)[4], ends.jumpdown.footR.at(-1)[4]))
  const front = z - 1.5
  box('edge', [3, top, 2], '#d0b070', x, 0, front + 1)
  box('edgestep', [1.2, round(top / 2), 0.5], '#d0b070', x, 0, front + 2.25)
  const start = t('teeter').things.start
  const balls = t('teeter').plants.filter(p => p.point.startsWith('ball') && Math.abs(p.at[1] - start) <= 0.05)
  const q = [mean(balls.map(b => b.at))[0], start, Math.max(...balls.map(b => b.at[2]))]
  const stand = anchor(q, 0, [x, top, front], Math.PI)
  const ankles = world(stand.root, stand.yaw, bones('teeter', FEET, 0))
  space('edgezone', [3, 2.3, 0.8], [x, round(top / 2), front + 0.4], ['edge'], {
    Edge: { line: { from: [x - 1.5, ankles[1], ankles[2]], to: [x + 1.5, ankles[1], ankles[2]], turn: [180, 0, 0] } },
  })
}

// The stairs and the pool beside their landing.
{
  const [x, z] = [7, 28]
  const lap = t('stairsup').lap
  const riser = round(lap[1] / 2), tread = round(lap[2] / 2)
  const STEPS = 12
  const z0 = z - 2
  for (let i = 1; i <= STEPS; i++) box(`stair${i}`, [1.6, i * riser, tread], '#f0a060', x, 0, z0 + (i - 0.5) * tread)
  const deck = STEPS * riser
  const landing = z0 + STEPS * tread
  box('stairlanding', [1.6, deck, 1.2], '#f0a060', x, 0, landing + 0.6)
  // The flight: from where `stairsup`'s first raised sole stands on the first step's middle, a lap a
  // time to the landing.
  const first = t('stairsup').plants.filter(p => p.point.startsWith('sole') && p.on === 'raised floor').sort((a, b) => a.from - b.from)[0]
  const n = Math.max(1, Math.round(first.at[1] / riser))
  const start = anchor(first.at, 0, [x, n * riser, z0 + (n - 0.5) * tread], 0)
  const laps = STEPS / 2
  const to = [start.root[0], start.root[1] + laps * lap[1], start.root[2] + laps * lap[2]]
  space('stairzone', [1.6, 2.4, 1.2], [x, 0, start.root[2]], ['stairs'], { Flight: { line: { from: start.root, to } } })

  // The pool: its water held between the near deck at the landing's height, two side walls and a far
  // deck a little over the water. `poolin` stands the feet on the near deck at its start and ends the
  // hips on the `Float` plane, the deck that far over it; `tread` floats with the water `surface` over
  // its root, so over the hips by that less its hips' height.
  const hole = { across: 3, long: 5, near: landing + 1.2 + 0.8 }
  const soles = t('poolin').floors.find(f => f.from === 0).y
  const float = round(deck - (soles - drawn('poolin', 'Hips', dur('poolin') - 1e-6)[1]))
  const surface = round(float + t('tread').things.water.surface - bone('tread', 'Hips', 0)[1])
  const far = round(surface + 0.25)
  const mid = hole.near + hole.long / 2
  box('pooldeck', [hole.across + 1.6, deck, 0.8], '#d8d8d0', x, 0, hole.near - 0.4)
  box('poolwall', [0.2, far, hole.long], '#d8d8d0', x - hole.across / 2 - 0.1, 0, mid)
  box('poolwall', [0.2, far, hole.long], '#d8d8d0', x + hole.across / 2 + 0.1, 0, mid)
  box('poolfar', [hole.across + 0.4, far, 0.8], '#d8d8d0', x, 0, hole.near + hole.long + 0.4)
  box('poolbridge', [1.6, deck, round(hole.near - 0.8 - landing - 1.2)], '#d8d8d0', x, 0, (landing + 1.2 + hole.near - 0.8) / 2)
  // The far wall's lip: where `bracedclimb` starts the wrists, as far under the far deck's top as the
  // floor it ends on stands over them, and as far short of the far wall's face as its kicks stand ahead
  // of them (its `face`), the body facing +z.
  const wrists = bones('bracedclimb', HANDS, 0)
  const climbed = t('bracedclimb').things.end - wrists[1]
  const lipY = round(far - climbed), lipZ = round(hole.near + hole.long - (t('bracedclimb').things.face.at[1] - wrists[2]))
  space('pool', [hole.across, 2.4, 0.8], [x, deck, hole.near - 0.4], ['pool'], {
    Float: { plane: { at: [x, float, mid], size: [hole.across - 0.8, hole.long - 0.8], turn: [0, 0, 0] } },
    Lip: { line: { from: [x - hole.across / 2, lipY, lipZ], to: [x + hole.across / 2, lipY, lipZ] } },
  })
  // The water the game's yard plugin draws, from the pool's row: its surface's middle and its size.
  defs.pool = { ...defs.pool, water: { at: r3([0, surface - deck, mid - (hole.near - 0.4)]), size: [hole.across, hole.long] } }
}

// The desk: the body seated facing +z, its root at the cell, the chair's seat under `typing`'s seat
// and its back behind the sitter, the table where it types (its palms' height and middle), the `Seat`
// point where `typing` holds the hips.
{
  const [x, z] = [14, 28]
  const seat = t('typing').things.seat[0]
  const palms = t('typing').things.palms
  const chair = world([x, 0, z], 0, [seat.at[0], 0, seat.at[1]])
  box('deskchair', [0.45, seat.y, 0.45], '#40b0a0', chair[0], 0, chair[2])
  box('deskchairback', [0.45, 0.9, 0.05], '#40b0a0', chair[0], 0, chair[2] - seat.rear - 0.025)
  const top = Math.min(...palms.map(p => p.y))
  const ahead = mean(palms.map(p => [p.at[0], 0, p.at[1]]))[2]
  box('desktop', [1.2, 0.04, 0.6], '#9a7a5a', x, top - 0.04, z + ahead)
  box('deskleg', [0.05, top - 0.04, 0.6], '#9a7a5a', x - 0.575, 0, z + ahead)
  box('deskleg', [0.05, top - 0.04, 0.6], '#9a7a5a', x + 0.575, 0, z + ahead)
  const hips = world([x, 0, z], 0, bone('typing', 'Hips', 0))
  space('deskzone', [1.2, 2, 1.2], [x + 0.9, 0, z], ['desk'], { Seat: { point: { at: hips } } })
}

// ---------------------------------------------------------------- row three

// The ceiling: a slab on four posts, its underside where `freejump` ends the hands gripping (the top of
// the hands), the `Ceiling` plane turned face down where the jump ends the wrists.
{
  const [x, z] = [-14, 44]
  const finish = travelled('freejump', [0, 0, 0], 0)
  const grips = t('freejump').things.grips
  const grip = Math.max(...grips.map(g => g.y))
  const w = world(finish.root, finish.yaw, bones('freejump', HANDS, dur('freejump') - 1e-6))
  const size = 4
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box('hallpost', [0.15, grip + 0.1, 0.15], '#8a8f98', x + (dx * size) / 2, 0, z + (dz * size) / 2)
  box('hallceiling', [size, 0.1, size], '#8a8f98', x, grip, z)
  space('hallzone', [size, grip, size], [x, 0, z], ['ceiling'], {
    Ceiling: { plane: { at: [x, w[1], z], size: [size - 0.4, size - 0.4], turn: [0, 180, 0] } },
  })
}

// The bed: as high as `liedown` lies on (its lowest floor once lying), its `Bed` point where `liedown`
// ends the hips, under the body as it lies there.
{
  const [x, z] = [-7, 44]
  const lie = t('liedown')
  const top = Math.min(...lie.floors.filter(l => l.by.includes('seat') || l.by.includes('belly')).map(l => l.y))
  // Begun at the cell facing +z; where it ends the root and the hips, and how the body lies then.
  const start = [x, 0, z]
  const finish = travelled('liedown', start, 0)
  const last = dur('liedown') - 1e-6
  const hips = world(finish.root, finish.yaw, drawn('liedown', 'Hips', last))
  const feet = world(finish.root, finish.yaw, bones('liedown', FEET, last))
  const headTop = world(finish.root, finish.yaw, ends.liedown.head[ends.liedown.head.length - 1].slice(3, 6))
  // The bed under the lying body along z, from past its head to short of its ankles, which hang over
  // its foot as the standing start's feet stand past it.
  const from = Math.min(headTop[2], feet[2]) - 0.25, to = Math.max(headTop[2], feet[2]) - 0.05
  box('bed', [1, top, to - from], '#9fb4d8', hips[0], 0, (from + to) / 2)
  // The space past the bed's foot, where a body stands to lie down, `liedown`'s start at its edge.
  space('bedzone', [1.4, 2, 1.4], [start[0], 0, round(to + 0.6)], ['bed'], { Bed: { point: { at: hips, turn: [finish.yaw / DEG, 0, 0] } } })
}

// The car: its parts in its own frame (x its left, y up, z ahead, from its middle on the ground), the
// driver's seat where `carin` ends the seat (the middle of the seat's skin) on a block the car's floor
// as high as `carin` steps onto, the `Seat` point where `carin` ends the hips, and the wheel where `drive`
// holds the wrists with its hips on the seat. The car faces +z; the driver's door is on its left, where
// `carin` starts.
{
  const size = [1.8, 4.2]
  const [w, l] = size
  const carin = t('carin')
  const seat = carin.things.seat[0]
  const floor = Math.max(...carin.floors.map(f => f.y))
  // The driver's seat 0.4 m left of the car's middle and 0.1 m ahead. `carin` begun facing so that it
  // ends facing the car's way, +z; where it ends the hips and where its seat's skin is (its touches, in
  // the clip's frame at its start), moved so the skin's middle is on the seat.
  const SEAT = [0.4, 0.1]
  const last = dur('carin') - 1e-6
  const facing = carries('carin').turns ? -curve('carin', dur('carin'))[2] * DEG : 0
  const finish = travelled('carin', [0, 0, 0], facing)
  const skin = world([0, 0, 0], facing, [seat.at[0], seat.y, seat.at[1]])
  const shift = [SEAT[0] - skin[0], 0, SEAT[1] - skin[2]]
  const moved = p => [p[0] + shift[0], p[1], p[2] + shift[2]]
  const hipsAt = moved(world(finish.root, finish.yaw, drawn('carin', 'Hips', last)))
  const startAt = moved([0, 0, 0])
  // `drive`'s wrists, its hips on the same place.
  const wheel = n => { const b = drawn('drive', n, 0), h = drawn('drive', 'Hips', 0); return [hipsAt[0] + b[0] - h[0], hipsAt[1] + b[1] - h[1], hipsAt[2] + b[2] - h[2]] }
  const line = round(seat.y + 0.15), top = round(seat.y + 0.95)
  const hood = l * 0.3, boot = l * 0.2, cabin = l - hood - boot
  const parts = [
    { kind: 'carhood', size: [w, line, hood], at: [0, 0, l / 2 - hood / 2] },
    { kind: 'carboot', size: [w, line, boot], at: [0, 0, -l / 2 + boot / 2] },
    { kind: 'carfloor', size: [w, floor, cabin], at: [0, 0, l / 2 - hood - cabin / 2] },
    { kind: 'cardoor', size: [0.06, line, cabin], at: [-w / 2 + 0.03, 0, l / 2 - hood - cabin / 2] },
    { kind: 'carroof', size: [w, 0.08, l * 0.5], at: [0, top - 0.08, SEAT[1] - 0.1] },
    ...[SEAT[1] - 0.1 - l * 0.25, SEAT[1] - 0.1 + l * 0.25].flatMap(ahead => [-1, 1].map(side => ({ kind: 'carpillar', size: [0.08, top - line, 0.08], at: [(side * (w - 0.08)) / 2, line, ahead] }))),
    { kind: 'carseat', size: [0.5, 0.12, 0.5], at: [SEAT[0], seat.y - 0.12, SEAT[1]] },
    { kind: 'carwheel', size: [0.4, 0.05, 0.05], at: mean([wheel('LeftHand'), wheel('RightHand')]).map((v, i) => (i === 1 ? v - 0.025 : v)) },
  ]
  for (const p of parts) kind(p.kind, { shape: { box: { size: r3(p.size) } }, look: look(p.kind === 'carwheel' ? '#303030' : p.kind === 'carseat' ? '#404850' : '#c05050') })
  // The space by the driver's door, round where `carin` starts, and its point.
  const zone = { kind: 'carzone', size: [2, 2.4, 2.4], at: [round(startAt[0]), 0, round(startAt[2])] }
  const points = { Seat: { point: { at: r3(hipsAt.map((v, i) => v - zone.at[i])) } } }
  kind('carzone', { shape: { box: { size: zone.size } }, points, activities: ['car'] })
  defs.car = { ...defs.car, parts: parts.map(p => ({ kind: p.kind, at: r3(p.at) })), zone: { kind: zone.kind, at: zone.at } }
  actors.push({ is: 'car', pos: [5, 0, 46], yaw: 0 })
}

// The tilted climbing wall: a slab 5 m high leaning back 20° from upright, its foot on z, rising away
// along +z, and its `Face` plane on its face, facing out of it toward the climber and up, which the same
// `wallclimb` and `walldown` the upright wall's measures climb, the body leaning onto it (motion3d's
// Tilt).
{
  const [x, z] = [14, 44]
  const tall = 5, lean = 20 * DEG
  const rise = Math.PI / 2 - lean
  const run = tall / Math.tan(rise)
  kind('slabwall', { shape: { plane: { size: r3([3, run]), tilt: round(rise * 1e6) / 1e6 } }, look: look('#c9a27e', { thick: 0.3 }) })
  actors.push({ is: 'slabwall', pos: r3([x, tall / 2, z + run / 2]) })
  space('tiltzone', [3, 5, 1], [x, 0, z - 0.5], ['climb'], {
    Face: { plane: { at: [x, tall / 2, z + run / 2], size: [3, tall / Math.sin(rise)], turn: [0, -rise / DEG, 0], normal: r3([0, Math.sin(lean), -Math.cos(lean)]) } },
  })
}

// ---------------------------------------------------------------- row four

// The beam: a beam 6 m long along z, 0.3 m high, offering `beam` at its near end: its `Beam` line along
// its top, where `sneakwalk` stands the ankles, the body walking along it facing +z.
{
  const [x, z] = [-14, 56]
  const beam = { top: 0.3, long: 6, wide: 0.2 }
  box('beam', [beam.wide, beam.top, beam.long], '#b08a5a', x, 0, z + beam.long / 2)
  const ankles = round(beam.top + bones('sneakwalk', FEET, 0)[1])
  space('beamzone', [1.4, 2, 1.4], [x, 0, z - 0.5], ['beam'], { Beam: { line: { from: [x, ankles, z], to: [x, ankles, z + beam.long] } } })
}

// ---------------------------------------------------------------- row five

// The crawl cube and the cave: mats a body walks onto, each offering its activity with no key, past the
// car's lot. The cube's `crawl` lists the legs alone; the cave's `light_torch` the arms alone.
// Each 3 m tall, so a body in the air over it is in it, drawn by a mat on the floor.
box('crawlcubemat', [5, 0.02, 5], '#d8c08a', 0, 0, 66)
space('crawlcube', [5, 3, 5], [0, -0.02, 66], ['crawl'], {}, undefined, AUTO)
box('cavemat', [6, 0.02, 6], '#4a4552', 14, 0, 66)
space('cave', [6, 3, 6], [14, -0.02, 66], ['light_torch'], {}, undefined, AUTO)

// ---------------------------------------------------------------- the scene

const made = Object.keys(kinds)
const was = Object.keys(scene.world.shapes3d.kinds).filter(name => !BY_HAND.includes(name))
for (const name of was) {
  delete scene.world.shapes3d.kinds[name]
  delete scene.prefabs[name]
}
scene.actors = scene.actors.filter(a => !was.includes(a.is) && a.is !== 'car')
Object.assign(scene.world.shapes3d.kinds, kinds)
for (const name of made) scene.prefabs[name] = { pos: [0, 0, 0], yaw: 0 }
// The car's space carries the car's row id, which the car spawns it with (`car.sim.ts`).
scene.prefabs.carzone.car = null
scene.actors.push(...actors)

// The scene as it is written by hand: a value on one line where it fits in `WIDE` characters, else its
// entries a line each (demo_walker's yard's).
const WIDE = 150
const pretty = (v, indent = '') => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v)
  const list = Array.isArray(v)
  const items = list ? v.map(x => pretty(x, indent + '  ')) : Object.entries(v).map(([key, x]) => `${JSON.stringify(key)}: ${pretty(x, indent + '  ')}`)
  if (!items.length) return list ? '[]' : '{}'
  const one = list ? `[${items.join(', ')}]` : `{ ${items.join(', ')} }`
  if (!one.includes('\n') && indent.length + one.length <= WIDE) return one
  return `${list ? '[' : '{'}\n${items.map(i => `${indent}  ${i}`).join(',\n')}\n${indent}${list ? ']' : '}'}`
}
writeFileSync(sceneFile, pretty(scene) + '\n')
writeFileSync(defsFile, pretty(defs) + '\n')
console.log(`wrote main.scene.json's ${made.length} kinds and ${actors.length} actors of the yard's stations, and demo_motion3d.json's car and pool`)
