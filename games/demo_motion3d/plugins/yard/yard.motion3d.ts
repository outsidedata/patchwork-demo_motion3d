// yard's mod for motion3d (`world.motion3d.mods.object: 'yard'`, with `yard` in
// `world.shipped.plugins`): `object(plugins, space)`, the frame a space is drawn in this frame, for the
// one space of the yard that moves, the car's (`carzone`): the frame of its car as solids draws the car's
// first part, its part's own place on its row taken off and the space's put on. Undefined for every
// other space, which stands still where its row does, and for a car not drawn yet; solids is listed
// before motion3d, which checks it.
import type { Object3D } from 'three'
import type { Plugins } from '#engine/browser.ts'

export function object(plugins: Plugins, space: number): Object3D | undefined {
  const zone = plugins.wire.rows.find(r => r.id === space)
  if (zone?.kind !== 'carzone') return undefined
  const car = plugins.wire.rows.find(r => r.id === zone.data.car)
  const part = car && plugins.wire.rows.find(r => r.id === car.data.parts[0])
  const drawn: Object3D | undefined = part && plugins.solids.group(part.id)
  if (!part || !drawn) return undefined
  const T = plugins.render3d.THREE
  const frame = (d: { pos: number[]; yaw: number }) => new T.Matrix4().compose(new T.Vector3(...d.pos), new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), d.yaw), new T.Vector3(1, 1, 1))
  drawn.updateWorldMatrix(true, false)
  const p = new T.Vector3(), q = new T.Quaternion()
  drawn.matrixWorld.decompose(p, q, new T.Vector3())
  const out = new T.Object3D()
  new T.Matrix4().compose(p, q, new T.Vector3(1, 1, 1)).multiply(frame(part.data).invert()).multiply(frame(zone.data)).decompose(out.position, out.quaternion, out.scale)
  out.updateMatrixWorld(true)
  return out
}
