# demo_motion3d

The demo of motion3d (`plugins/motion3d`): an X Bot on a checkerboard yard, and stations where the use
key does what each offers: hang, shimmy, climb, swing, vault, sit, lie down, swim and drive. Anywhere,
it draws nine weapons (a great sword, a sword and shield, a sword, an axe, a rifle, a pistol, a bow, a
torch and magic), each a stance of its own clips, with light and heavy attacks chained from an input
buffer, blocks, rolls, jumps, hits and deaths: `assets/MOVES.md` is every clip of the library by what is
held, the buttons, and what the motion file cannot say yet.

## Playing it

`yarn dev`, then `localhost:5173/games/demo_motion3d/index.html`, or `dev.html` for the testbed, whose
panel tunes motion3d's settings and whose readout shows what the body is doing. Against its server:
`yarn serve demo_motion3d`, then `localhost:5173/games/demo_motion3d/client.html`.

- W A S D walk, Shift run, Space jump, right drag look, wheel zoom. E is use; away from a station, E
  rolls.
- The weapons, the same buttons in every stance (`assets/MOVES.md` has the gamepad's too): G draws and
  puts away, Q switches to the next, F held blocks (or aims a gun or the bow) and strafes facing the
  camera, J or a left click is the light attack (again as it strikes chains the next), K heavy (after a
  light, the finisher), L special, R skill, T taunt, H takes a hit, X dies and gets up, E rolls.
- Near the start: in the pink zone E plays a backflip, in the blue zone it picks something up, and on
  open ground it steps back. Under the orange wall's lip, E jumps up and hangs from it; A and D
  shimmy along the lip until the hands would leave it, W + E climbs up onto the wall's top, S + E drops
  back down. In front of the chair, E sits down in it; E again stands up.
- The first row past the wall: stand still in the pale blue cold room and the body rubs its shoulder
  and looks about; under the bar E jumps up and hangs, A and D move along it, E drops; at the rope E
  takes hold, W climbs and letting go of W holds on, E lets go; at the rope swing E swings onto the
  platform; at the climbing wall E takes hold, W climbs up, S down, E lets go.
- The second row: at the run wall E runs along it, falls and lands; at the low wall E vaults it; up the step onto the
  block, at its front edge E teeters, E again steps down off it, S steps back; at the foot of the
  stairs E climbs them while W is held; along the landing to the pool's edge, E falls in, W swims to
  the far wall, E there climbs out; at the desk E sits and types, E again stands up.
- The third row: under the ceiling E jumps up and hangs, A and D move across it, E drops; at the
  bed's foot E lies down, E again gets up; at the car's door E gets in, W A S D drive, Space honks,
  E gets out.
- The fourth row: at the beam's near end E steps up onto it, W sneaks along it, E steps off.
- Gamepad: left stick walk, right stick look, L3 run, ✕/A jump, □/X use or roll, △/Y switch, R3 draw,
  L1/LB guard, R1/RB light, R2/RT heavy, ○/B special, L2/LT skill, d-pad left hit, right taunt, up and
  down zoom, Options die, Share the cup.

## How it is made

- The seat's `player` row is the X Bot. Its rule (`player.sim.ts`) picks what the body does each step:
  walking, kinematics3d moves it by motion3d's `move` (`motion3d.kinematics3d.ts`) across terrain3d's
  `triangles` (`terrain3d.kinematics3d.ts`), the land, round the yard's things (shapes3d's solids,
  `shapes3d.kinematics3d.ts`) and onto what it climbs, as fast as the clip it plays carries it; the
  motion file picks `stand`, `walk`, `run`, `jump`, `fall` or `land`, which motion3d plays, jumping
  and falling by motion3d's `jump` and `fall`; in a station's activity, the motion file picks each
  motion and the point it plays against, and motion3d holds the body there, kinematics3d moving it along
  a lip, a rope, a wall, the beam or the water by the same `move`, turning it under the ceiling and in
  the water. Its `press` act holds every key in its input buffer and hands it to motion3d once a move
  may play it: an attack's next is held until the one playing has struck, a key during a draw until
  the draw is done (the definition's `buffer`). The guard key is held, not pressed: each step it is
  held the rule presses `guard`, else `unguard`.
- The stances are moves of the `walk` activity: a weapon's draw plays over the upper half and ends in
  a move of the weapon's name that holds its carry (the prop in the hands, `carries`); every move of
  the stance's own (`<weapon>stand`, `walk`, `run`, `guardwalk`, `block`, the attacks, the rolls) plays
  `from` that move. The props are boxes and cylinders, `assets/props.mjs`. The yard's `guard` and
  `near` states (`plugins/yard/yard.kinematics3d.ts`) are the guard key held and a station in reach,
  so E rolls only away from one.
- What the X Bot can do is its motion3d file, `assets/xbot.motion3d.json`: every activity, its motions,
  the clips each plays and the kind of point it plays against. motion3d's numbers are `world.motion3d`
  in `main.scene.json`: the X Bot's `anywhere` is `walk`, its spaces are shapes3d's
  (`shapes3d.motion3d.ts`), and `ease` is how long a planted hand or foot's pin eases in and out.
  kinematics3d's numbers are `world.kinematics3d.kinds.xbot`: `triangles` (the body against the land
  and its solids), `move` (how fast its speed and facing ease) and `fall` (gravity and the jump).
- The spaces are shapes3d kinds that name the activity they offer and stand in nothing's way; the
  things they are by (walls, the bar, the steps, the chair, the bed, the car's parts) are solid shapes
  of their own. Each space's points are where its motions hold the body: the `Lip` line where the
  wrists hang, a `Seat` point where the hips sit, the `Face` plane of the climbing wall, the
  `Ceiling` plane turned face down, the pool's `Float` plane, the stairs' `Flight` line, the beam's
  `Beam` line where the ankles walk.
- The hands and feet each clip's spot names are bent onto their points by motion3d while the bake says they are
  planted, so a hanging body's hands stay on the lip as it sways.
- Every station past the wall and the chair is sized and placed to its clips by `assets/yard.mjs`,
  from what the bake measures of each clip (`assets/xbot.rig.baked.json`), as demo_walker's yard is:
  the bar at the height `freejump` ends the hands holding, the rope swing's beam where its swing hangs
  from, the climbing wall's face where `wallclimb` holds the hands and feet, the run wall's and the
  vault's starts where their kicks and palm land, the edge where `teeter` stands the toes, the steps
  half a lap of `stairsup` each, the pool's deck as high as `poolin` starts the feet, the chair and the
  table where `typing` sits and types, the bed as high as `liedown` lies, the car's seat where `carin`
  sits, the beam's line where `sneakwalk` stands the ankles over its top. The lip by the wall and the chair are written by hand: the lip is where `bracedjump` ends the
  wrists, 2.154 m up; the wall's top is 0.218 m over it, where `bracedclimb` ends the feet; the seat is
  where `seated` holds the hips, 0.61 m up.
- The car is the game's own `car` kind (`car.sim.ts`): it makes its parts and its space, drives by its
  driver's stick, and stands them about it every step, so a body in its seat goes where it goes; the
  page draws the body on the seat as it draws the car (the game's own `yard` plugin's `object`,
  `plugins/yard/yard.motion3d.ts`).
- `yard`'s page half (`plugins/yard/yard.plugin.ts`) draws the swing's rope and the pool's water.
- The X Bot, its clips, their measures and offsets and the yard are baked by `yarn bake demo_motion3d`
  (`assets/demo_motion3d.bake.ts`): the clips of `assets/xbot.rig.json` onto the library's
  `characters/xbot/xbot.fbx` as `assets/xbot.glb`; what the bake measures of each clip,
  `assets/xbot.rig.baked.json`; the yard's stations (`yard.mjs`); each clip's spot (its sidecar,
  `<clip>.motion3d.json` beside its FBX in `~/troupe-collection`) and offsets,
  `assets/xbot.motion3d.baked.json`; and the checkerboard `assets/checker-1024.webp`.

## Credit

The X Bot and its clips are Mixamo's (Adobe), from the library's `characters/xbot` and
`~/troupe-collection/packs`.

## Tests

`yarn vitest run games/demo_motion3d/demo_motion3d.sim.test.ts`: a seat walks into each zone and
presses use; hangs from the lip, its drawn hands steady through every change of motion and bent onto
the lip, shimmies to its end and climbs onto the top; drops back down; sits in the chair; shivers in
the cold room; hangs from the bar and the ceiling and moves along them; climbs the rope and the wall;
swings onto the platform; runs along the wall; vaults; teeters at the edge and steps down; climbs the
stairs, falls into the pool, swims across and climbs out; sits at the desk; lies on the bed; and gets
into the car, drives it, honks and gets out; draws the rifle, aims it with the guard held, strafes and
puts it away; switches while a draw plays, the switch held until it is done; and draws every weapon in
turn, standing and walking on its own clips, chaining its lights from the buffer, stepping back, taking
a hit and jumping in each.
