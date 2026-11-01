# The X Bot's moves

Every clip pack in the library (`~/troupe-collection/packs/`), grouped by what the body holds. Paths
are under `packs/`; `30FPS` packs are the ones the rig bakes (each pack also has a 60 FPS twin of the
same names). A name in **bold** is a clip of `xbot.rig.json`, the name it has there; the rest are in
the library and not in the rig.

## The buttons

The same in every stance. The keys are the player's definition's `keys` (`demo_motion3d.json`); the dev
page's readout prints this table from them.

| Keyboard | PlayStation / Xbox | Does |
|---|---|---|
| W A S D | left stick | walk the way the camera looks |
| mouse right drag | right stick | look |
| Shift | L3 | run (held) |
| F | L1 / LB | guard (held): block, or aim the rifle, pistol or bow; the body faces the camera and strafes |
| Space | ✕ / A | jump, each stance its own |
| E | □ / X | roll: running dives, guarding dodges the stick's way, moving rolls, standing steps back; in a space (a station), use it |
| Q | △ / Y | switch weapon: put this one away and draw the next; with nothing drawn, pick the next |
| G | R3 | draw the weapon, or put it away |
| J, left click | R1 / RB | light attack; pressed again as it strikes, the next of the chain; aiming, fire |
| K | R2 / RT | heavy attack; after a light, the finisher; running, the running heavy |
| L | ○ / B | special (a kick, a spell, a bow block) |
| R | L2 / LT | skill (power up, reload, kneel, light the torch, cast, power shot) |
| T | d-pad right | taunt |
| H | d-pad left | take a hit; guarding, a blocked hit |
| X | Options / Menu | die, then get up |
| C | Share / View | pick up or put down the cup |
| | d-pad up / down | camera nearer / further |

Input buffering (`player.sim.ts`): a key pressed is held for `buffer.hold` seconds (0.4) until a move
can play it. While an attack, roll or hit plays, a key waits, without its seconds counting, until that
move has played the share of itself `buffer.cancel` gives (a light into the next light at 45%, a roll
out of a light at 30%, anything out of a death never). While a draw, put-away or shot plays on the upper
half, a key waits until it ends. So a light pressed three times during the first swing plays the
whole chain, each swing as the one before strikes. A switch pressed mid-draw switches once the draw is up.

## The stances

Drawing a weapon puts the body in its stance: the upper half holds the weapon's carry (`carries` in
`xbot.motion3d.json`), and the body plays that stance's own idle, walk, run, guard strafe, block, jump,
rolls, attacks, hit and death (`walk` activity, each move `from` the stance). Unarmed jumps as it always
has. Each stance's moves, by motion name in `xbot.motion3d.json` (`<weapon><move>`):

| Stance | Prop | Idle / walk / run | Guard: strafe, block | Light chain → finisher | Heavy, running light / heavy | Special, skill, taunt | Rolls | Jump | Hit, death |
|---|---|---|---|---|---|---|---|---|---|
| unarmed | – | idle, walk, run | 4-way walk and run strafes; Center Block | jab → cross → hook; uppercut → hurricane kick | roundhouse | flying kick (moving), MMA kick; fireball; taunt | quick roll, sprint roll, 4-way boxing steps, step back | jump | head hit; dying backwards → get up |
| greatsword | greatsword | gsidle, gswalk, gsrun | 4-way walk and run; block in, idle, out | slash, short slash, low slash → high spin | lunging power slash; jump attack, slide attack | spin kick; power up; strike a pose | unarmed's | great sword jump | unblocked and blocked impact; two-handed death |
| swordshield | sword | ssidle, sswalk, ssrun | 4-way walk and run; block in, idle, out | cross, downward, power slash → slash combo | high attack; jump attack, low attack | Sparta kick; power up; sword play | unarmed's | sword and shield jump | unblocked and blocked impact; death |
| sword | sword | sword and shield's idle and walk, Run With Sword | sword and shield's | outward, inward, thrust → one-hand combo | slash advance; thrust, jump attack | kick; casting; sword play | unarmed's | sword and shield jump | sword and shield's |
| axe | axe | axidle, axwalk, axrun | 4-way walk, forward and back run; block idle | horizontal, backhand, downward → three-hit combo | 360 high; 360 low, run jump attack | kick; battlecry; chest thump | unarmed's | axe jump | gut react; Dying (7) |
| rifle | rifle | rfidle, riflewalk, sprint | guard aims: the 8-way walk and run strafes, aim pitched by the camera | aimed: fire; not aimed: butt punch | bayonet stab | turn and kick; reload (aimed or not); signal | dive roll, running dive roll, step back | jump up, jump loop, jump down | hit holding rifle; death from the front |
| pistol | pistol | ptidle, ptwalk, ptrun | guard aims: 4-way walk and run | aimed: fire; not aimed: pistol whip | roundhouse | MMA kick; kneel / stand; idle fidget | unarmed's | pistol jump | hit holding pistol; dying backwards |
| bow | bow | bwidle, bwwalk, bwrun | guard aims: the 4-way aim walk | aimed: loose → nock; heavy aimed: overdraw → loose | not aimed: punch, kick | bow block; power shot; examine | dodge forward and back, dive | jump, fall A loop, land | react small; death backward |
| torch | torch | tcidle, tcwalk, tcrun | 4-way walk and run (no block clip) | left-right, left-right, stab → two-hit combo | two-hit combo; stab, two-hit combo | burn webs; light the torch; inspect upward | unarmed's | torch jump | unarmed's |
| magic | wand | mgidle, mgwalk, mgrun | 4-way walk and run; block start, idle, end | 1H attacks 1 → 2 → 3 → 2H attack 5 | 2H attack 1; 1H attack 1, area attack 1 | area attack 2; 2H cast; idle 03 | unarmed's | jump, land | react large front; death backward |

The props (`props.mjs` writes each from boxes and cylinders; `grip` where the hand closes, `second`
where a two-handed grip's other hand closes): greatsword (both hands), sword, axe, pistol (both hands),
bow (left hand), torch (left hand), wand. `shield.glb` is made and is not carried (Needs).

## Needs

What the motion file cannot say as it stands; the rest was built.

1. **A carry of more than one prop.** A carry holds one prop, so sword and shield holds the sword and
   its shield arm is empty. Needed: a carry with several props, each on its own anchor, or two carries
   at once (the body's move's and the upper half's both drawn).
2. **A one-shot that takes the whole body from a held upper half.** While an aim is up (a loop played
   over the spine), a whole-body one-shot (a roll, a hit, a death) plays under it, its upper half still
   aiming. Needed: a move that lets the upper half go for its length and takes it back after. Until then
   the rifle, pistol and bow roll only with the aim down.
3. **Holding a one-shot's last frame.** A death plays out and then must play its `then`; nothing holds
   the body down until a key. Needed: a one-shot that holds its last frame until a key or a state. Here
   each death goes straight to its get up.
4. **A move picked by the way the stick points from the body.** A dodge's clip is the one that goes the
   way the stick pushes, the stick read from the camera. Guarding, the body faces the camera so it is the
   same; a press with the body turned any other way picks from the camera's frame.
5. **A clip played backwards.** The torch and magic packs have a draw and no put-away; a draw played
   backwards would be one. The put-away is instant, the prop let go.
6. **A move that ends the moment its clip strikes.** A combo's cancel point is the game's number per key
   (`buffer.cancel`), not where the clip's blow lands, which the bake measures (`segments.<limb>.peak`
   in `mixamo-measures.json`). Needed: the move's own strike time, read from the bake, for the buffer.
7. **A blocked hit, a hit from a side, a death from a side, picked by where the blow came from.** No
   rule hits the body; the hit key plays the front one.

## Stations a move would need

Moves in the library that play against something in the world, which the yard does not have yet:

| Moves | Clips | Station |
|---|---|---|
| cover: stand to cover, cover idle, sneak along, peek, cover to cover | Action Adventure Pack: `stand to cover`, `left/right cover sneak`, `cover to stand`; mixamo-motions: `Cover Idle`, `Stand Cover To Look`, `Crouch Cover To Cover`, `Standing Cover To Cover`, `Left/Right Cover Sneak W- Rifle` | a waist-high and a full-height wall, a line along each |
| ladder | `Climbing Ladder`, `Start Climbing Ladder`, `Climbing To Top` | a ladder, a line up it |
| prone and crawl | `Crouch To Prone`, `Prone Idle`, `Prone Forward`, `Crawl Forward`, `Low Crawl`, `Prone Firing Rifle`, `Prone Roll` | a crawl space: a low ceiling over a plane |
| sitting variations | Sitting Pack: 39 clips (clapping, cheering, talking, typing) | the chair, its own layer (a space offering `idle` while seated) |
| doors, levers, buttons | `Open Door Outwards`, `Opening Door Inwards`, `Pulling Lever`, `Button Pushing`, `Entering Code` | a door and a panel, a point each |
| pushing and pulling | `Push Start`, `Pushing`, `Push Stop`, `Pull Heavy Object Start/Stop` | a crate on the ground, a plane on its side |
| boxes, wheelbarrow | Farming Pack: `box idle`, `box walk arc`, `wheelbarrow walk`, `wheelbarrow dump` | a crate to lift and a wheelbarrow: each a carry of its own |
| fishing, golf, soccer | Singles `Fishing Cast/Idle`; Golf Pack (20); Soccer Game Pack (54) | a jetty, a tee, a goal and a ball |
| hanging moves beyond the lip | `Braced Hang Hop Left/Right/Up`, `Free Hang Hop Left/Right`, `Braced To Free Hang`, `Free Hang To Braced`, `Freehang Climb` | lips spaced a hop apart |
| wall jumps and vaults | `Jump From Wall`, `Sprint To Wall Climb`, `Vault Over Box`, `Jump Over` | a wall to kick off, a box to vault |
| a second body | `Shoulder Throw, Aggressor/Victim`, `Double Leg Takedown - Attacker/Victim`, `Hostage Situation`, `Being Carried`, `Shaking Hands 1/2`, `Sword Fight One (2)` | a second X Bot, held to the first |
| stairs down, running up | Singles `Descending Stairs`, `Running Up Stairs` | the stairs, its line both ways |
| swimming more | `Swimming To Edge`, `Treading Water` (Singles) | the pool |

## The library, by what is held

### Unarmed

- Idles: Male Locomotion `idle.fbx` (**idle**); Action Adventure `idle` (2)–(5); Basic, Female, Female
  Basic, Free Test, Locomotion: `idle.fbx`; mixamo-motions `Idle` (2)–(17), `Breathing Idle`, `Happy
  Idle`, `Sad Idle`, `Neutral Idle`, `Standard Idle`, `Warrior Idle`, `Ready Idle`, `Offensive Idle`,
  `Unarmed Idle 01`; Pro Melee Axe `unarmed idle.fbx`, `unarmed idle looking ver. 1/2.fbx`.
- Walk, 4-way: Male Locomotion `walking.fbx` (**walk**), `left strafe walking.fbx` (**uawalkleft**),
  `right strafe walking.fbx` (**uawalkright**); Pro Melee Axe `unarmed walk back.fbx` (**uawalkback**),
  `unarmed walk forward.fbx`. Others: Basic, Free Test, Locomotion, Female packs `walking`, strafe walks;
  mixamo-motions `Walking` (2)–(22), `Walking Backwards`, `Walk Strafe Left/Right`, `Walk Forward Left/Right`,
  `Walk Backward Left/Right`, `Walk Left/Right`, `Sneak Walk`, `Strut Walking`, `Swagger Walk`,
  `Old Man Walk`, `Sad Walk`, `Happy Walk`, `Drunk Walk`, `Injured Walk`.
- Run, 4-way: Male Locomotion `standard run.fbx` (**run**), `left strafe.fbx` (**uarunleft**), `right
  strafe.fbx` (**uarunright**); Pro Melee Axe `unarmed run back.fbx` (**uarunback**), `unarmed run
  forward.fbx`; Action Adventure `running`, `run to stop`; Locomotion `running`; mixamo-motions `Running`
  (2)–(9), `Fast Run`, `Medium Run`, `Slow Run`, `Sprint`, `Sprint Forward/Backward/Left/Right` and the
  diagonals, `Run Forward/Backward/Left/Right` and the diagonals, `Run Backwards` (2)–(5), `Jogging`,
  `Jog Forward/Backward/Strafe Left/Right`.
- Turns: Male Locomotion `left/right turn 90`; Basic `left/right turn 90`; Action Adventure `left/right
  turn`; Pro Melee Axe `unarmed turn left/right 90`; mixamo-motions `Left Turn` (2)–(9), `Right Turn`
  (2)–(12), `Quick 180 Turn`, `Running Turn 180`, `Walking Turn 180`.
- Rolls and dodges: mixamo-motions `Quick Roll To Run` (**uaroll**), `Sprinting Forward Roll`
  (**uadive**), `Stand To Roll`, `Dive Roll`, `Running Dive Roll`, `Run To Rolling`, `Falling To Roll`,
  `Dodging` (2) (3), `Dodging Back`, `Dodging Right`, `Jump Away`, `Aerial Evade`, `Corkscrew Evade`,
  `Evading A Threat`; Boxing `Long Step Forward` (**uastepforward**), `Step Backward`, `Short Step
  Forward`; mixamo-motions `Step Backward (2)` (**uastepback**), `Long Left Side Step` (**uastepleft**),
  `Long Right Side Step` (**uastepright**), `Medium/Short Left/Right Side Step`.
- Jumps: mixamo-motions `Jumping Up (2)` (**jump**), `Falling Idle` (**fall**), `Falling To Landing`
  (**land**), `Jump` (2)–(8), `Jumping` (2)–(13), `Big Jump`, `Running Jump`, `Forward Jump`, `Backward
  Jump`, `Jump Forward/Backward`, `Hard Landing`, `Landing`, `Joyful Jump`; Pro Melee Axe `unarmed jump`,
  `unarmed jump running`; flips: `Backflip` (**backflip**), `Front Flip`, `Front Twist Flip`, `Running
  Forward Flip`, `Run To Flip`, `Stylish Flip`.
- Attacks and combos: mixamo-motions `Lead Jab (4)` (**uajab**), `Cross Punch` (**uacross**), `Hook Punch`
  (**uahook**), `Uppercut` (**uauppercut**), `Roundhouse Kick` (**uakick**), `Hurricane Kick`
  (**uahurricane**), `Flying Kick` (**uaflykick**), `Mma Kick` (**uammakick**), `Punch Combo`, `Combo
  Punch`, `Quad Punch`, `Jab Cross` (2) (3), `Body Jab Cross` (2) (3), `Elbow Punch`, `Elbow Uppercut
  Combo`, `Knee Jabs To Uppercut`, `Flying Knee Punch Combo`, `Punch To Elbow Combo`, `Uppercut Jab`,
  `Kicking` (2)–(11), `Side Kick`, `Flip Kick`, `Spin Flip Kick`, `Flying Bicycle Kick`, `Drop Kick`,
  `Inside Crescent Kick`, `Leg Sweep` (2)–(4), `Headbutt`, `Back Flip To Uppercut`; Boxing `Jab Cross`,
  `Hook`, `Headbutt`; Capoeira Pack (39): `armada`, `au`, `bencao`, `chapa`, `martelo`, `meia lua`,
  `queshada`, `rasteira`, `esquiva 1`–`5` (dodges), `ginga` (stance walks).
- Blocks: mixamo-motions `Center Block` (**uaguard**), `Center Block (2)`, `Block`, `Blocking` (2),
  `Body Block`, `Inward Block`, `Outward Block`, `Left Block`, `Right Block`; fight idles: `Fight Idle`,
  `Bouncing Fight Idle`, `Mma Idle`, `Ninja Idle`, `Boxing` (2)–(10).
- Magic without a prop: mixamo-motions `Fireball` (**uafireball**), `Casting Spell`, `Magic Heal`, `Wide
  Arm Spell Casting`, `Two Hand Spell Casting`, `Spell Cast`.
- Hit reactions: Boxing `Head Hit` (**uahit**), `Rib Hit`, `Receiving An Uppercut`; mixamo-motions `Head
  Hit` (2)–(9), `Big Hit To Head`, `Hit To Body` (2)–(5), `Kidney Hit`, `Stomach Hit`, `Getting Hit`,
  `Getting Hit Backwards`, `Shove Reaction`, `Knocked Down`, `Knocked Out`, `Sweep Fall`.
- Deaths and getting up: mixamo-motions `Dying Backwards` (**uadeath**), `Dying` (**uadeathfront**),
  `Dying` (2)–(10), `Falling Back Death`, `Falling Forward Death`, `Flying Back Death`, `Death`; `Getting
  Up (3)` (**uagetup**, from the back), `Getting Up (4)` (**uagetupfront**, from the stomach), `Getting
  Up`, `Getting Up (2)`, `Kip Up`, `Stand Up`.
- Taunts and gestures: `Taunt` (**uataunt**), `Taunt` (2)–(5); Gestures Pack Basic (15); mixamo-motions
  waves, nods, cheers, dances (Breakdance Pack 34, hip hop, salsa, samba, swing, Thriller).
- Moods and bodies: Male Drunk Pack (12), Male Injured Pack (20), Not So Scary Zombie Pack (24), Scary
  Zombie Pack (12), Creature Pack (19), Creature NPC Pack (12): each its own idle, walk, run, turns,
  attacks and death, a stance of its own with nothing held.

### Two-handed sword (Great Sword Pack 30FPS)

- Idles: `great sword idle (3)` (**gsidle**), `great sword idle`, `(2)` (**gspose**), `(4)`, `(5)`.
- Walk, 4-way: `great sword walk` (**gswalk**), `walk (2)` back (**gswalkback**), `strafe (2)`
  (**gswalkleft**, measured going right), `strafe` (**gswalkright**, measured going left).
- Run, 4-way: `great sword run (2)` (**gsrun**), `run` back (**gsrunback**), `strafe (3)` (**gsrunleft**),
  `strafe (4)` (**gsrunright**).
- Turns: `great sword turn`, `turn (2)`, `180 turn`, `180 turn (2)`.
- Crouch: `great sword crouching` – `(6)`.
- Draw and sheath: `draw a great sword 1` (**gsdraw**), `2`; mixamo-motions `Sheath A Great Sword 1`
  (**gssheath**), `2`.
- Jumps: `great sword jump` (**gsjump**), `jump (2)`, `jump attack` (**gsjumpattack**).
- Attacks: `great sword slash (4)` (**gsslash1**), `slash` (**gscombo**), `slash (3)` (**gsslash2**),
  `slash (2)` (**gsslash3**), `slash (5)`, `high spin attack` (**gsspin**), `slide attack`
  (**gsslide**), `attack` (**gshilt**), `kick (2)` (**gskick**), `kick`; mixamo-motions `Two Hand Sword
  Combo`.
- Spells: `great sword casting`, `power up` (**gspowerup**), `spell cast`.
- Blocks: `great sword blocking` (**gsblockin**), `(2)` (**gsblock**), `(3)` (**gsblockout**), `impact`
  (**gsblocked**), `impact (4)` crouching.
- Hits and deaths: `great sword impact (5)` (**gshit**), `(2)`, `(3)`; `two handed sword death`
  (**gsdeath**), `(2)`.

### Sword and shield (Pro Sword and Shield Pack 30FPS; Sword and Shield Pack 30FPS; Lite)

- Idles: `sword and shield idle (4)` (**ssidle**), `idle`, `(2)` (**ssplay**), `(3)`.
- Walk, 4-way: `walk` (**sswalk**), `walk (2)` back (**sswalkback**), `strafe (2)` (**sswalkleft**),
  `strafe` (**sswalkright**).
- Run, 4-way: `run` (**ssrun**), `run (2)` back (**ssrunback**), `strafe (3)` (**ssrunleft**), `strafe (4)`
  (**ssrunright**).
- Turns: `turn`, `turn (2)`, `180 turn`, `180 turn (2)`. Crouch: `crouch`, `crouch idle`, `crouching`
  (2) (3).
- Draw and sheath: `draw sword 1` (**ssdraw**), `2`; `sheath sword 1` (**sssheath**), `2`.
- Jumps: `jump (2)` (**ssjump**), `jump` running.
- Attacks: `slash (5)` (**ssslash1**), `slash (2)` (**ssslash2**), `slash` (**ssslash3**), `slash (3)`
  crouch, `slash (4)` combo (**sscombo**), `attack` high (**sshigh**), `attack (2)` jump
  (**ssjumpattack**), `attack (3)` hilt (**sshilt**), `attack (4)` low (**sslow**), `kick` (**sskick**).
- Spells: `casting` (2) (**oscast**), `power up` (**sspowerup**).
- Blocks: `block` (**ssblockin**), `block idle` (**ssblock**), `block (2)` (**ssblockout**), `impact`
  (**ssblocked**), `crouch block`, `crouch block idle`, `crouch block (2)`.
- Hits and deaths: `impact (3)` (**sshit**), `impact (2)`; `death` (**ssdeath**), `death (2)`.

### One-handed sword (mixamo-motions)

- `Withdrawing Sword` (**osdraw**), `Sheathing Sword` (**ossheath**), `Draw Sword 1/2`, `Sheath Sword 1/2`.
- `Run With Sword` (**osrun**). No idle or walk of its own: sword and shield's.
- Attacks: `Stable Sword Outward Slash` (**osoutward**), `Stable Sword Inward Slash` (**osinward**),
  `Thrust Slash` (**osthrust**), `Slash Advance` (**osadvance**), `One Hand Sword Combo` (**oscombo**),
  `Sword Fight One` (with a second body), `Run And Swing`.

### One-handed axe (Pro Melee Axe Pack 30FPS)

- Idles: `standing idle` (**axidle**), `standing idle looking ver. 1/2`; `crouch idle`.
- Walk, 4-way: `standing walk forward/back/left/right` (**axwalk**, **axwalkback**, **axwalkleft**,
  **axwalkright**). Run: `standing run forward/back` (**axrun**, **axrunback**). Turns: `standing turn
  left/right 90`.
- Draw and sheath: `unarmed equip underarm` (**axdraw**), `unarmed equip over shoulder`; `standing disarm
  underarm` (**axsheath**), `standing disarm over shoulder`.
- Jump: `standing jump` (**axjump**).
- Attacks: `standing melee attack horizontal` (**axhorizontal**), `backhand` (**axbackhand**), `downward`
  (**axdownward**), `360 high` (**axspinhigh**), `360 low` (**axspinlow**), `combo attack ver. 1/2/3`
  (**axcombo** = ver. 2), `run jump attack` (**axjumpattack**), `kick ver. 1` (**axkick**), `ver. 2`.
- Taunts: `standing taunt battlecry` (**axbattlecry**), `chest thump` (**axthump**).
- Block: `standing block idle` (**axblock**), `standing block react large` (**axblocked**).
- Hits: `standing react large gut` (**axhit**), `from left`, `from right`. Death: none in the pack;
  mixamo-motions `Dying (7)` (**axdeath**).
- Clubs and heavy weapons (mixamo-motions): `One Hand Club Combo`, `Two Hand Club Combo`, `Heavy Weapon
  Swing`, `Smash`, `Bash`.

### Rifle (Rifle 8-Way Locomotion Pack 30FPS = Pro Rifle Pack 30FPS; Lite Rifle; Basic, Slim and Shooter packs)

- Idles: `idle` (**rfidle**), `idle aiming` (**rifleidle**), `idle crouching`, `idle crouching aiming`.
- Walk, 8-way: `walk forward/backward/left/right/forward left/forward right/backward left/backward
  right` (**riflewalk** and its seven).
- Run, 8-way: `run …` the same eight (**riflerun** and its seven). Sprint, 8-way: `sprint forward`
  (**rfsprint**) and seven more.
- Crouch walk, 8-way: `walk crouching …`. Turns: `turn 90 left/right`, `crouching turn 90 left/right`.
- Draw and holster: mixamo-motions `Rifle Pull Out` (**rifleout**), `Rifle Put Away` (**rifleaway**),
  `Grab Rifle From Back`, `Grab Rifle From Behind Shoulder`, `Put Back Rifle`.
- Jumps: `jump up` (**rfjump**), `jump loop` (**rffall**), `jump down` (**rfland**); Basic Shooter `rifle
  jump`; Shooter `jump forward/backward`.
- Fire and reload: Basic Shooter `firing rifle` (**rffire**), `reloading` (**rfreload**), `toss
  grenade`; mixamo-motions `Firing Rifle` (2)–(8), `Shoot Rifle`, `Reload` (2) (3), `Throw Grenade`.
- Melee: mixamo-motions `Rifle Punch` (**rfbutt**), `Bayonet Stab` (**rfstab**), `Rifle Turn And Kick`
  (**rfkick**), `Upward Rifle Butt Strike`.
- Rolls: mixamo-motions `Dive Roll (2)` (**rfroll**), `Running Dive Roll` (**rfdive**), `Roll Left (2)`
  (**rfrollleft**, and mirrored **rfrollright**), `Roll Left`.
- Block: `Rifle Block`, `Block With Rifle`.
- Hits and deaths: mixamo-motions `Hit Reaction (3)` (**rfhit**), `Hit Reaction (6)`, `(7)`, `(9)`,
  `Rifle Hit To Back`; `death from the front` (**rfdeath**), `death from the back`, `from right`,
  `headshot front/back`, `crouching headshot front`; `Rifle Death`, `Rifle Run To Dying`.
- Signals: `Military Signaling` (**rfsignal**), (2)–(5).

### Pistol (Pistol-Handgun Locomotion Pack 30FPS)

- Idle: `pistol idle` (**ptidle**); mixamo-motions `Pistol Idle (3)` aimed (**ptaim**), `Pistol Idle (2)`
  (**ptfidget**), `Pistol Kneeling Idle`.
- Walk: `pistol walk` (**ptwalk**), `pistol walk backward` (**ptwalkback**), `walk arc`, `walk backward arc`.
- Run: `pistol run` (**ptrun**), `pistol run backward` (**ptrunback**), `run arc`, `run backward arc`;
  strafes `pistol strafe` left (**ptstrafeleft**), `pistol strafe (2)` right (**ptstraferight**).
- Kneel: `pistol stand to kneel` (**ptkneel**), `pistol kneeling idle` (**ptkneeling**), `pistol kneel to
  stand` (**ptstand**).
- Jump: `pistol jump` (**ptjump**), `pistol jump (2)` running.
- Draw and holster: mixamo-motions `Drawing Gun` (**ptdraw**), `Pistol To Idle` (**ptholster**).
- Fire and melee: mixamo-motions `Shooting Gun` (**ptfire**), `Shooting Pistol`, `Pistol Whip` (**ptwhip**).
- Hits: mixamo-motions `Hit Reaction (2)` (**pthit**), `Hit Reaction (4)`.

### Bow (Pro Longbow Pack 30FPS; Longbow Locomotion, Longbow Aiming, Lite Longbow)

- Idles: `standing idle 01` (**bwidle**), `02 looking`, `03 examine` (**bwexamine**); mixamo-motions
  `Standing Aim Idle 01` (**bwaim**), `02 Looking`.
- Walk, 4-way: `standing walk forward/back/left/right` (**bwwalk** and three). Aimed: `standing aim walk
  forward/back/left/right` (**bwaimwalk** and three).
- Run, 4-way: `standing run forward/back/left/right` (**bwrun** and three), `run forward stop`. Turns:
  `standing turn 90 left/right`.
- Draw and holster: `standing equip bow` (**bwdraw**), `standing disarm bow` (**bwsheath**).
- Shoot: `standing draw arrow` (**bwnock**), `standing aim overdraw` (**bwoverdraw**), `standing aim recoil`
  (**bwrecoil**); mixamo-motions `Shooting Arrow`.
- Melee and block: `standing melee punch` (**bwpunch**), `standing melee kick` (**bwkick**), `standing
  block` (**bwblock**).
- Dodges: `standing dodge forward/backward/left/right` (**bwdodgeforward**, **bwdodgeback**, and two),
  `standing dive forward` (**bwdive**).
- Falls: `fall a loop` (**bwfall**), `fall a land to standing idle 01` (**bwland**), `fall a land to run
  forward`.
- Hits and deaths: `standing react small from front` (**bwhit**), `from headshot`; `standing death
  backward 01` (**bwdeath**), `forward 01`.

### Torch (mixamo-motions)

- Idles: `Standing Torch Idle 01` (**tcidle**), `02`, `03`, `04`; `Crouch Torch Idle 01/02`.
- Walk, 4-way: `Standing Torch Walk Forward/Back/Left/Right` (**tcwalk** and three), `Walk Forward Stop`,
  `Stop Edge`; crouch: `Crouch Torch Walk Forward/Back/Left/Right`.
- Run, 4-way: `Standing Torch Run Forward/Back/Left/Right` (**tcrun** and three), `Run Forward Stop`, `Stop
  At Edge`. Turns: `Standing Torch Turn Left/Right 90/180`, `Crouch Torch Turn Left/Right 90`.
- Draw: `Unarmed Equip Torch 01` (**tcdraw**), `02`, `Unarmed Grab Torch From Floor`, `From Wall`. No
  put-away (Needs 5).
- Jumps: `Standing Torch Jump` (**tcjump**), `Jump Running`, `Jump Running To Standing Idle`.
- Attacks: `Standing Torch Melee Attack 01` (**tcswing1**), `02` (**tcswing2**), `03` (**tccombo3**),
  `04` (**tccombo4**), `05` (**tccombo5**), `Stab` (**tcstab**).
- Use: `Standing Torch Light Torch` (**tclight**), `From Fire`, `From Wall`, `Burn Webs` (**tcwebs**),
  `Inspect Downward/Forward/Upward` (**tcinspect** = upward).

### Magic (Pro Magic Pack 30FPS; Magic Locomotion; Magic Spell; Lite Magic)

- Idles: `standing idle` (**mgidle**), `02`, `03` (**mgponder**), `04`; `Crouch Idle`.
- Walk, 4-way: `Standing Walk Forward/Back/Left/Right` (**mgwalk** and three); crouch 4-way.
- Run, 4-way: `Standing Run Forward/Back/Left/Right` (**mgrun** and three), `Standing Sprint Forward`.
  Turns: `Standing Turn Left/Right 90`, `Crouch Turn Left/Right 90`.
- Draw: mixamo-motions `Standing 1H Cast Spell 01` (**mgdraw**). No put-away (Needs 5).
- Jumps: `Standing Jump` (**mgjump**), `Standing Jump Running`, `Running Landing`, `Standing Land To
  Standing Idle` (**mgland**).
- Attacks: `Standing 1H Magic Attack 01/02/03` (**mgbolt1**, **mgbolt2**, **mgbolt3**), `Standing 2H
  Magic Attack 01` (**mgblast**) – `05` (**mgfinisher**), `Standing 2H Magic Area Attack 01` (**mgarea**),
  `02` (**mgnova**), `Standing 2H Cast Spell 01` (**mgcast**).
- Block: `Standing Block Start` (**mgblockin**), `Block Idle` (**mgblock**), `Block End` (**mgblockout**),
  `Block React Large` (**mgblocked**).
- Hits and deaths: `Standing React Large From Front` (**mghit**), `Back`, `Left`, `Right`; `Small From`
  the four; `Standing React Death Backward` (**mgdeath**), `Forward`, `Left`, `Right`.

### Other things held

- Briefcase: `Walk With Briefcase`, `Standing W-Briefcase Idle`, `Left/Right/180 Turn W- Briefcase`.
- Box and wheelbarrow: Farming Pack `box idle`, `box turn`, `box walk arc`, `holding idle/walk/turn`,
  `wheelbarrow idle/walk/walk turn/dump`; mixamo-motions `Box Idle`, `Box Jump`, `Jogging With Box`,
  `Carrying`.
- Tools: Farming Pack `watering`, `plant tree`, `dig and plant seeds`, `pick fruit`, `pull plant`, `cow
  milking`; mixamo-motions `Digging`, `Harvesting`.
- Phone and tablet: `Talking On A Cell Phone`, `Texting`, `Texting And Walking`, `Standing Using
  Touchscreen Tablet`.
- Knife and daggers: `Knife Idle`, `Double Dagger Stab`, `Stabbing` (2) (3), `Dual Weapon Combo`.
- Spear and staff: no pack. `Pike Walk` is the one pole clip.
- Sports: Golf Pack (20: drive, chip, putt), Soccer Game Pack 30FPS (54: kicks, headers, goalkeeper),
  mixamo-motions baseball (17), football (5).
