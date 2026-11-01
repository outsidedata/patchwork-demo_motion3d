// yard's mod for kinematics3d (`world.kinematics3d.mods.states: ['yard']`, with `yard` in
// `world.shipped.plugins`): the game's own state words, which a move's `when` in the X Bot's motion3d
// file names.
//   fast   the run key held (the `player` row's `fast`)
//   guard  the guard key held (its `guard`): a stance blocks, or strafes facing the way the camera looks
//   near   a space offers the body an activity (motion3d's `offered`), so the use key uses it and
//          does not roll
import type { Row } from '#engine/engine.ts'

export const states = () => ({
  fast: (me: Row) => me.data.fast === true,
  guard: (me: Row) => me.data.guard === true,
  near: (me: Row) => Array.isArray(me.data.offered) && me.data.offered.length > 0,
})
