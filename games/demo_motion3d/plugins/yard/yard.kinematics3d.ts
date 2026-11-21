// yard's mod for kinematics3d (`world.kinematics3d.mods.states: ['yard']`, with `yard` in
// `world.shipped.plugins`): the game's own state words, which a move's `when` in the X Bot's motion3d
// file names.
//   fast   the run key held (the `player` row's `fast`)
//   guard  the guard key held (its `guard`): a stance blocks, or strafes facing the way the camera looks
//   near   a space offers the body an activity (motion3d's `offered`), so the use key uses it and
//          does not roll
//   armed  a weapon's stance is up: the upper half holds one of the player definition's `weapons`, or
//          its aim (`aimOf`), so the legs play that stance's own moves and not the unarmed walk's
import type { Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export const states = () => ({
  fast: (me: Row) => me.data.fast === true,
  guard: (me: Row) => me.data.guard === true,
  near: (me: Row) => Array.isArray(me.data.offered) && me.data.offered.length > 0,
  armed: (me: Row, w: W) => {
    const k = def(w, me.kind)
    const u = me.data.upperMotion
    return typeof u === 'string' && (k.weapons.includes(u) || Object.values(k.aimOf as Record<string, string>).includes(u))
  },
})
