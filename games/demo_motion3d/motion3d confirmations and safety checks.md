# motion3d confirmations and safety checks

Every activity the yard offers motion3d (`assets/xbot.motion3d.json`, played as `player.sim.ts` picks), and what each must do right
(confirmations) and must never do (safety checks). Each is checked on the dev page's station for it
(`dev.html`, the stations panel): the station puts the body down before it, the playtester plays its
keys, and every check is a number measured on a step and a close-up screenshot of that step, the camera
on the thing checked, the number written on it.

- ☑ measured on the page and passing
- ☒ measured on the page and failing
- ☐ not checked on the page yet

"The test" is `demo_motion3d.sim.test.ts`, which checks some confirmations in node, without a screenshot.

## Safety checks: every activity

Each is checked on every step of every station's run. The limits are the dev page's (`LIMITS`).

| ☐ | Check | Fails when | Why that limit |
|---|---|---|---|
| ☐ | Feet through the floor | the lowest toe more than 5 cm under the ground under it | walking's own stride dips it 1.6 cm under; ankle-deep is about 8 cm |
| ☐ | Handed back in the air | the lowest toe more than 5 cm over the ground on the step the body goes back to walking | standing still stands it 3.3 cm over |
| ☐ | Dropped after an activity | off the ground more than 0.1 s after going back to walking | a body handed back on its feet settles the last 2.5 cm in a step or two |
| ☐ | A fall that slows in the air | the hips' fall slows by more than 1 m/s within 0.2 s, while no hand or foot is planted on anything and the toes are 5 cm or more over the ground | nothing in the air slows a fall |
| ☐ | A jolt | the hips' speed changes by more than 1 m/s in one step | not yet set from a clean run: a clip's own hips change by up to 1.7 m/s a step (the backflip), so this limit is too low and flags clean clips |
| ☐ | A pinned hand or foot that can't reach | motion3d's bend leaves a hand or foot pinned wholly to its point more than 2 cm short of it | |

Known faults in how the page measures, to be fixed before its numbers are trusted:

- ☒ The seated clips (chair, desk, car) read 38–43 cm of feet under the floor, and the chair looks solid
  on screen, so the reading of a seated pose is wrong somewhere.
- ☒ A dive into water reads as a fall slowing in the air (the pool, 8.3 m/s): the water is not ground.
- ☑ The ground under a body drawn on a raised top (the wall's top, the pool's far deck, the swing's
  platform) was read at the root's height and missed the top; it is now read at the toes' height. Not run
  again since.

## walk (everywhere)

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☑ | The feet stay on the ground in the stride | walking on the flat | lowest toe no more than 2 cm under | measured: 1.6 cm under at worst |
| ☒ | Stepping up onto a step is smooth | the edge station, onto its step and the block | no jolt in the hips | measured: hips jolt 7.6 m/s and the feet 14 cm under, walking up the step and the block |
| ☐ | Stands still at the end of a walk | the stick let go | the speed under 0.05 m/s within 3 s | measured on every station |

## party: backflip (pink zone)

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Plays where it stands | all through `backflip` | the body's place does not move | the test |
| ☐ | Lands on its feet where it started | `backflip`'s end | lowest toe within 2 cm of the floor | close-up on the feet |
| ☑ | Walks on after, on the ground | handed back to walking | lowest toe 2.7 cm over, 0 s off the ground | measured |

## sad: pick up (blue zone)

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Plays where it stands | all through `pickup` | the body's place does not move | the test |
| ☐ | The hand reaches the floor | the pick up's lowest point | the hand within a few cm of the floor | close-up on the hand |
| ☑ | Walks on after, on the ground | handed back to walking | lowest toe 2.7 cm over, 0 s off the ground | measured |

## cold: shiver (pale blue room)

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Shivers only standing still in the room | standing still on the mat | `coldrub` or `coldlook` played over walking | the test |
| ☐ | Walking ends it at once | the stick pushed | walking's own clips again, no layer | the test |
| ☐ | The feet stay put while it shivers | all through the shiver | the feet do not slide | close-up on the feet |

## ledge: the orange wall

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Jumps up and the hands land on the lip | `bracedjump`'s end | the wrists on the lip, within 1 cm | the test; close-up on the hands and the lip |
| ☒ | Hangs with both hands on the lip | `bracedidle` | both hands pinned wholly, on the lip | the test; measured: a hand 9.1 cm short of the lip as the hang starts |
| ☐ | Shimmies with the hands on the lip | `bracedleft`, `bracedright` | each gripping hand on the lip; no hand past the lip's end | the test |
| ☐ | Stops at the lip's end | the stick held to the end | stops with the leading hand at the end | the test |
| ☒ | Climbs up and stands on the top | `bracedclimb`'s end | the feet on the wall's top, the body walking there | the test (the root to 1 mm); measured: the feet 9.6 cm under the top as the climb ends and standing after, though the clip's ground matches the top to 4 mm, so the cause is elsewhere |
| ☒ | The hands stay on the lip while it climbs | `bracedclimb` | a pinned hand on the lip | measured: a hand 55 cm short of the lip at the climb's end |
| ☑ | Drops back down onto the floor | `braceddrop`'s end | lowest toe within 2 cm of the floor | the test; measured: handed back 0.0 cm over the floor (was 29.1 cm under), 3.6 cm under at the landing's deepest; close-up (of the drop 4.2 cm higher) at 6.10 s: the soles on the floor |
| ☑ | The hands let go cleanly as it drops | `braceddrop` | no pinned hand short of the lip | measured: no pinned hand or foot short in the drop (was 73.0 cm); close-up at 4.55 s: the hands on the wall's top as they let go |
| ☑ | Walks on smoothly after the drop | handed back to walking | no jolt | measured: no jolt from the drop on |

## bar: the left-right pole

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☑ | Jumps up and the hands land on the bar | `freejump`'s end, into `freeidle` | the wrists at the bar's height, within 1 cm | the test; close-up at 4.2 s: both hands round the bar, 0.0 cm short of it |
| ☐ | Moves along it to the end and back | `barmove`, `barleft` | stops at each end, no hand past it by more than 5 cm | the test |
| ☑ | Drops onto the floor | `freedrop`'s end | lowest toe within 2 cm of the floor | the test; measured: handed back 0.0 cm over the floor (was 15.8 cm under), 2.5 cm under at the landing's deepest; close-up (of the drop 3.9 cm higher) at 21.20 s: the soles on the floor |
| ☑ | The hands let go cleanly as it drops | `freedrop` | no pinned hand short of the bar | measured: no pinned hand or foot short in the drop (was 68.3 cm); close-up at 20.00 s: the hands at the bar as they let go |
| ☑ | Walks on smoothly after the drop | handed back to walking | no jolt | measured: no jolt from the hand-back on (1.5 and 1.6 m/s as the hands let go, the 1 m/s limit being too low) |

## ceiling: the slab

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Jumps up and the hands land on the ceiling | `freejump`'s end | the wrists on the ceiling's plane, within 1 cm | the test |
| ☐ | Moves across it to its side and back | `freeleft`, `freeright` | stops at each side, no hand past it by more than 5 cm | the test |
| ☑ | Drops onto the floor | `freedrop`'s end | lowest toe within 2 cm of the floor | the test; measured: handed back 0.0 cm over the floor (was 15.8 cm under), 2.5 cm under at the landing's deepest; close-up (of the drop 3.9 cm higher) at 20.80 s: the soles on the floor; at 19.60 s the hands at the ceiling as they let go |
| ☑ | Walks on smoothly after the drop | handed back to walking | no jolt | measured: no jolt from the hand-back on (2.1 and 1.1 m/s as the hands let go, the 1 m/s limit being too low) |

## rope

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Takes hold with the hands on the rope | `ropeclimb`'s start | the wrists within 10 cm of the rope across the ground | the test; close-up on the hands |
| ☐ | Holds still with the stick let go | stick let go | its height does not change | the test |
| ☐ | Climbs to the top | the stick held forward | the hands within 0.5 m of the rope's top | the test |
| ☒ | Falls and lands on its feet | let go, until standing | the landing starts as the feet touch the ground: no pop back up | measured: the hips jolt 12.3 m/s and are lifted on touchdown |
| ☐ | Walks on after, on the ground | after the landing | lowest toe within 2 cm of the floor | the test |

## swing: the rope swing

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | The hands hold the rope through the swing | `ropeswing` | the hands on the drawn rope | close-up on the hands |
| ☐ | Lands on the platform | `ropeswing`'s end | the feet on the platform's top | the test (to 1 mm) |
| ☒ | Walks on the platform after | handed back to walking | lowest toe within 5 cm over the platform | measured: handed back 0.3 cm over, then the feet 5.2 cm under the platform as it stands |

## climb: the climbing wall

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Takes hold with the hands and feet on the wall | `wallclimb`'s start | each planted hand and foot on the face | close-up on the hands and feet |
| ☐ | Climbs up with the stick forward, holds still without it | the stick | moves only while held | the test |
| ☐ | Stops at the top with the hands still on the wall | the top | stops short of the top | the test |
| ☐ | Climbs down with the stick back | `walldown` | moves down | the test |
| ☒ | Lets go, falls and lands on its feet | let go, until standing | the landing starts as the feet touch the ground: no pop back up | measured: the hips jolt 8.4 m/s and are lifted on touchdown |

## wallrun: the run wall

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | The kicks land on the wall's face | `wallside`'s kicks | each kicking foot on the face | close-up on the feet and the wall |
| ☐ | Runs along the wall | `wallside` | more than 2 m along it | the test |
| ☑ | Comes down onto the ground, not hanging in the air | `wallside`'s end into `land` | the root stays on the ground; `land` picks up where the hips are as low as the run ends them | measured: the root on the ground all through |
| ☑ | Walks on after, on the ground | handed back to walking | lowest toe 2.6 cm over, 0 s off the ground | measured; the test |
| ☒ | Goes from the run into the landing smoothly | the crossfade into `land` | no jolt | measured: hips jolt 3.7 and 4.5 m/s, at the crossfade's start and end |

## vault: the low wall

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | The palm lands on the wall's top | the vault's plant | the palm on the top | close-up on the hand and the wall |
| ☐ | Clears the wall | all through `vaultone` | no part of the body through the wall | close-up from the side |
| ☒ | Lands beyond it on the ground | `vaultone`'s end | beyond the wall; lowest toe within 2 cm of the floor | the test; measured: handed back with the feet 7.8 cm over the floor |
| ☒ | The feet stay out of the floor | all through `vaultone` | lowest toe no more than 5 cm under | measured: the feet 8 cm under the floor early in the vault |

## edge: the block

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Teeters with the ankles at the edge | `teeter` | the ankles at the edge, within 1 cm | the test; close-up on the feet and the edge |
| ☑ | Steps down onto the ground in front | `jumpdown`'s end | in front of the block; lowest toe within 2 cm of the floor | the test; measured: handed back 0.3 cm over the floor (was 13.9 cm over), no fault in the step down; close-ups (of the drop 2.4 cm higher, the block as much higher) at 4.70 s: the feet on the block's top, and 8.10 s: the soles on the floor |
| ☐ | Steps back off the edge with the stick back | the stick back | walking again on the top | not in the station's script yet |

## stairs

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Each foot lands on a step | `stairsup`, a lap at a time | each planted foot on a step's top | close-up on the feet and the steps |
| ☐ | Stands while the stick is let go | the stick let go | no movement | the station |
| ☒ | Walks onto the landing at the top | the top | on the landing; lowest toe within 5 cm over it | measured: handed back with the feet 27.1 cm over the landing |

## pool

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Falls in from the deck's edge | `poolin` | starts with the feet on the deck | close-up on the feet and the deck |
| ☐ | Floats with the hips on the water | `tread` | the hips on the water, within 1 cm | the test |
| ☐ | Swims to the far wall | `swimunder` | stops at the far wall | the test |
| ☒ | Climbs out onto the far deck | `bracedclimb`'s end | the feet on the far deck, within 1 cm | the test; measured: a hand 54 cm short of the lip at the climb's end; the feet 9.6 cm under the deck standing after, as on the wall |

## desk

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Sits with the hips on the seat | `typing` | the hips on the seat, within 1 cm | the test; close-up from the side |
| ☐ | The hands on the desk as it types | `typing` | the palms on the desk's top | close-up on the hands |
| ☐ | The feet on the floor as it sits | `typing` | lowest toe within 2 cm of the floor | measurement in doubt (seated) |
| ☐ | Stands up beside the chair | standing | at the chair's side | the test |
| ☒ | Sits and stands smoothly | the crossfades in and out | no jolt | measured: hips jolt 4.9 to 5.1 m/s at the crossfades |

## bed

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Lies down with the hips where it lies | `liedown`'s end, `bedidle` | the hips on the bed's point, within 1 cm | the test; close-up from the side |
| ☐ | The body lies on the bed, not in it or over it | `bedidle` | the back on the bed's top | close-up from the side |
| ☐ | Gets up at the bed's foot | getting up | at the foot | the test |
| ☒ | Lies down and gets up smoothly | the crossfades | no jolt | measured: hips jolt 5.3 to 6.3 m/s at the crossfades |

## car

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Gets in with the hips on the seat | `carin`'s end | the hips on the seat, within 1 cm | the test |
| ☐ | Drives with the hips on the seat and the hands on the wheel | `drive` | the hips on the seat, the wrists on the wheel | the test (the hips) |
| ☐ | Honks | `honk` | plays and goes back to driving | the test |
| ☒ | Gets out onto the ground | `carout`'s end | lowest toe within 2 cm of the floor | measured: handed back with the feet 6.2 cm over the floor |

## chair

| ☐ | Confirmation | When | Passes if | How |
|---|---|---|---|---|
| ☐ | Sits with the hips on the seat | `seated` | the hips on the seat, within 1 mm | the test; close-up from the side |
| ☐ | The feet on the floor as it sits | `seated` | lowest toe within 2 cm of the floor | measurement in doubt (seated); looks solid on screen |
| ☐ | Stands up and walks on | `standup`'s end | walking, on the ground | the test |
| ☒ | Sits and stands smoothly | the crossfades | no jolt | measured: hips jolt 4.1 to 5.0 m/s sitting down; 10.5 m/s walking off after standing |
