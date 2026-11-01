// jumppad's mod for kinematics3d (`world.kinematics3d.mods.behaviors: [..., 'jumppad']`, with `jumppad`
// in `world.shipped.plugins`): `launch`, `{ launch: <target> }`, wrapping the target the body plays
// against and answering `at`, `nearest` and `ways` through it. A body held up by its target and not
// sliding is given the `velocity` of the pad it is on (the row of its motion3d `space`), whole, and left
// where it is; kinematics3d's gravity takes it from there.
import { at, nearest, ways, type Behavior, type Target } from '#plugins/kinematics3d/kinematics3d.sim.ts'

const wrapping = (shape: unknown) => shape as Target

const launch: Behavior = {
  at: (shape, place, me, w) => at(w, wrapping(shape), place, me),
  nearest: (shape, point, me, w) => nearest(w, wrapping(shape), point, me),
  ways: (shape, place, me, w) => ways(w, wrapping(shape), place, me),
  step(_shape, place, _want, _dt, me, w) {
    const d = me.data
    if (d.grounded !== false && !d.sliding) d.vel = [...w.get(d.space).data.velocity]
    return place
  },
}

export const behaviors = (): Record<string, Behavior> => ({ launch })
