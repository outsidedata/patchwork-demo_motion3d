---
name: checking-a-motion
description: Use in demo_motion3d whenever Bill says one of the yard's interactions (an activity, a station, a motion - the bar, the wall run, the climbing wall, the drop, the landing) looks wrong, pops, floats, sinks, hangs in the air, has its feet through the floor, or snaps; when he adds a new interaction; or when he asks to check one. It is the loop that finds what is wrong with a number, shows it in a close-up screenshot, fixes it, and proves it fixed.
---

# Checking a motion

Bill names an interaction. That one is the job: its station, its rows of the checklist, nothing else.
What he says is wrong is wrong; the numbers say where and when.

The checklist is `motion3d confirmations and safety checks.md` in the game: for each activity, what it
must do (confirmations) and the safety checks every activity is held to. The dev page (`dev.html`) runs
each interaction as a station: it puts the body down before it, the playtester presses the keys, and
every step is measured.

Every command below is one plain command. The scripts are beside this file.

## The loop

1. **Serve.** `yarn dev` in the background; read the port it prints.
2. **Run its station.** `node games/demo_motion3d/.claude/skills/checking-a-motion/stations.mjs <port> "<station>"`
   Prints whether the script ran through, every fault with its time, the worst of each measure, and
   each hand-back to walking. The station names are the page's `STATIONS` (the stations panel); the
   script lists them when a name is wrong.
3. **Look at the moments.** For each fault, and each confirmation in the checklist, say what is expected
   there, then shoot just that, every moment of the station in one call (the station runs once):
   `node games/demo_motion3d/.claude/skills/checking-a-motion/look.mjs <port> "<station>" <scratchpad>/<name> <seconds> <part> "<what is expected>" [<seconds> <part> "<what is expected>" ...]`
   `<part>` is `feet`, `hands`, `hips` or `head`; the camera closes in on it at that moment, with the
   expectation and the measured numbers written across the top, and writes `<name>-1.png`, `-2`, ...
   Read every png. Pick the moment from the timeline of step 2's faults or the clip's measures (a clip
   that ends a jump is not on the bar until its end). A shot that does not show the thing (a post in
   the way, the camera under the floor) is taken again from another side, `hands@120` (degrees round
   from the way the body faces, to its left), before anything is said about it.
4. **Find the cause in the code and the rig's measures.** How motion3d places a held body is its
   header's Offsets and Tilt: each clip has a `beginOffset` and an `endOffset`, where the clip's spot
   (hands on a bar, hips on a seat, feet against a wall; the root with none) stands from the point at
   the clip's first frame and at its last, and the body is placed by those two alone. The offsets are
   in `assets/xbot.motion3d.baked.json`'s `offsets.xbot`, written by motion3d's step of the bake
   (`plugins/motion3d/motion3d.offsets.ts`) from the clip's measures (`assets/xbot.rig.baked.json`) and
   its sidecar (`<clip>.motion3d.json` beside its FBX): which spot matters, and whether the clip is on
   the point at its start, its end, all through, or measured against the wall its hands or feet are on.
   The clip analyzer shows any clip raw, with its measures and its offsets under any judgement:
   `node --experimental-strip-types plugins/motion3d/scripts/clipanalyzer.ts`, at the address it prints.
   The points, and each point's `normal` (the way the thing faces out), are written by
   `assets/yard.mjs`. The activity is `assets/xbot.motion3d.json`, and which motion and point the game
   picks is `player.sim.ts`. What a clip does is
   `node games/demo_motion3d/.claude/skills/checking-a-motion/clip.mjs <clip>` (the toes, hips and
   hands frame by frame, and what it plants). The cause is arithmetic on those numbers, written down:
   a wrong spot or end in a clip's sidecar, a point in the wrong place or facing the wrong way, or a missing
   normal. Never an offset typed by hand, and never a point moved to make up for one.

   Tilt. A clip measured against a wall (`on: 'face'`) carries that wall's `normal` in its offsets, the
   way the wall faced the body when the clip was made. Held to a point whose `normal` is another way,
   the body is leaned about its root by the turn between the two: on a slab leaning back 20°, the
   climber leans 20° onto it. The row carries it as `tilt`, eased in with the root as the clip fades in
   and eased out as the body is handed back to walking; the page draws it, and `dev.html` measures the
   hips and toes with it. A body leaning the wrong way, or not leaning, is the point's `normal` in
   `yard.mjs` (missing, or not out of the thing toward the body) or the clip's sidecar (not
   `on: 'face'`, so measured against straight up); a body that stays leaned after it lets go is the
   ease-out. A clip held to a wall and not measured against one takes the wall clip's normal through
   `after`.
5. **Fix it in the game.** Fix the clip's sidecar (`<clip>.motion3d.json` beside its FBX in
   `~/troupe-collection`) or the point in `yard.mjs`, then run `node games/demo_motion3d/assets/yard.mjs` and
   `node --experimental-strip-types plugins/motion3d/motion3d.offsets.ts games/demo_motion3d/assets/xbot.rig.json games/demo_motion3d/assets/xbot.motion3d.json`,
   and `git -C games diff demo_motion3d` must show only the change meant. Never in core's plugins
   without asking Bill first (prime-directive).
6. **Run step 2 and step 3 again** until the station has no faults and every confirmation's shot shows it.
7. **Pin it.** Add the confirmation to that station's test in `demo_motion3d.sim.test.ts` and run that
   one test: `yarn vitest run games/demo_motion3d/demo_motion3d.sim.test.ts -t "<words of its name>"`.
   Never the whole file or the suite.
8. **Mark the checklist.** ☑ or ☒ in the row, with the measured number and the moment of its shot.
9. **Report** in two or three sentences: what was wrong, the number before and after, the screenshot.
   Stop the dev server.

## A new interaction

Before anything else: its rows in the checklist (each confirmation: when, passes if, how), and its
station in `dev.html`'s `STATIONS` (where the body is put down, the stages the playtester plays, the
camera). Then:

1. Look at the clip raw in the clip analyzer first (it bakes a troupe clip onto the xbot itself), and
   pick its judgement there: the spot that matters, and how it meets its point.
2. Write that judgement as its sidecar, `<clip>.motion3d.json` beside its FBX. A new wall run is
   `{ "spot": ["LeftFoot", "RightFoot"], "on": "face", "facing": "along" }`; a new climb
   `{ "spot": ["LeftHand", "RightHand", "LeftFoot", "RightFoot"], "on": "face", "facing": "into" }`;
   a new hang `{ "spot": ["LeftHand", "RightHand"], "on": "both" }`; a new sit-down
   `{ "spot": ["Hips"], "on": "end" }`. Give its activity and motion in `assets/xbot.motion3d.json`,
   and its point and `ik` in `player.sim.ts`'s `AIMS`, naming the same bones.
3. Bake (`yarn bake demo_motion3d`): the clip's measures go into `xbot.rig.baked.json`, its spot and
   offsets for each body into `xbot.motion3d.baked.json`.
4. Give its space a point in `assets/yard.mjs` from a shapes3d shape: a point, a line or a plane, with
   a `normal` where the thing faces anything but straight up (a wall faces out of it). A clip measured
   once works on any point of that kind, turned or tilted any way: the offsets are in the point's frame.
5. Run `yard.mjs`, then the loop.

## What the checks catch (`dev.html`'s `LIMITS`)

- the feet more than 5 cm through the floor
- handed back to walking with the feet more than 5 cm in the air, or off the ground more than 0.1 s after
- a fall that slows in the air with nothing holding the body
- a jolt: the hips' speed changing by more than 1 m/s in one step (too low as it stands: clean clips
  reach 1.7 m/s; set it from clean runs)
- a pinned hand or foot more than 2 cm short of its point

The checklist's "Known faults in how the page measures" lists readings not to trust yet (seated poses,
water). A number the page cannot be trusted on is fixed in the page first.
